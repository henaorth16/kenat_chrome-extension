/** Map kenat holiday tags to agenda accent classes. */
export function getHolidayColorClass(tags: string[]): string {
  if (tags.includes('public')) return 'cat-public'
  if (tags.includes('muslim')) return 'cat-muslim'
  if (tags.includes('christian')) return 'cat-christian'
  if (tags.includes('religious')) return 'cat-religious'
  return 'cat-other'
}

export function getUserEventColorClass(category: string): string {
  if (category === 'work') return 'cat-work'
  if (category === 'important') return 'cat-important'
  return 'cat-personal'
}
