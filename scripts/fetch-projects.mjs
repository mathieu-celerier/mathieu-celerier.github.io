import fs from 'node:fs'
import path from 'node:path'
import YAML from 'yaml'

const PROJECTS_YAML = 'data/projects.yaml'
const OUT_PATH = 'src/data/projects.generated.json'

function loadConfig() {
  if (!fs.existsSync(PROJECTS_YAML)) return { projects: [] }
  const document = YAML.parse(fs.readFileSync(PROJECTS_YAML, 'utf8')) || {}
  return { projects: Array.isArray(document.projects) ? document.projects : [] }
}

// Projects are deliberately authored separately from GitHub repositories: a
// research project can span several repositories (and need not have one at
// all). Keeping the transformation pure also makes site builds deterministic.
export function buildProjects({ projects }) {
  return projects.map((project) => ({
    slug: project.slug,
    name: project.name,
    description: project.description || '',
    featured: Boolean(project.featured),
    links: Array.isArray(project.links)
      ? project.links.map((link) => ({ label: link.label, url: link.url }))
      : [],
  }))
}

function main() {
  const projects = buildProjects(loadConfig())
  fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true })
  fs.writeFileSync(OUT_PATH, JSON.stringify(projects, null, 2) + '\n', 'utf8')
  console.log(`Generated ${projects.length} curated project(s) into ${OUT_PATH}`)
}

if (import.meta.url === `file://${process.argv[1]}`) main()
