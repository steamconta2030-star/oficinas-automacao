import { readdir, readFile } from 'node:fs/promises'
import { extname, join } from 'node:path'

const roots = ['src', 'supabase', 'scripts']
const extensions = new Map([
  ['.ts', 'TypeScript'],
  ['.tsx', 'TSX'],
  ['.css', 'CSS'],
  ['.sql', 'SQL'],
  ['.js', 'JavaScript'],
  ['.mjs', 'JavaScript'],
])

const totals = new Map()
let files = 0

async function walk(path) {
  const entries = await readdir(path, { withFileTypes: true })
  for (const entry of entries) {
    const fullPath = join(path, entry.name)
    if (entry.isDirectory()) {
      await walk(fullPath)
      continue
    }

    const language = extensions.get(extname(entry.name))
    if (!language) continue

    const content = await readFile(fullPath, 'utf8')
    const lines = content === '' ? 0 : content.split(/\r?\n/).length
    totals.set(language, (totals.get(language) ?? 0) + lines)
    files += 1
  }
}

for (const root of roots) {
  try {
    await walk(root)
  } catch (error) {
    if (error?.code !== 'ENOENT') throw error
  }
}

const totalLines = [...totals.values()].reduce((sum, value) => sum + value, 0)
console.log('Code metrics')
console.log('------------')
for (const [language, lines] of [...totals.entries()].sort((a, b) => b[1] - a[1])) {
  console.log(`${language.padEnd(12)} ${String(lines).padStart(6)} lines`)
}
console.log('------------')
console.log(`${String(files).padStart(3)} source files | ${totalLines} total lines`)
