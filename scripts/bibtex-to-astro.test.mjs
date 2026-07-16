import { test } from "node:test";
import assert from "node:assert/strict";
import { formatCreator, joinAuthors, escapeYaml } from "./bibtex-to-astro.mjs";

test("formatCreator uses name when present", () => {
  assert.equal(formatCreator({ name: "The Collective" }), "The Collective");
});

test("formatCreator composes firstName/lastName with accents preserved", () => {
  assert.equal(
    formatCreator({ firstName: "Mathieu", lastName: "Célérier" }),
    "Mathieu Célérier",
  );
});

test("formatCreator includes prefix/suffix when present", () => {
  assert.equal(
    formatCreator({ prefix: "von", firstName: "Anna", lastName: "Berg", suffix: "Jr." }),
    "von Anna Berg Jr.",
  );
});

test("joinAuthors joins multiple Creator objects with ', '", () => {
  const authors = [
    { firstName: "Célia", lastName: "Saghour" },
    { firstName: "Mathieu", lastName: "Célérier" },
    { firstName: "Philippe", lastName: "Fraisse" },
    { firstName: "Andrea", lastName: "Cherubini" },
  ];
  assert.equal(
    joinAuthors(authors),
    "Célia Saghour, Mathieu Célérier, Philippe Fraisse, Andrea Cherubini",
  );
});

test("joinAuthors handles a single author", () => {
  assert.equal(joinAuthors([{ firstName: "Jane", lastName: "Doe" }]), "Jane Doe");
});

test("joinAuthors never emits [object Object]", () => {
  const authors = [{ firstName: "A", lastName: "B" }, { firstName: "C", lastName: "D" }];
  assert.doesNotMatch(joinAuthors(authors), /\[object Object\]/);
});

test("joinAuthors falls back to string handling for non-array input", () => {
  assert.equal(joinAuthors("Plain String"), "Plain String");
});

test("escapeYaml leaves plain strings unquoted", () => {
  assert.equal(escapeYaml("A simple title"), "A simple title");
});

test("escapeYaml quotes and escapes strings with colons/quotes (e.g. long abstracts)", () => {
  const abstract = 'This paper: introduces a "novel" approach, with details.';
  const out = escapeYaml(abstract);
  assert.equal(out, JSON.stringify(abstract));
  assert.equal(JSON.parse(out), abstract);
});

test("escapeYaml collapses newlines/whitespace before quoting", () => {
  assert.equal(escapeYaml("Line one\nLine two:   spaced"), JSON.stringify("Line one Line two: spaced"));
});
