import { promises as fs } from 'node:fs'
import { join } from 'node:path'
import { marked } from 'marked'

export interface Writing {
  slug: string
  title: string
  date: string
  tags: string[]
  excerpt: string
  html: string
}

export type WritingLocale = 'fr' | 'en'

function parseHeader(raw: string): { meta: Record<string, string>, body: string } {
  // header ends at the first line that is 3+ dashes
  const lines = raw.replace(/\r\n/g, '\n').split('\n')
  let sepIdx = -1
  for (let i = 0; i < lines.length; i++) {
    if (/^-{3,}\s*$/.test(lines[i]!)) { sepIdx = i; break }
  }
  const headerLines = sepIdx === -1 ? [] : lines.slice(0, sepIdx)
  const bodyLines = sepIdx === -1 ? lines : lines.slice(sepIdx + 1)

  const meta: Record<string, string> = {}
  for (const line of headerLines) {
    const m = line.match(/^(\w+)\s*:\s*(.+)\s*$/)
    if (m) meta[m[1]!.toLowerCase()] = m[2]!.trim()
  }
  return { meta, body: bodyLines.join('\n').trim() }
}

function plainExcerpt(body: string, max = 220): string {
  const text = body
    .replace(/```[\s\S]*?```/g, '')
    .replace(/[#>*_`[\]]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
  return text.length > max ? text.slice(0, max).trimEnd() + '…' : text
}

export async function loadWritings(locale: WritingLocale): Promise<Writing[]> {
  const dir = join(process.cwd(), 'content/writings', locale)
  let files: string[] = []
  try {
    files = (await fs.readdir(dir)).filter(f => f.endsWith('.md'))
  } catch {
    return []
  }

  const out: Writing[] = []
  for (const name of files) {
    const raw = await fs.readFile(join(dir, name), 'utf-8')
    const { meta, body } = parseHeader(raw)
    const html = await marked.parse(body, { gfm: true, breaks: false })
    out.push({
      slug: name.replace(/\.md$/, ''),
      title: meta.title ?? name.replace(/\.md$/, ''),
      date: meta.date ?? '',
      tags: (meta.tags ?? '').split(',').map(t => t.trim()).filter(Boolean),
      excerpt: plainExcerpt(body),
      html,
    })
  }
  return out.sort((a, b) => (b.date || '').localeCompare(a.date || ''))
}
