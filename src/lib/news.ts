import type { CollectionEntry } from 'astro:content'

const MORE_MARKER = '{/* more */}'

/** Text of a news entry's body before the "more" marker (used as a summary/description). */
export function newsSummary(entry: CollectionEntry<'news'>, moreMarker = MORE_MARKER): string {
  const body = entry.body ?? ''
  return (body.split(moreMarker)[0] ?? '').trim()
}

/** Whether a news entry has its own dedicated page at /news/<id>. */
export function newsHasDedicatedPage(entry: CollectionEntry<'news'>, moreMarker = MORE_MARKER): boolean {
  const body = entry.body ?? ''
  return entry.data.hasPage === true || body.includes(moreMarker) || Boolean(entry.data.externalUrl)
}

/** Canonical link for a news entry: external URL if set, else its dedicated page, else the list page. */
export function newsLink(entry: CollectionEntry<'news'>, moreMarker = MORE_MARKER): string {
  if (entry.data.externalUrl) return entry.data.externalUrl
  if (newsHasDedicatedPage(entry, moreMarker)) return `/news/${entry.id}`
  return '/news'
}
