import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

const ROOT = process.cwd()

export async function GET() {
  try {
    const scanPaths = ['app', 'components', 'lib', 'pages']
    const files: Array<{ path: string; name: string; size: number }> = []

    async function walk(dir: string) {
      const dirents = await fs.readdir(dir, { withFileTypes: true })
      for (const dirent of dirents) {
        const res = path.resolve(dir, dirent.name)
        if (dirent.isDirectory()) {
          await walk(res)
        } else {
          const rel = path.relative(ROOT, res)
          // Limit to JS/TS/MD/JSON files
          if (/(\.tsx?|\.jsx?|\.mdx?|\.json)$/.test(res)) {
            const stat = await fs.stat(res)
            files.push({ path: rel.replace(/\\/g, '/'), name: dirent.name, size: stat.size })
          }
        }
      }
    }

    for (const p of scanPaths) {
      const abs = path.resolve(ROOT, p)
      try {
        await walk(abs)
      } catch (err) {
        // ignore missing folders
      }
    }

    return NextResponse.json({ files: files.slice(0, 200) })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
