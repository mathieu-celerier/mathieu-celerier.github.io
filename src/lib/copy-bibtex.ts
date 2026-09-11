import { showToast } from 'astro-pure/utils'

// One shared module for list and detail pages, including client navigations.
document.addEventListener('click', async (event) => {
  const button = (event.target as Element | null)?.closest<HTMLElement>('[data-copy-bibtex]')
  const href = button?.dataset.copyBibtex
  if (!href) return
  try {
    const response = await fetch(href)
    if (!response.ok) throw new Error('Citation unavailable')
    await navigator.clipboard.writeText(await response.text())
    showToast({ message: 'BibTeX copied to clipboard' })
  } catch {
    showToast({ message: 'Could not copy BibTeX. Use Download .bib instead.' })
  }
})
