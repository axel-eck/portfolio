import { loadWritings } from '../utils/writings'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const locale = query.locale === 'en' ? 'en' : 'fr'

  return await loadWritings(locale)
})
