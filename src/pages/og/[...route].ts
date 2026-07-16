import { OGImageRoute } from 'astro-og-canvas'
import { getCollection } from 'astro:content'
import config from '@/site-config'

const staticPages: Record<string, { title: string; description?: string }> = {
  home: { title: config.title, description: config.description },
  news: { title: 'News', description: 'Research milestones, talks, papers, and project updates.' },
  cv: { title: 'CV', description: 'Curriculum vitae' },
  publications: { title: 'Publications', description: 'Journal articles, conference papers, and other research output.' },
  projects: { title: 'Projects', description: 'Research software, controllers, and tools.' },
  about: { title: 'About', description: `About ${config.author}` },
  search: { title: 'Search', description: 'Search the site.' }
}

const newsEntries = await getCollection('news')
const newsPages = Object.fromEntries(
  newsEntries.map((entry) => [
    `news/${entry.id}`,
    { title: entry.data.title, description: config.author }
  ])
)

const pages = { ...staticPages, ...newsPages }

// Vendored locally (src/assets/og-fonts/) so the build never fetches fonts
// over the network — astro-og-canvas's default font option points at a
// remote URL, which we deliberately avoid.
const fonts = [
  './src/assets/og-fonts/noto-sans-latin-400.ttf',
  './src/assets/og-fonts/noto-sans-latin-700.ttf'
]

export const { getStaticPaths, GET } = await OGImageRoute({
  pages,
  getImageOptions: (_path, page: { title: string; description?: string }) => ({
    title: page.title,
    description: page.description,
    bgGradient: [[10, 10, 18]],
    border: { color: [56, 189, 248], width: 4, side: 'block-end' },
    font: {
      title: { color: [250, 250, 250], size: 64, weight: 'Bold' },
      description: { color: [180, 190, 205], size: 32 }
    },
    fonts,
    padding: 80
  })
})
