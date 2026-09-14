// @ts-check
// Planar illustration of the explicit-compliance framework: task dynamics
// ẍ = ë* + Γ Λ⁻¹ F + (I − Γ) J M⁻¹ ε_τ, and its virtual-dynamics generalisation
// rendering a hinged door. Model units: links of length 1, SI otherwise.

/** @typedef {[number, number]} Vec2 */
/** @typedef {[number, number, number, number]} Mat2 row-major [a, b, c, d] */

export const G = 9.81
export const ARM = { l1: 1, l2: 1, m1: 2, m2: 2 }
export const REACH = { min: 0.3, max: 1.95 }
export const VIEW = { originX: 470, originY: 460, scale: 210 }
// Hinge right of the arm, door reaching back toward it; θ from +x, so the panel hangs at 3π/2.
export const DOOR = {
  hinge: /** @type {Vec2} */ ([1.65, 0.75]),
  radius: 0.75,
  rest: Math.PI,
  minAngle: (2 * Math.PI) / 3,
  maxAngle: (3 * Math.PI) / 2
}

/** @param {Vec2} p @returns {Vec2} */
export const toView = (p) => [VIEW.originX + VIEW.scale * p[0], VIEW.originY - VIEW.scale * p[1]]
/** @param {Vec2} p @returns {Vec2} */
export const fromView = (p) => [
  (p[0] - VIEW.originX) / VIEW.scale,
  (VIEW.originY - p[1]) / VIEW.scale
]

/** @param {Mat2} A @param {Mat2} B @returns {Mat2} */
export const mul = (A, B) => [
  A[0] * B[0] + A[1] * B[2],
  A[0] * B[1] + A[1] * B[3],
  A[2] * B[0] + A[3] * B[2],
  A[2] * B[1] + A[3] * B[3]
]
/** @param {Mat2} A @param {Vec2} v @returns {Vec2} */
export const apply = (A, v) => [A[0] * v[0] + A[1] * v[1], A[2] * v[0] + A[3] * v[1]]
/** @param {Mat2} A @returns {Mat2} */
export const transpose = (A) => [A[0], A[2], A[1], A[3]]
/** @param {Mat2} A @returns {Mat2} */
export const inverse = (A) => {
  const det = A[0] * A[3] - A[1] * A[2]
  return [A[3] / det, -A[1] / det, -A[2] / det, A[0] / det]
}
/** @param {Mat2} A @returns {Mat2} */
export const identityMinus = (A) => [1 - A[0], -A[1], -A[2], 1 - A[3]]

/** Eigen-decomposition of a symmetric 2×2 matrix. @param {Mat2} A */
export function eigenSym(A) {
  const mean = (A[0] + A[3]) / 2
  const radius = Math.hypot((A[0] - A[3]) / 2, A[1])
  return { major: mean + radius, minor: mean - radius, angle: 0.5 * Math.atan2(2 * A[1], A[0] - A[3]) }
}

/** @param {Vec2} q */
export function forwardKinematics(q, arm = ARM) {
  /** @type {Vec2} */
  const elbow = [arm.l1 * Math.cos(q[0]), arm.l1 * Math.sin(q[0])]
  /** @type {Vec2} */
  const tip = [
    elbow[0] + arm.l2 * Math.cos(q[0] + q[1]),
    elbow[1] + arm.l2 * Math.sin(q[0] + q[1])
  ]
  return { elbow, tip }
}

/** Elbow-up inverse kinematics; the target is clamped into the reachable annulus. @param {Vec2} p @returns {Vec2} */
export function inverseKinematics(p, arm = ARM) {
  const d = Math.min(arm.l1 + arm.l2 - 1e-6, Math.max(Math.abs(arm.l1 - arm.l2) + 1e-6, Math.hypot(p[0], p[1])))
  const cos2 = (d * d - arm.l1 * arm.l1 - arm.l2 * arm.l2) / (2 * arm.l1 * arm.l2)
  const q2 = -Math.acos(Math.max(-1, Math.min(1, cos2)))
  const q1 = Math.atan2(p[1], p[0]) - Math.atan2(arm.l2 * Math.sin(q2), arm.l1 + arm.l2 * Math.cos(q2))
  return [q1, q2]
}

