/** @jest-environment node */

/**
 * Tests for Maker Lab — Preview & Export endpoints
 * (Generate endpoint requires AI SDK which isn't available in tests)
 */

import { POST as previewPOST } from '@/app/api/maker-lab/preview/route'
import { POST as exportPOST } from '@/app/api/maker-lab/export/route'

function makePostRequest(body: Record<string, unknown>) {
  return { json: () => Promise.resolve(body) } as any
}

const sampleFiles = [
  { path: 'index.html', content: '<html><body>Hello</body></html>', language: 'html' },
  { path: 'src/App.tsx', content: 'export default function App() { return <div>Hello</div> }', language: 'tsx' },
  { path: 'src/index.css', content: 'body { margin: 0; }', language: 'css' },
]

describe('Maker Lab Preview (/api/maker-lab/preview)', () => {
  it('should return HTML preview when index.html exists', async () => {
    const res = await previewPOST(makePostRequest({ files: sampleFiles }))
    const data = await res.json()
    expect(data.type).toBe('html')
    expect(data.preview).toContain('Hello')
    expect(data.sandbox).toBeDefined()
    expect(data.sandbox.permissions).toContain('allow-scripts')
  })

  it('should generate React preview when no index.html', async () => {
    const reactFiles = sampleFiles.filter((f) => f.path !== 'index.html')
    const res = await previewPOST(makePostRequest({ files: reactFiles }))
    const data = await res.json()
    expect(data.type).toBe('react-preview')
    expect(data.preview).toContain('importmap')
    expect(data.preview).toContain('react')
  })

  it('should return 400 for missing files', async () => {
    const res = await previewPOST(makePostRequest({}))
    expect(res.status).toBe(400)
  })

  it('should return 400 for empty files array', async () => {
    const res = await previewPOST(makePostRequest({ files: [] }))
    expect(res.status).toBe(400)
  })
})

describe('Maker Lab Export (/api/maker-lab/export)', () => {
  it('should export for download by default', async () => {
    const res = await exportPOST(makePostRequest({
      files: sampleFiles,
      projectName: 'test-project',
    }))
    const data = await res.json()
    expect(data.target).toBe('download')
    expect(data.projectName).toBe('test-project')
    expect(data.totalFiles).toBe(3)
    expect(data.totalSize).toBeGreaterThan(0)
  })

  it('should generate StackBlitz export', async () => {
    const res = await exportPOST(makePostRequest({
      files: sampleFiles,
      projectName: 'sb-project',
      target: 'stackblitz',
    }))
    const data = await res.json()
    expect(data.target).toBe('stackblitz')
    expect(data.project).toBeDefined()
    expect(data.project.files).toBeDefined()
  })

  it('should generate CodeSandbox export', async () => {
    const res = await exportPOST(makePostRequest({
      files: sampleFiles,
      target: 'codesandbox',
    }))
    const data = await res.json()
    expect(data.target).toBe('codesandbox')
    expect(data.parameters).toBeDefined()
    expect(data.parameters.files).toBeDefined()
  })

  it('should return 400 for missing files', async () => {
    const res = await exportPOST(makePostRequest({ projectName: 'no-files' }))
    expect(res.status).toBe(400)
  })
})
