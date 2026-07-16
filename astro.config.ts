import { rehypeHeadingIds } from '@astrojs/markdown-remark'
import AstroPureIntegration from 'astro-pure'
import { defineConfig } from 'astro/config'
import rehypeKatex from 'rehype-katex'
import remarkMath from 'remark-math'

// Local integrations
import rehypeAutolinkHeadings from './src/plugins/rehype-auto-link-headings.ts'
// Shiki
import {
  addCollapse,
  addCopyButton,
  addLanguage,
  addTitle,
  updateStyle
} from './src/plugins/shiki-custom-transformers.ts'
import {
  transformerNotationDiff,
  transformerNotationHighlight,
  transformerRemoveNotationEscape
} from './src/plugins/shiki-offical/transformers.ts'
import config from './src/site.config.ts'

// https://astro.build/config
export default defineConfig({
  // [Basic]
  site: 'https://mathieu-celerier.github.io',
  // Deploy to a sub path
  // https://astro-pure.js.org/docs/setup/deployment#platform-with-base-path
  // base: '/astro-pure/',
  trailingSlash: 'never',
  // root: './my-project-directory',
  // server: { host: true },

  // [Assets]
  image: {
    responsiveStyles: true,
    service: {
      entrypoint: 'astro/assets/services/sharp'
    }
  },

  // [Markdown]
  markdown: {
    remarkPlugins: [remarkMath],
    rehypePlugins: [
      [rehypeKatex, {}],
      rehypeHeadingIds,
      [
        rehypeAutolinkHeadings,
        {
          behavior: 'append',
          properties: { className: ['anchor'] },
          content: { type: 'text', value: '#' }
        }
      ]
    ],
    // https://docs.astro.build/en/guides/syntax-highlighting/
    shikiConfig: {
      themes: {
        light: 'github-light',
        dark: 'github-dark'
      },
      transformers: [
        // Official transformers
        transformerNotationDiff(),
        transformerNotationHighlight(),
        transformerRemoveNotationEscape(),
        // Custom transformers
        updateStyle(),
        addTitle(),
        addLanguage(),
        addCopyButton(2000), // timeout in ms
        addCollapse(15) // max lines that needs to collapse
      ]
    }
  },

  // [Integrations]
  integrations: [
    // astro-pure will automatically add sitemap, mdx & unocss
    // sitemap(),
    // mdx(),
    AstroPureIntegration(config)
    // Compress recommend
    // https://docs.astro.build/en/guides/integrations-guide/partytown/
  ],

  // [Experimental]
  experimental: {
    // Allow compatible editors to support intellisense features for content collection entries
    // https://docs.astro.build/en/reference/experimental-flags/content-intellisense/
    contentIntellisense: true,
    // Enable SVGO optimization for SVG assets
    // https://docs.astro.build/en/reference/experimental-flags/svg-optimization/
    svgo: true,
    // Enable font preloading and optimization
    // https://docs.astro.build/en/reference/experimental-flags/fonts/
    // Self-hosted locally (src/assets/fonts/satoshi) instead of fetched from the
    // Fontshare API, so builds are reproducible offline and don't retry a network
    // call on every dev/build run.
    fonts: [
      {
        provider: 'local',
        name: 'Satoshi',
        cssVariable: '--font-satoshi',
        variants: [
          { weight: 400, style: 'normal', src: ['./src/assets/fonts/satoshi/satoshi-400-normal.woff2'] },
          { weight: 400, style: 'italic', src: ['./src/assets/fonts/satoshi/satoshi-400-italic.woff2'] },
          { weight: 500, style: 'normal', src: ['./src/assets/fonts/satoshi/satoshi-500-normal.woff2'] },
          { weight: 500, style: 'italic', src: ['./src/assets/fonts/satoshi/satoshi-500-italic.woff2'] }
        ]
      }
    ]
  }
})
