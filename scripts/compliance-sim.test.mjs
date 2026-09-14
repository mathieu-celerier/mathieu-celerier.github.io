import assert from 'node:assert/strict'
import test from 'node:test'

import {
  DOOR,
  compliantAcceleration,
  doorEnergy,
  doorHandle,
  eigenSym,
  errorSpread,
  forwardKinematics,
  gammaDirectional,
  gammaIsotropic,
  inverseKinematics,
  stepCompliant,
  stepDoor,
  taskInverseInertia
} from '../src/lib/compliance-sim.js'

const close = (a, b, tol = 1e-9) => assert.ok(Math.abs(a - b) <= tol, `${a} ≉ ${b}`)
const base = { v: [0, 0], reference: [1.2, 0.6], torqueError: [0, 0], kp: 0, kd: 0 }

test('inverse kinematics round-trips through forward kinematics', () => {
  for (const p of [[1.2, 0.6], [0.4, 1.4], [-0.8, 0.9]]) {
    const { tip } = forwardKinematics(inverseKinematics(p))
    close(tip[0], p[0], 1e-9)
    close(tip[1], p[1], 1e-9)
  }
})

test('task mobility Λ⁻¹ is symmetric positive definite and configuration dependent', () => {
  const A = taskInverseInertia(inverseKinematics([1.2, 0.6]))
  const B = taskInverseInertia(inverseKinematics([0.5, 0.9]))
  close(A[1], A[2])
  const { minor } = eigenSym(A)
  assert.ok(minor > 0)
  assert.ok(Math.abs(A[0] - B[0]) > 1e-3)
})

test('Γ = αI scales the force-induced acceleration by α, i.e. effective inertia Λ/α', () => {
  const at = { ...base, x: [1.2, 0.6], force: [5, -3] }
  const one = compliantAcceleration({ ...at, gamma: gammaIsotropic(1) }).shaped
  const quarter = compliantAcceleration({ ...at, gamma: gammaIsotropic(0.25) }).shaped
  const zero = compliantAcceleration({ ...at, gamma: gammaIsotropic(0) }).shaped
  close(quarter[0], 0.25 * one[0])
  close(quarter[1], 0.25 * one[1])
  assert.deepEqual(zero.map((z) => Math.abs(z)), [0, 0])
})

test('estimation error vanishes for Γ = I and is fully exposed for Γ = 0', () => {
  const at = { ...base, x: [1.2, 0.6], force: [0, 0], torqueError: [2, -1] }
  const compliant = compliantAcceleration({ ...at, gamma: gammaIsotropic(1) }).error
  const rigid = compliantAcceleration({ ...at, gamma: gammaIsotropic(0) }).error
  close(compliant[0], 0)
  close(compliant[1], 0)
  assert.ok(Math.hypot(...rigid) > 0.1)
})

test('directional Γ blocks force-induced motion along its zero eigenvector', () => {
  const angle = 0.7
  const gamma = gammaDirectional(angle, 1, 0)
  const x = [1.2, 0.6]
  const shaped = compliantAcceleration({ ...base, x, gamma, force: [4, 7] }).shaped
  const blocked = shaped[0] * -Math.sin(angle) + shaped[1] * Math.cos(angle)
  close(blocked, 0, 1e-9)
})

test('compliant step respects the reach limit', () => {
  let state = { x: [1.9, 0], v: [0, 0] }
  let limited = false
  for (let i = 0; i < 400; i++) {
    const r = stepCompliant(state, { ...base, gamma: gammaIsotropic(1), force: [30, 0] }, 0.001)
    state = r
    limited ||= r.limited
  }
  assert.ok(limited)
  assert.ok(Math.hypot(...state.x) <= 1.95 + 1e-9)
})

test('handle stays on the door arc', () => {
  const h = doorHandle(DOOR.rest + 0.4)
  close(Math.hypot(h[0] - DOOR.hinge[0], h[1] - DOOR.hinge[1]), DOOR.radius)
})

test('frictionless door conserves energy', () => {
  const p = { inertia: 0.4, mass: 1.2, viscous: 0, coulomb: 0, force: [0, 0] }
  let state = { theta: DOOR.rest + 0.2, omega: 0 }
  const e0 = doorEnergy(state, p)
  for (let i = 0; i < 300; i++) state = stepDoor(state, p, 0.0005)
  close(doorEnergy(state, p), e0, 0.02)
})

test('weighted door with friction falls and settles hanging at the lower stop', () => {
  const p = { inertia: 0.4, mass: 1.2, viscous: 0.6, coulomb: 0.1, force: [0, 0] }
  let state = { theta: DOOR.rest, omega: 0 }
  for (let i = 0; i < 8000; i++) state = stepDoor(state, p, 0.001)
  close(state.theta, DOOR.maxAngle, 1e-3)
  close(Math.abs(state.omega), 0, 1e-3)
})

test('a push along the tangent opens the door; a radial push does not', () => {
  const p = { inertia: 0.4, mass: 0, viscous: 0, coulomb: 0 }
  const t = DOOR.rest
  const tangential = stepDoor({ theta: t, omega: 0 }, { ...p, force: [-10 * Math.sin(t), 10 * Math.cos(t)] }, 0.01)
  const radial = stepDoor({ theta: t, omega: 0 }, { ...p, force: [10 * Math.cos(t), 10 * Math.sin(t)] }, 0.01)
  assert.ok(tangential.omega > 0)
  close(radial.omega, 0)
})

const axis = (angle) => ((angle % Math.PI) + Math.PI) % Math.PI

test('the Γ ellipse points along the chosen direction, and a push moves the task along it', () => {
  const x = [1.25, 0.75]
  const q = inverseKinematics(x)
  for (const angle of [0, Math.PI / 6, 1.2, 2.5]) {
    const gamma = gammaDirectional(angle, 1, 0)
    close(axis(eigenSym(gamma).angle), axis(angle), 1e-9)
    for (const force of [[10, 0], [0, 10], [-4, 7]]) {
      const a = compliantAcceleration({ ...base, x, gamma, force }).shaped
      if (Math.hypot(...a) < 1e-9) continue
      close(axis(Math.atan2(a[1], a[0])), axis(angle), 1e-9)
    }
  }
  assert.ok(q)
})

test('estimation error spreads along the rigid direction, perpendicular to the compliant one', () => {
  const q = inverseKinematics([1.25, 0.75])
  for (const angle of [0, 0.7, 2]) {
    const spread = errorSpread(gammaDirectional(angle, 1, 0), q)
    close(spread[1], spread[2])
    close(axis(eigenSym(spread).angle), axis(angle + Math.PI / 2), 1e-9)
    close(eigenSym(spread).minor, 0, 1e-9)
  }
})
