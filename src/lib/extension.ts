/** WebExtension API namespace (Chrome and Firefox both expose `chrome`). */
export function getExtensionApi(): typeof chrome | undefined {
  if (typeof chrome !== 'undefined' && chrome.runtime) return chrome
  return undefined
}

export function getRuntimeId(): string | undefined {
  const id = getExtensionApi()?.runtime?.id
  return typeof id === 'string' ? id : undefined
}

export function isExtensionPage(): boolean {
  if (typeof location === 'undefined') return false
  return (
    location.protocol === 'chrome-extension:' ||
    location.protocol === 'moz-extension:'
  )
}

/** Chrome-only internal favicon API (`favicon` permission). */
export function supportsChromeFaviconApi(): boolean {
  return (
    typeof location !== 'undefined' &&
    location.protocol === 'chrome-extension:' &&
    typeof getRuntimeId() === 'string'
  )
}

export function getFaviconUrl(pageUrl: string, size = 32): string {
  if (supportsChromeFaviconApi()) {
    const id = getRuntimeId()
    return `chrome-extension://${id}/_favicon/?pageUrl=${encodeURIComponent(pageUrl)}&size=${size}`
  }
  return `https://www.google.com/s2/favicons?sz=${size}&domain_url=${encodeURIComponent(pageUrl)}`
}
