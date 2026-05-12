import { access } from 'node:fs/promises'
import { join } from 'node:path'

type CvLocale = 'fr' | 'en'

async function fileExists(paths: string[]) {
  for (const path of paths) {
    try {
      await access(path)
      return true
    } catch {
      // Try the next possible public directory location.
    }
  }

  return false
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const locale: CvLocale = query.locale === 'en' ? 'en' : 'fr'
  const href = `/${locale}/cv.pdf`
  const relativePath = join(locale, 'cv.pdf')
  const cwd = process.cwd()

  const available = await fileExists([
    join(cwd, 'public', relativePath),
    join(cwd, '..', 'public', relativePath),
    join(cwd, '..', '..', 'public', relativePath),
  ])

  return { available, href }
})
