import admin from 'firebase-admin'

// Initialize admin SDK once
if (!admin.apps.length) {
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_JSON
  if (serviceAccount) {
    try {
      admin.initializeApp({
        credential: admin.credential.cert(JSON.parse(serviceAccount)),
      })
    } catch (e) {
      console.error('[persistence] failed to init firebase admin', e)
    }
  } else {
    console.warn('[persistence] FIREBASE_SERVICE_ACCOUNT_JSON not set; persistence disabled')
  }
}

const getDb = () => {
  if (admin.apps.length > 0) {
    try {
      return admin.firestore()
    } catch (e) {
      return null
    }
  }
  return null
}

export interface PersistenceStep {
  timestamp: string
  type: 'thought' | 'action' | 'observation' | 'error' | 'result'
  content: string
  toolCall?: { name: string; params: any }
  metadata: { tokensUsed: number; model: string }
}

export interface ExecutionSnapshot {
  activeFiles: string[]
  variables: Record<string, any>
  mcpContext: string
}

export interface ExecutionRecord {
  id: string
  userId: string
  projectId: string
  status: 'idle' | 'running' | 'paused' | 'completed' | 'failed'
  currentStepIndex: number
  trace: PersistenceStep[]
  snapshot: ExecutionSnapshot
  updatedAt?: string
  lastStep?: string
  lastStepType?: PersistenceStep['type']
}

export interface FileSnapshotEntry {
  path: string
  content: string
  updatedAt?: string
}

const encodeFileId = (path: string) =>
  Buffer.from(path, 'utf8').toString('base64url')

const toTimestamp = (value: string | Date) =>
  admin.firestore.Timestamp.fromDate(
    typeof value === 'string' ? new Date(value) : value
  )

// Debounce map for batching file writes per project
const pendingWrites = new Map<string, { files: Map<string, FileSnapshotEntry>; timer: NodeJS.Timeout }>()
const DEBOUNCE_MS = 2000 // 2 second debounce for file batching

function debouncedSyncFiles(projectId: string, filePath: string, content: string) {
  // Get or create pending batch for this project
  let pending = pendingWrites.get(projectId)
  if (!pending) {
    pending = { files: new Map(), timer: null as any }
    pendingWrites.set(projectId, pending)
  }

  // Add/update file in pending batch
  pending.files.set(filePath, { path: filePath, content, updatedAt: new Date().toISOString() })

  // Clear existing timer
  if (pending.timer) {
    clearTimeout(pending.timer)
  }

  // Set new timer to flush after debounce period
  pending.timer = setTimeout(async () => {
    const batch = pending!.files
    pendingWrites.delete(projectId)
    
    // Convert map to array and batch sync
    const files = Array.from(batch.values())
    await syncFileSystemSnapshot(projectId, files)
  }, DEBOUNCE_MS)
}

// Flush pending writes immediately (for tests and shutdown)
export async function flushPendingWrites(projectId?: string): Promise<void> {
  if (projectId) {
    const pending = pendingWrites.get(projectId)
    if (pending) {
      clearTimeout(pending.timer)
      const files = Array.from(pending.files.values())
      pendingWrites.delete(projectId)
      await syncFileSystemSnapshot(projectId, files)
    }
  } else {
    // Flush all projects
    const promises: Promise<void>[] = []
    for (const [pid, pending] of pendingWrites.entries()) {
      clearTimeout(pending.timer)
      const files = Array.from(pending.files.values())
      promises.push(syncFileSystemSnapshot(pid, files))
    }
    pendingWrites.clear()
    await Promise.all(promises)
  }
}

// append a step to the trace and update status/index
export async function syncTraceToFirestore(executionId: string, step: PersistenceStep, status?: ExecutionRecord['status'], stepIndex?: number) {
  const db = getDb()
  if (!db) return
  const ref = db.collection('buildspaces_orchestrations').doc(executionId)
  const now = admin.firestore.Timestamp.fromDate(new Date())
  const update: any = {
    trace: admin.firestore.FieldValue.arrayUnion({
      ...step,
      timestamp: toTimestamp(step.timestamp),
    }),
    updatedAt: now,
    lastStep: step.content,
    lastStepType: step.type,
  }
  if (status) update.status = status
  if (typeof stepIndex === 'number') update.currentStepIndex = stepIndex
  await ref.set(update, { merge: true })
}

// load entire execution record
export async function loadExecutionState(executionId: string): Promise<ExecutionRecord | null> {
  const db = getDb()
  if (!db) return null
  const snap = await db.collection('buildspaces_orchestrations').doc(executionId).get()
  return snap.exists ? (snap.data() as ExecutionRecord) : null
}

export async function upsertExecutionRecord(
  executionId: string,
  data: Partial<ExecutionRecord>
): Promise<void> {
  const db = getDb()
  if (!db) return
  const ref = db.collection('buildspaces_orchestrations').doc(executionId)
  const update: any = {
    ...data,
    updatedAt: admin.firestore.Timestamp.fromDate(new Date()),
  }
  if (data.updatedAt) {
    update.updatedAt = toTimestamp(data.updatedAt)
  }
  await ref.set(update, { merge: true })
}

export async function listExecutionSessions(limit = 10): Promise<ExecutionRecord[]> {
  const db = getDb()
  if (!db) return []
  const snap = await db
    .collection('buildspaces_orchestrations')
    .orderBy('updatedAt', 'desc')
    .limit(limit)
    .get()
  return snap.docs.map((doc) => ({ id: doc.id, ...(doc.data() as ExecutionRecord) }))
}

export async function syncFileToFirestore(
  projectId: string,
  filePath: string,
  content: string
): Promise<void> {
  const db = getDb()
  if (!db) return
  
  // Use debounced batch writes to avoid Firebase quota issues
  debouncedSyncFiles(projectId, filePath, content)
}

export async function syncFileSystemSnapshot(
  projectId: string,
  files: FileSnapshotEntry[]
): Promise<void> {
  const db = getDb()
  if (!db) return
  const ref = db.collection('buildspaces_project_files').doc(projectId)
  const batch = db.batch()
  const now = admin.firestore.Timestamp.fromDate(new Date())

  batch.set(ref, { updatedAt: now, fileCount: files.length }, { merge: true })

  for (const file of files) {
    const fileId = encodeFileId(file.path)
    const fileRef = ref.collection('files').doc(fileId)
    batch.set(
      fileRef,
      {
        path: file.path,
        content: file.content,
        updatedAt: file.updatedAt ? toTimestamp(file.updatedAt) : now,
      },
      { merge: true }
    )
  }

  await batch.commit()
}

export async function getFileSystemSnapshot(
  projectId: string
): Promise<{ files: FileSnapshotEntry[]; updatedAt?: string } | null> {
  const db = getDb()
  if (!db) return null
  const ref = db.collection('buildspaces_project_files').doc(projectId)
  const metaSnap = await ref.get()
  if (!metaSnap.exists) return null

  const filesSnap = await ref.collection('files').get()
  const files = filesSnap.docs.map((doc) => {
    const data = doc.data() as any
    return {
      path: data.path,
      content: data.content ?? '',
      updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : undefined,
    }
  })

  const meta = metaSnap.data() as any
  const updatedAt = meta?.updatedAt?.toDate ? meta.updatedAt.toDate().toISOString() : undefined
  return { files, updatedAt }
}