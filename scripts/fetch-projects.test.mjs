import { test } from "node:test";
import assert from "node:assert/strict";
import { mergeProjects } from "./fetch-projects.mjs";

const repos = [
  {
    name: "real-repo",
    fork: false,
    description: "GitHub description",
    html_url: "https://github.com/mathieu-celerier/real-repo",
    homepage: "https://real-repo.example.com",
    stargazers_count: 5,
    language: "C++",
    topics: ["robotics", "control"],
  },
  {
    name: "forked-repo",
    fork: true,
    description: "A fork, should be excluded even if listed",
    html_url: "https://github.com/mathieu-celerier/forked-repo",
    homepage: null,
    stargazers_count: 0,
    language: "Python",
    topics: [],
  },
];

test("includes only repos listed in include, in that order", () => {
  const result = mergeProjects(
    { include: ["real-repo"], overrides: {}, manual: [] },
    repos,
  );
  assert.equal(result.length, 1);
  assert.equal(result[0].name, "real-repo");
  assert.equal(result[0].source, "github");
});

test("excludes forked repos even when explicitly included", () => {
  const result = mergeProjects(
    { include: ["forked-repo"], overrides: {}, manual: [] },
    repos,
  );
  assert.equal(result.length, 0);
});

test("silently skips include entries with no matching repo", () => {
  const result = mergeProjects(
    { include: ["real-repo", "does-not-exist"], overrides: {}, manual: [] },
    repos,
  );
  assert.equal(result.length, 1);
  assert.equal(result[0].name, "real-repo");
});

test("applies per-repo overrides for description and featured", () => {
  const result = mergeProjects(
    {
      include: ["real-repo"],
      overrides: { "real-repo": { description: "Custom", featured: true } },
      manual: [],
    },
    repos,
  );
  assert.equal(result[0].description, "Custom");
  assert.equal(result[0].featured, true);
});

test("falls back to GitHub's own description when no override given", () => {
  const result = mergeProjects(
    { include: ["real-repo"], overrides: {}, manual: [] },
    repos,
  );
  assert.equal(result[0].description, "GitHub description");
});

test("appends manual entries after GitHub-derived ones", () => {
  const result = mergeProjects(
    {
      include: ["real-repo"],
      overrides: {},
      manual: [{ name: "Manual Tool", description: "Hand-added", url: "https://example.com" }],
    },
    repos,
  );
  assert.equal(result.length, 2);
  assert.equal(result[1].name, "Manual Tool");
  assert.equal(result[1].source, "manual");
});

test("handles an empty repos list (network-failure fallback) without throwing", () => {
  const result = mergeProjects(
    { include: ["real-repo"], overrides: {}, manual: [{ name: "Still here", description: "", url: "https://x" }] },
    [],
  );
  assert.equal(result.length, 1);
  assert.equal(result[0].name, "Still here");
});
