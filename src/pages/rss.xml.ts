import rss from '@astrojs/rss'
import type { APIContext } from 'astro'
import { getCollection } from 'astro:content'
import config from '@/site-config'
import { newsSummary, newsLink } from '@/lib/news'

export async function GET(context: APIContext) {
  const items = (await getCollection('news')).sort(
    (a, b) => b.data.date.getTime() - a.data.date.getTime()
  )

  return rss({
    title: config.title,
    description: config.description ?? '',
    site: context.site!,
    items: items.map((entry) => ({
      title: entry.data.title,
      pubDate: entry.data.date,
      description: newsSummary(entry) || entry.data.title,
      link: newsLink(entry)
    })),
    customData: `<language>${(config.locale.attrs ?? 'en_US').replace('_', '-')}</language>`
  })
}
