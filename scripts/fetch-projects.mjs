import fs from "node:fs";
import path from "node:path";
import YAML from "yaml";

const GITHUB_USER = "mathieu-celerier";
const PROJECTS_YAML = "data/projects.yaml";
const OUT_PATH = "src/data/projects.generated.json";

function loadConfig() {
  if (!fs.existsSync(PROJECTS_YAML)) {
    return { include: [], overrides: {}, manual: [] };
  }
  const raw = fs.readFileSync(PROJECTS_YAML, "utf8");
  const doc = YAML.parse(raw) || {};
  return {
    include: Array.isArray(doc.include) ? doc.include : [],
    overrides:
      doc.overrides && typeof doc.overrides === "object" ? doc.overrides : {},
    manual: Array.isArray(doc.manual) ? doc.manual : [],
  };
}

async function fetchGithubRepos(username) {
  const res = await fetch(
    `https://api.github.com/users/${username}/repos?type=owner&per_page=100&sort=updated`,
    {
      headers: {
        Accept: "application/vnd.github+json",
        "User-Agent": "personal-website-build",
      },
    },
  );
  if (!res.ok) {
    throw new Error(`GitHub API responded with ${res.status} ${res.statusText}`);
  }
  return res.json();
}

// Pure merge logic, kept separate from the network call so it can be unit
// tested without hitting the GitHub API.
export function mergeProjects({ include, overrides, manual }, repos) {
  const byName = new Map(
    (repos || []).filter((r) => !r.fork).map((r) => [r.name, r]),
  );

  const fromGithub = include
    .map((name) => {
      const repo = byName.get(name);
      if (!repo) return null;
      const override = overrides[name] || {};
      return {
        name: repo.name,
        description: override.description ?? repo.description ?? "",
        url: repo.html_url,
        homepage: repo.homepage || null,
        stars: repo.stargazers_count ?? 0,
        language: repo.language || null,
        topics: Array.isArray(repo.topics) ? repo.topics : [],
        featured: Boolean(override.featured),
        source: "github",
      };
    })
    .filter((project) => project !== null);

  const fromManual = manual.map((entry) => ({
    name: entry.name,
    description: entry.description || "",
    url: entry.url,
    homepage: null,
    stars: null,
    language: null,
    topics: [],
    featured: Boolean(entry.featured),
    source: "manual",
  }));

  return [...fromGithub, ...fromManual];
}

async function main() {
  const config = loadConfig();

  let repos = [];
  try {
    repos = await fetchGithubRepos(GITHUB_USER);
  } catch (err) {
    console.warn(
      `Could not fetch GitHub repos for @${GITHUB_USER} (${err.message}); ` +
        "falling back to manual entries only.",
    );
  }

  const projects = mergeProjects(config, repos);

  fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
  fs.writeFileSync(OUT_PATH, JSON.stringify(projects, null, 2), "utf8");

  console.log(`Generated ${projects.length} project(s) into ${OUT_PATH}`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
