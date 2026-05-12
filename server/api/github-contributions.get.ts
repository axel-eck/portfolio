interface Day {
  date: string
  count: number
  level: 0 | 1 | 2 | 3 | 4
}

interface Source {
  total: { lastYear: number }
  contributions: Day[]
}

export default defineCachedEventHandler(async () => {
  const data = await $fetch<Source>('https://github-contributions-api.jogruber.de/v4/axel-eck?y=last')
  const days = data.contributions

  const active = days.reduce((n, d) => n + (d.count > 0 ? 1 : 0), 0)

  let current = 0
  for (let i = days.length - 1; i >= 0; i--) {
    if (days[i]!.count > 0) current++
    else break
  }

  let longest = 0
  let run = 0
  for (const d of days) {
    if (d.count > 0) {
      run++
      if (run > longest) longest = run
    }
    else {
      run = 0
    }
  }

  return {
    total: data.total.lastYear,
    active,
    current,
    longest,
    days,
  }
}, {
  maxAge: 3600,
  name: 'gh-contributions',
  getKey: () => 'axel-eck',
})
