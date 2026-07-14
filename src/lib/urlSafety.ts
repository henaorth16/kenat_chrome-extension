/** Only allow https image URLs for custom wallpaper. */
export function isSafeImageUrl(raw: string): boolean {
  try {
    const url = new URL(raw.trim())
    if (url.protocol !== 'https:') return false
    return (
      /\.(png|jpe?g|webp|gif|avif|svg)(\?|$)/i.test(url.pathname) ||
      url.hostname.includes('unsplash.com') ||
      url.hostname.startsWith('images.')
    )
  } catch {
    return false
  }
}

export function cssUrl(value: string): string {
  return `url(${JSON.stringify(value)})`
}
