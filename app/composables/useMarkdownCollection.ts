import { marked } from 'marked'

export type MarkdownLocale = 'fr' | 'en'
export type MarkdownSources = Record<string, string>

export interface MarkdownDocument {
  slug: string
  meta: Record<string, string>
  body: string
  html: string
  excerpt: string
  path: string
}

export function resolveMarkdownLocale(localeCode: string): MarkdownLocale {
  return localeCode === 'en' ? 'en' : 'fr'
}

export function parseMarkdownHeader(raw: string): { meta: Record<string, string>, body: string } {
  const lines = raw.replace(/\r\n/g, '\n').split('\n')
  const sepIdx = lines.findIndex(line => /^-{3,}\s*$/.test(line))
  const headerLines = sepIdx === -1 ? [] : lines.slice(0, sepIdx)
  const bodyLines = sepIdx === -1 ? lines : lines.slice(sepIdx + 1)
  const meta: Record<string, string> = {}

  for (const line of headerLines) {
    const match = line.match(/^(\w+)\s*:\s*(.+)\s*$/)
    if (match) meta[match[1]!.toLowerCase()] = match[2]!.trim()
  }

  return { meta, body: bodyLines.join('\n').trim() }
}

export function markdownExcerpt(body: string, max = 220) {
  const text = body
    .replace(/```[\s\S]*?```/g, '')
    .replace(/[#>*_`[\]]/g, '')
    .replace(/\s+/g, ' ')
    .trim()

  return text.length > max ? `${text.slice(0, max).trimEnd()}…` : text
}

export function markdownToHtml(body: string) {
  return marked.parse(body, { gfm: true, breaks: false, async: false }) as string
}

export function loadMarkdownCollection(sources: MarkdownSources, collection: string, localeCode: string): MarkdownDocument[] {
  const locale = resolveMarkdownLocale(localeCode)

  return Object.entries(sources)
    .filter(([path]) => path.includes(`/content/${collection}/${locale}/`))
    .map(([path, raw]) => {
      const name = path.split('/').pop() ?? ''
      const { meta, body } = parseMarkdownHeader(raw)

      return {
        slug: name.replace(/\.md$/, ''),
        meta,
        body,
        html: markdownToHtml(body),
        excerpt: markdownExcerpt(body),
        path,
      }
    })
}

export function csvMeta(value?: string) {
  return (value ?? '')
    .split(',')
    .map(item => item.trim())
    .filter(Boolean)
}
