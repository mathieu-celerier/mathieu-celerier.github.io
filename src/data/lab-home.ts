/**
 * The homepage is intentionally driven by this small research snapshot.
 * Update these entries as the work evolves; the surrounding visual identity
 * is independent from any single project or method.
 */
export const labSnapshot = {
  updated: 'SEPTEMBER 2026',
  inquiry: 'Can a robot learn to take over one partner’s role in collaborative insertion?',
  note: 'Current postdoctoral project: learning a relative intent action from causal robot state, interaction history, and online partner estimates in a simulation-first insertion benchmark.',
  heroTitle: 'Learning collaborative insertion',
  heroNote:
    'A living simulation-to-robot study of role observability, action representation, closed-loop learning, and the failures between them.'
} as const

export const researchTracks = [
  {
    id: 'trajectory',
    index: '01',
    status: 'PHD WORK',
    tone: 'thesis',
    title: 'Online motion generation',
    question: 'Disturbance-aware minimum-jerk trajectories.',
    detail:
      'A normalized, jerk-bounded formulation replans from the robot’s current state toward a known target during sustained physical contact.'
  },
  {
    id: 'control',
    index: '02',
    status: 'PHD WORK',
    tone: 'thesis',
    title: 'Compliance and safety',
    question: 'Selective compliance inside a torque-control QP.',
    detail:
      'External-force compensation, task- and direction-level Γₖ, and torque, position, velocity, and collision constraints are combined in one controller and evaluated on a Kinova Gen3.'
  },
  {
    id: 'prediction',
    index: '03',
    status: 'POSTDOC',
    tone: 'current',
    title: 'Learning collaborative roles',
    question: 'Learning relative intent from causal interaction history.',
    detail:
      'A policy replaces one partner in collaborative insertion using robot state, force history, online partner estimates, and an intent action expressed relative to its own hand.'
  }
] as const

export const openQuestions = [
  'Can a learned partner lead reliably across both soft and stiff interaction regimes?',
  'Which causal interaction statistics are sufficient to distinguish a collaborator’s role?',
  'Which simulation gains survive deterministic serving and physical transfer?'
] as const
