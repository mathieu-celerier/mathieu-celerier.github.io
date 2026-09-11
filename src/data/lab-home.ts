/**
 * The homepage is intentionally driven by this small research snapshot.
 * Update these entries as the work evolves; the surrounding visual identity
 * is independent from any single project or method.
 */
export const labSnapshot = {
  updated: 'SEPTEMBER 2026',
  inquiry:
    'Can a robot predict future motion and interaction forces during collaborative manipulation?',
  note: 'Current postdoctoral project: building a 3D collaborative manipulation benchmark with changing information conditions, synchronized force and state logging, and short-horizon predictive models.'
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
    title: 'Predictive collaboration',
    question: 'Predicting motion and force in pHRC.',
    detail:
      'Current direction: learn short-horizon task-state and interaction-force dynamics from collaborative manipulation data.'
  }
] as const

export const openQuestions = [
  'Can future interaction forces be predicted from task state, robot commands, and information conditions?',
  'Can force prediction adapt compliance before physical conflict occurs?',
  'Do role, effort sharing, or disagreement improve predictions of collaborative interaction?'
] as const
