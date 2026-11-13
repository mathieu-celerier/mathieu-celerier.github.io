import { renderInline } from './tex.js'

interface PublicationLike {
  venue?: string
  type: string
  year: number
  status: string
}

const typeLabels: Record<string, string> = {
  journal: 'Journal',
  conference: 'Conference',
  workshop: 'Workshop',
  preprint: 'Preprint',
  thesis: 'Thesis',
  demo: 'Demo',
  other: 'Other'
}

const pendingLabels: Record<string, string> = {
  submitted: 'Manuscript submitted',
  'in-revision': 'Manuscript in revision',
  ongoing: 'Ongoing work'
}

/** Venue name without the year BibTeX often carries at either end ("2026 IEEE/RSJ …", "… (RSS) 2025"). */
export function venueName(venue?: string): string | undefined {
  const cleaned = venue
    ?.replace(/^\s*(19|20)\d{2}\s+/, '')
    .replace(/\s+(19|20)\d{2}\s*$/, '')
    .trim()
  return cleaned || undefined
}

/**
 * Where a record appeared, or what it is while it has no venue. A manuscript that is not out yet
 * is never labelled with a publication type it has not earned.
 */
export function venueOrStatus(data: PublicationLike): string {
  const venue = venueName(data.venue)
  if (venue) return data.status === 'accepted' ? `${venue} · to appear` : venue
  return pendingLabels[data.status] ?? typeLabels[data.type] ?? data.type
}

/** Record kind shown as a badge: anything without a venue yet is a manuscript. */
export function recordKind(data: PublicationLike): string {
  return data.status in pendingLabels ? 'Manuscript' : (typeLabels[data.type] ?? data.type)
}

/** Publication prose is stored as plain text; typeset the compliance matrix wherever it is named. */
export function typesetProse(text: string): string {
  return renderInline(
    text
      .replace(/\$/g, '\\$')
      .replace(/\(I − Γₖ\)/g, '$(I - \\Gamma_k)$')
      .replace(/Γₖ/g, '$\\Gamma_k$')
  )
}