/** @param {Vec2} q @returns {Mat2} */
export function jacobian(q, arm = ARM) {
  const s1 = Math.sin(q[0]),
    c1 = Math.cos(q[0]),
    s12 = Math.sin(q[0] + q[1]),
    c12 = Math.cos(q[0] + q[1])
  return [-arm.l1 * s1 - arm.l2 * s12, -arm.l2 * s12, arm.l1 * c1 + arm.l2 * c12, arm.l2 * c12]
}

/** Joint-space inertia of two uniform rods. @param {Vec2} q @returns {Mat2} */
export function massMatrix(q, arm = ARM) {
  const lc1 = arm.l1 / 2,
    lc2 = arm.l2 / 2
  const I1 = (arm.m1 * arm.l1 * arm.l1) / 12,
    I2 = (arm.m2 * arm.l2 * arm.l2) / 12
  const c2 = Math.cos(q[1])
  const m22 = I2 + arm.m2 * lc2 * lc2
  const m12 = m22 + arm.m2 * arm.l1 * lc2 * c2
  const m11 = I1 + arm.m1 * lc1 * lc1 + arm.m2 * (arm.l1 * arm.l1 + 2 * arm.l1 * lc2 * c2) + m22
  return [m11, m12, m12, m22]
}

/** Λ⁻¹ = J M⁻¹ Jᵀ, the task-space mobility. @param {Vec2} q @returns {Mat2} */
export function taskInverseInertia(q, arm = ARM) {
  const J = jacobian(q, arm)
  return mul(mul(J, inverse(massMatrix(q, arm))), transpose(J))
}

/** @param {number} alpha @returns {Mat2} */
export const gammaIsotropic = (alpha) => [alpha, 0, 0, alpha]

/** Γ = R diag(γ₁, γ₂) Rᵀ. @param {number} angle @param {number} g1 @param {number} g2 @returns {Mat2} */
export function gammaDirectional(angle, g1, g2) {
  const c = Math.cos(angle),
    s = Math.sin(angle)
  const off = (g1 - g2) * c * s
  return [g1 * c * c + g2 * s * s, off, off, g1 * s * s + g2 * c * c]
}

/**
 * Task acceleration of the compliant QP objective, split into its parts.
 * @param {{ x: Vec2, v: Vec2, reference: Vec2, gamma: Mat2, force: Vec2, torqueError: Vec2, kp: number, kd: number }} p
 */
export function compliantAcceleration({ x, v, reference, gamma, force, torqueError, kp, kd }) {
  const q = inverseKinematics(x)
  /** @type {Vec2} */
  const nominal = [kp * (reference[0] - x[0]) - kd * v[0], kp * (reference[1] - x[1]) - kd * v[1]]
  const shaped = apply(mul(gamma, taskInverseInertia(q)), force)
  const J = jacobian(q)
  const error = apply(mul(identityMinus(gamma), mul(J, inverse(massMatrix(q)))), torqueError)
  /** @type {Vec2} */
  const total = [nominal[0] + shaped[0] + error[0], nominal[1] + shaped[1] + error[1]]
  return { nominal, shaped, error, total, q }
}

/**
 * Semi-implicit Euler step; the reach limit stands in for the safety constraints bounding motion.
 * @param {{ x: Vec2, v: Vec2 }} state
 * @param {{ reference: Vec2, gamma: Mat2, force: Vec2, torqueError: Vec2, kp: number, kd: number }} params
 * @param {number} dt
 */
export function stepCompliant(state, params, dt) {
  const parts = compliantAcceleration({ ...params, x: state.x, v: state.v })
  /** @type {Vec2} */
  let v = [state.v[0] + parts.total[0] * dt, state.v[1] + parts.total[1] * dt]
  /** @type {Vec2} */
  let x = [state.x[0] + v[0] * dt, state.x[1] + v[1] * dt]
  const r = Math.hypot(x[0], x[1])
  let limited = false
  if (r > REACH.max || r < REACH.min) {
    limited = true
    const bound = r > REACH.max ? REACH.max : REACH.min
    const n = /** @type {Vec2} */ ([x[0] / r, x[1] / r])
    x = [n[0] * bound, n[1] * bound]
    const radial = v[0] * n[0] + v[1] * n[1]
    if ((r > REACH.max && radial > 0) || (r < REACH.min && radial < 0)) v = [v[0] - radial * n[0], v[1] - radial * n[1]]
  }
  return { x, v, limited, parts }
}

