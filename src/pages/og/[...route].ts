import { getCollection } from 'astro:content'
import { OGImageRoute } from 'astro-og-canvas'

import config from '@/site-config'

const staticPages: Record<string, { title: string; description?: string }> = {
  home: { title: config.title, description: config.description },
  research: {
    title: 'Research',
    description: 'Motion, compliance, safety, and learning for physical human–robot collaboration.'
  },
  'research/explicit-compliance': {
    title: 'Explicit compliance',
    description: 'Task-level compliance, force-aware safety, and constrained torque control.'
  },
  'research/collaborative-insertion': {
    title: 'Collaborative insertion',
    description: 'An evolving simulation-to-robot study of learning a physical partner’s role.'
  },
  'research/thesis': {
    title: 'Doctoral thesis',
    description: 'Sustained Physical Human-Robot Interaction.'
  },
  activity: {
    title: 'Activity',
    description: 'Talks, research notes, publications, and milestones.'
  },
  news: { title: 'News', description: 'Research milestones, talks, papers, and project updates.' },
  cv: { title: 'CV', description: 'Curriculum vitae' },
  publications: {
    title: 'Publications',
    description: 'Journal articles, conference papers, and other research output.'
  },
  projects: { title: 'Projects', description: 'Research software, controllers, and tools.' },
  about: { title: 'About', description: `About ${config.author}` },
  search: { title: 'Search', description: 'Search the site.' },
  talks: { title: 'Talks & Media', description: 'Conference talks and public presentations.' }
}

const newsEntries = await getCollection('news')
const newsPages = Object.fromEntries(
  newsEntries.map((entry) => [
    `news/${entry.id}`,
    { title: entry.data.title, description: config.author }
  ])
)

const pubEntries = await getCollection('publications')
const pubPages = Object.fromEntries(
  pubEntries.map((entry) => [
    `publications/${entry.data.bibkey}`,
    { title: entry.data.title, description: entry.data.authors }
  ])
)

const pages = { ...staticPages, ...newsPages, ...pubPages }

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
    bgGradient: [[250, 248, 244]],
    border: { color: [19, 69, 201], width: 4, side: 'block-end' },
    font: {
      title: { color: [21, 30, 46], size: 64, weight: 'Bold' },
      description: { color: [76, 91, 107], size: 30 }
    },
    fonts,
    padding: 80
  })
})
