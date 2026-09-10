import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildProjects } from './fetch-projects.mjs'

test('keeps curated projects and their repository links in authored order', () => {
  const result = buildProjects({
    projects: [
      {
        slug: 'robot-interaction',
        name: 'Robot interaction controllers',
        description: 'A multi-repository research project.',
        featured: true,
        links: [
          { label: 'Controller', url: 'https://github.com/example/controller' },
          { label: 'Robot interface', url: 'https://github.com/example/interface' },
        ],
      },
    ],
  })

  assert.deepEqual(result[0].links, [
    { label: 'Controller', url: 'https://github.com/example/controller' },
    { label: 'Robot interface', url: 'https://github.com/example/interface' },
  ])
  assert.equal(result[0].name, 'Robot interaction controllers')
})

test('allows a project without repository links', () => {
  const result = buildProjects({ projects: [{ slug: 'non-software', name: 'Study', featured: false }] })
  assert.deepEqual(result[0].links, [])
  assert.equal(result[0].description, '')
})