/** @param {number} theta @returns {Vec2} */
export const doorHandle = (theta, door = DOOR) => [
  door.hinge[0] + door.radius * Math.cos(theta),
  door.hinge[1] + door.radius * Math.sin(theta)
]

/** @typedef {{ inertia: number, mass: number, viscous: number, coulomb: number }} DoorParams */

/** F_v,θ = −m_v g r_c cos θ − b_v θ̇ − c_v sign(θ̇), sign smoothed to avoid chatter. @param {number} theta @param {number} omega @param {DoorParams} p */
export const doorWrench = (theta, omega, p, door = DOOR) =>
  -p.mass * G * (door.radius / 2) * Math.cos(theta) - p.viscous * omega - p.coulomb * Math.tanh(omega / 0.02)

/**
 * Only the arc tangent is compliant (scalar inertia I_v); the other direction is declared rigid,
 * so the handle stays on the arc and the hinge is rendered as stiffness, not as a constraint.
 * @param {{ theta: number, omega: number }} state @param {DoorParams & { force: Vec2 }} p @param {number} dt
 */
export function stepDoor(state, p, dt, door = DOOR) {
  const tangent = [-Math.sin(state.theta), Math.cos(state.theta)]
  const applied = door.radius * (p.force[0] * tangent[0] + p.force[1] * tangent[1])
  const virtual = doorWrench(state.theta, state.omega, p, door)
  let omega = state.omega + ((applied + virtual) / p.inertia) * dt
  let theta = state.theta + omega * dt
  let stop = false
  if (theta < door.minAngle || theta > door.maxAngle) {
    stop = true
    theta = Math.min(door.maxAngle, Math.max(door.minAngle, theta))
    omega = -0.15 * omega
  }
  return { theta, omega, applied, virtual, stop }
}

/** @param {{ theta: number, omega: number }} state @param {DoorParams} p */
export const doorEnergy = (state, p, door = DOOR) =>
  0.5 * p.inertia * state.omega * state.omega + p.mass * G * (door.radius / 2) * Math.sin(state.theta)

/** Spring–damper between the visitor's hand and the end-effector, magnitude-clamped. @param {Vec2} hand @param {Vec2} x @param {Vec2} v */
export function handForce(hand, x, v, stiffness = 60, damping = 4, limit = 30) {
  /** @type {Vec2} */
  const f = [stiffness * (hand[0] - x[0]) - damping * v[0], stiffness * (hand[1] - x[1]) - damping * v[1]]
  const n = Math.hypot(f[0], f[1])
  return n > limit ? [(f[0] * limit) / n, (f[1] * limit) / n] : f
}

/** Seeded Ornstein–Uhlenbeck joint-torque estimation error with a constant bias. */
export function torqueErrorSource(seed = 7) {
  let s = seed >>> 0
  const uniform = () => {
    s = (s + 0x6d2b79f5) >>> 0
    let t = s
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
  const gaussian = () => Math.sqrt(-2 * Math.log(1 - uniform())) * Math.cos(2 * Math.PI * uniform())
  /** @type {Vec2} */
  let n = [0, 0]
  /** @param {number} dt @param {number} magnitude @returns {Vec2} */
  return (dt, magnitude) => {
    const tau = 0.15
    n = [
      n[0] + (-n[0] / tau) * dt + Math.sqrt((2 * dt) / tau) * gaussian(),
      n[1] + (-n[1] / tau) * dt + Math.sqrt((2 * dt) / tau) * gaussian()
    ]
    return [magnitude * (0.6 + 0.8 * n[0]), magnitude * (-0.4 + 0.8 * n[1])]
  }
}
