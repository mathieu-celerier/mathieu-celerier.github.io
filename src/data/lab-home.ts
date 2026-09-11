/**
 * The homepage is intentionally driven by this small research snapshot.
 * Update these entries as the work evolves; the surrounding visual identity
 * is independent from any single project or method.
 */
export const labSnapshot = {
  updated: 'SEPTEMBER 2026',
  inquiry: 'How can robots remain capable, legible, and safe as people reshape their motion?',
  note: 'My current work starts with control and physical interaction. Questions around how people interpret that response are the next territory to investigate.'
} as const

export const researchTracks = [
  {
    id: 'motion',
    index: '01',
    status: 'FOUNDATION',
    title: 'Motion',
    question: 'How should a robot move when the world refuses to stay still?',
    detail: 'Whole-body and torque control for motion that can adapt in real time.'
  },
  {
    id: 'constraints',
    index: '02',
    status: 'ACTIVE',
    title: 'Constraints',
    question: 'How can responsive behavior keep hard safety guarantees?',
    detail: 'Optimization-based control that keeps physical limits explicit.'
  },
  {
    id: 'interaction',
    index: '03',
    status: 'EMERGING',
    title: 'Interaction',
    question: 'What does a robot communicate through its physical response?',
    detail: 'An open direction around human guidance, anticipation, and interpretation.'
  }
] as const

export const openQuestions = [
  'When should a robot resist—and when should it yield?',
  'Can safety constraints remain understandable during interaction?',
  'How do physical responses shape a person’s next action?'
] as const
