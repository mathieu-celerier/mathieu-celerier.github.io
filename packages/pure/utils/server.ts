import { getCollection, type CollectionEntry } from 'astro:content'

export const prod = import.meta.env.PROD

type BlogEntry = CollectionEntry<'blog'>
type BlogEntries = BlogEntry[]

/** Note: this function filters out draft posts based on the environment */
export async function getBlogCollection(): Promise<BlogEntries> {
  const entries = await getCollection('blog')
  return prod ? entries.filter((e) => !e.data.draft) : entries
}

function getYearFromEntry(entry: BlogEntry): number | undefined {
  const date = entry.data.updatedDate ?? entry.data.publishDate
  return date ? new Date(date).getFullYear() : undefined
}

export function groupCollectionsByYear(collections: BlogEntries): [number, BlogEntries][] {
  const collectionsByYear = collections.reduce((acc, entry) => {
    const year = getYearFromEntry(entry)
    if (year !== undefined) {
      if (!acc.has(year)) acc.set(year, [])
      acc.get(year)!.push(entry)
    }
    return acc
  }, new Map<number, BlogEntries>())

  return Array.from(collectionsByYear.entries()).sort((a, b) => b[0] - a[0])
}

export function sortMDByDate(collections: BlogEntries): BlogEntries {
  return collections.sort((a, b) => {
    const aDate = new Date(a.data.updatedDate ?? a.data.publishDate ?? 0).valueOf()
    const bDate = new Date(b.data.updatedDate ?? b.data.publishDate ?? 0).valueOf()
    return bDate - aDate
  })
}

/** Note: This function doesn't filter draft posts; pass it the result of getBlogCollection() above to do so. */
export function getAllTags(collections: BlogEntries): string[] {
  return collections.flatMap((entry) => entry.data.tags)
}

/** Note: This function doesn't filter draft posts; pass it the result of getBlogCollection() above to do so. */
export function getUniqueTags(collections: BlogEntries): string[] {
  return [...new Set(getAllTags(collections))]
}

/** Note: This function doesn't filter draft posts; pass it the result of getBlogCollection() above to do so. */
export function getUniqueTagsWithCount(collections: BlogEntries): [string, number][] {
  return [
    ...getAllTags(collections).reduce(
      (acc, t) => acc.set(t, (acc.get(t) || 0) + 1),
      new Map<string, number>()
    )
  ].sort((a, b) => b[1] - a[1])
}
