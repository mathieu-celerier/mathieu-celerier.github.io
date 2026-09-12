export const explicitCompliance = {
  updated: 'September 2026',
  status: 'Manuscript in revision · venue undecided',
  question:
    'How can a torque-controlled robot remain precise where a task demands it, yield where contact demands it, and keep hard limits active in both cases?',
  complianceCases: [
    {
      value: 'Γₖ = 0',
      title: 'Preserve the nominal task',
      note: 'Estimated external effort is compensated; the selected task direction remains rigid.'
    },
    {
      value: '0 < Γₖ < I',
      title: 'Shape the response',
      note: 'Each task direction can retain a chosen fraction of the force-induced motion.'
    },
    {
      value: 'Γₖ = I',
      title: 'Follow the contact',
      note: 'The task retains the external-force response and becomes insensitive to estimation error.'
    }
  ],
  limits: [
    'The experiments characterize control behavior and physical response; they are not a study of the participant’s subjective experience.',
    'The force-estimation architecture has assumptions and delay; it is not presented as a novel estimator.',
    'Compliance, stiffness, and apparent inertia are distinct quantities even when they alter the felt interaction together.',
    'The virtual-door experiment currently uses a scripted operator wrench; hardware validation remains an open item.'
  ]
} as const

export const collaborativeInsertion = {
  updated: '9 September 2026',
  status: 'Simulation-first · physical data collection paused',
  question:
    "Can a policy replace one person's contribution while continuing to collaborate with the other?",
  roles: [
    {
      name: 'Partner A',
      role: 'Demonstrator',
      action: 'Acts upstream of the wrist force/torque sensor',
      signal: 'Joint-torque residual',
      replacement: 'Target behavior for the learned policy'
    },
    {
      name: 'Partner B',
      role: 'Collaborator',
      action: 'Acts on the shared tool downstream of the sensor',
      signal: 'Measured tool wrench',
      replacement: 'Remains in the loop with the robot'
    }
  ],
  snapshot: [
    {
      value: '85.6%',
      label: 'insertions seated, closed loop in simulation',
      note: 'Overall rate across six interaction regimes, from a paired evaluation with verified policy serving.'
    },
    {
      value: '1236',
      label: 'training episodes',
      note: 'Collected from two structurally different simulated partners across the regime matrix.'
    },
    {
      value: '0.00%',
      label: 'starved policy ticks',
      note: 'Serving health is measured per episode and reported with every result, not assumed.'
    }
  ],
  stages: [
    [
      '01',
      'Separate the roles',
      'Log the two physical contributions through distinct sensing channels.'
    ],
    [
      '02',
      'Build the dyad',
      'Use two structurally different simulated partners and a controlled insertion scene.'
    ],
    [
      '03',
      'Learn the contribution',
      'Predict Partner A’s intent relative to its own hand state from causal history.'
    ],
    [
      '04',
      'Close the loop',
      'Serve the policy asynchronously inside the real-time controller and measure failures.'
    ]
  ],
  currentLimit:
    'Every figure here comes from a paired evaluation in which policy serving was verified healthy, because an earlier set of results was silently invalidated by a serving slowdown that no status line reported. Serving health is now measured per episode and published alongside the result. Physical demonstrations remain paused for a separate reason: one joint reports identically zero torque under load, and because the whole-arm force estimate consumes joint torques directly, that single channel corrupts the estimate the demonstrator is observed through.',
  next: 'Four rounds of targeted data aggregation moved the hardest regime by 4.4 points at p = 0.63 — inside the noise — so the method is treated as spent rather than repeated. The open options are a different expert, a loss that penalizes commanded stretch directly, or writing up the current result and its ceiling.'
} as const

export const thesis = {
  title: 'Sustained Physical Human-Robot Interaction',
  subtitle:
    'From Human-Inspired Motions to Safe, Adaptable, Precise Control toward Human-Centered Industry',
  defended: '16 December 2025',
  institution: 'University of Montpellier · CNRS–AIST Joint Robotics Laboratory',
  advisors: ['Gentiane Venture', 'Mehdi Benallegue'],
  reviewers: ['Guillaume Morel', 'Arash Ajoudani'],
  abstract:
    'This thesis studies sustained physical interaction as a connected motion-and-control problem. It reformulates minimum-jerk motion as an online, disturbance-aware reference generator; introduces explicit task-dependent compliance inside a force-compensated inverse-dynamics quadratic program; and validates the resulting architecture on a torque-controlled manipulator under sustained contact and multidirectional disturbances.',
  chapters: [
    [
      '01',
      'Problem space',
      'Physical human–robot interaction, safety, sensing, control, and the requirements of sustained contact.'
    ],
    [
      '02',
      'Motion under disturbance',
      'A real-time minimum-jerk formulation with non-zero boundary conditions and bounded jerk.'
    ],
    [
      '03',
      'Explicit compliance',
      'Task- and direction-dependent response to estimated external effort inside a constrained QP.'
    ],
    [
      '04',
      'System implementation',
      'Torque estimation, low-level control, integration, and experimental evaluation on a commercial arm.'
    ],
    [
      '05',
      'Synthesis and perspectives',
      'Stability, adaptive compliance, multi-contact interaction, and integration with planning.'
    ]
  ]
} as const
