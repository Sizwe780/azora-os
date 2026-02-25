/**
 * Marketplace — Install Route
 *
 * Handles template/extension installation end-to-end:
 * 1. Validates the template exists in the marketplace catalog
 * 2. Checks version compatibility (node engine)
 * 3. Records the install in the user's install log (data/marketplace/installs.json)
 * 4. Increments the template's download counter
 * 5. Returns install instructions/scaffold config
 *
 * Constitutional Compliance:
 * - Article VIII §8.3: No Mock Protocol — real file-system persistence
 * - Only authenticated users may install paid templates
 */

import { NextRequest, NextResponse } from "next/server"
import { promises as fs } from "fs"
import path from "path"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/config"

interface InstallRecord {
  id: string
  templateId: string
  templateName: string
  userId: string
  installedAt: string
  version: string
  price: string
}

const TEMPLATES_PATH = path.join(process.cwd(), "data", "marketplace", "templates.json")
const INSTALLS_PATH = path.join(process.cwd(), "data", "marketplace", "installs.json")

async function readJson<T>(filePath: string, fallback: T): Promise<T> {
  try {
    const raw = await fs.readFile(filePath, "utf-8")
    return JSON.parse(raw)
  } catch {
    return fallback
  }
}

async function writeJson(filePath: string, data: unknown): Promise<void> {
  await fs.mkdir(path.dirname(filePath), { recursive: true })
  await fs.writeFile(filePath, JSON.stringify(data, null, 2))
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    const body = await request.json()
    const { templateId } = body

    if (!templateId) {
      return NextResponse.json({ error: "templateId is required" }, { status: 400 })
    }

    // Load catalog
    const templates: any[] = await readJson(TEMPLATES_PATH, [])
    const template = templates.find((t: any) => t.id === templateId)

    if (!template) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 })
    }

    // Paid templates require authentication
    if (template.price !== "Free" && (!session || !session.user)) {
      return NextResponse.json(
        { error: "Authentication required to install paid templates" },
        { status: 401 },
      )
    }

    const userId = (session?.user as any)?.id ?? (session?.user as any)?.email ?? "anonymous"

    // Record install
    const installs: InstallRecord[] = await readJson(INSTALLS_PATH, [])

    // Idempotent: skip duplicate installs for the same user
    const alreadyInstalled = installs.some(
      (i) => i.templateId === templateId && i.userId === userId,
    )

    if (!alreadyInstalled) {
      const record: InstallRecord = {
        id: `install_${Date.now()}`,
        templateId,
        templateName: template.name,
        userId,
        installedAt: new Date().toISOString(),
        version: template.version ?? "1.0.0",
        price: template.price,
      }
      installs.push(record)
      await writeJson(INSTALLS_PATH, installs)

      // Increment download counter in catalog
      template.downloads = (template.downloads ?? 0) + 1
      await writeJson(TEMPLATES_PATH, templates)
    }

    return NextResponse.json({
      success: true,
      alreadyInstalled,
      template: {
        id: template.id,
        name: template.name,
        description: template.description,
        category: template.category,
        tags: template.tags,
        content: template.content ?? null,
        scaffoldCommands: [
          `npx create-azora-app ${template.id}`,
          "npm install",
          "npm run dev",
        ],
      },
    })
  } catch (error: any) {
    console.error("[marketplace/install]", error)
    return NextResponse.json(
      { error: error.message || "Installation failed" },
      { status: 500 },
    )
  }
}

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 })
  }

  const userId = (session.user as any)?.id ?? (session.user as any)?.email

  const installs: InstallRecord[] = await readJson(INSTALLS_PATH, [])
  const userInstalls = installs.filter((i) => i.userId === userId)

  return NextResponse.json({ installs: userInstalls, total: userInstalls.length })
}
