import fs from "node:fs";
import path from "node:path";
import { parse } from "@retorquere/bibtex-parser";
import YAML from "yaml";

const BIB_PATH = "data/publications.bib";
const OVERRIDES_PATH = "data/publications.overrides.yaml";
const OUT_DIR = "src/content/publications";

function loadOverrides() {
  if (!fs.existsSync(OVERRIDES_PATH)) return {};
  const raw = fs.readFileSync(OVERRIDES_PATH, "utf8");
  const doc = YAML.parse(raw);
  return doc && typeof doc === "object" ? doc : {};
}

const overrides = loadOverrides();

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

function normalizeWhitespace(s) {
  return String(s ?? "")
    .replace(/\s+/g, " ")
    .trim();
}

function slugify(s) {
  return normalizeWhitespace(s)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function toYear(entry) {
  const y = entry.fields?.year;
  const n = Number(String(y ?? "").replace(/[^0-9]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

function guessType(entry) {
  const t = (entry.type || "").toLowerCase();
  if (t === "article") return "journal";
  if (t === "inproceedings") return "conference";
  if (t === "proceedings") return "conference";
  if (t === "phdthesis" || t === "mastersthesis") return "thesis";
  if (t === "misc" || t === "unpublished") return "preprint";
  return "other";
}

function joinAuthors(bibAuthorField) {
  // BibTeX uses "and" separators.
  return normalizeWhitespace(bibAuthorField)
    .split(/\s+and\s+/i)
    .map(normalizeWhitespace)
    .join(", ");
}

function field(entry, name) {
  // parser yields keys lowercased in most cases, but be defensive
  const f = entry.fields || {};
  return f[name] ?? f[name?.toLowerCase()];
}

function pickVenue(entry) {
  return (
    field(entry, "journaltitle") ||
    field(entry, "journal") ||
    field(entry, "booktitle") ||
    field(entry, "publisher") ||
    ""
  );
}

function pickUrl(entry) {
  const url = field(entry, "url");
  if (url) return String(url).trim();

  const doi = field(entry, "doi");
  if (doi) return `https://doi.org/${String(doi).trim()}`;

  return "";
}

function escapeYaml(s) {
  // Safe YAML string for most cases
  const v = normalizeWhitespace(s);
  if (!v) return "";
  const needsQuotes = /[:\[\]{}#,>&*!|'"%@`]/.test(v);
  if (!needsQuotes) return v;
  return JSON.stringify(v); // emits quoted string with escapes
}

function writeEntry(entry) {
  const bibkey = entry.key;
  const o = overrides[bibkey] || {};

  const title = normalizeWhitespace(field(entry, "title"));
  const authors = joinAuthors(field(entry, "author") || "");
  const year = toYear(entry);
  const venue = normalizeWhitespace(pickVenue(entry));
  const doi = normalizeWhitespace(field(entry, "doi"));
  const url = normalizeWhitespace(pickUrl(entry));
  const type = guessType(entry);

  // Website-only fields come ONLY from overrides:
  const pdf = typeof o.pdf === "string" ? o.pdf : "";
  const code = typeof o.code === "string" ? o.code : "";
  const video = typeof o.video === "string" ? o.video : "";
  const website = typeof o.website === "string" ? o.website : "";
  const featured = Boolean(o.featured);
  const highlights = Array.isArray(o.highlights)
    ? o.highlights.map(normalizeWhitespace).filter(Boolean)
    : [];

  const safeSlug =
    slugify(`${year}-${bibkey}-${title || "pub"}`) || slugify(bibkey) || bibkey;
  const outPath = path.join(OUT_DIR, `${safeSlug}.md`);

  const frontmatterLines = [
    "---",
    `title: ${escapeYaml(title || bibkey)}`,
    `authors: ${escapeYaml(authors)}`,
    `year: ${year || 0}`,
    venue ? `venue: ${escapeYaml(venue)}` : "",
    `type: ${type}`,
    doi ? `doi: ${escapeYaml(doi)}` : "",
    url ? `url: ${escapeYaml(url)}` : "",
    `bibkey: ${escapeYaml(bibkey)}`,

    // Overrides (optional, only emitted if present)
    pdf ? `pdf: ${escapeYaml(pdf)}` : "",
    code ? `code: ${escapeYaml(code)}` : "",
    video ? `video: ${escapeYaml(video)}` : "",
    website ? `url: ${escapeYaml(website)}` : "",
    featured ? `featured: true` : "",
    highlights.length
      ? `highlights:\n${highlights.map((h) => `  - ${escapeYaml(h)}`).join("\n")}`
      : "",
    "---",
    "",
  ].filter(Boolean);

  fs.writeFileSync(outPath, frontmatterLines.join("\n"), "utf8");
}

function main() {
  const bib = fs.readFileSync(BIB_PATH, "utf8");
  const parsed = parse(bib);
  const entries = parsed.entries || [];

  ensureDir(OUT_DIR);

  // Clean previous generated files
  for (const f of fs.readdirSync(OUT_DIR)) {
    if (f.endsWith(".md")) fs.unlinkSync(path.join(OUT_DIR, f));
  }

  for (const e of entries) {
    if (!e?.key) continue;
    writeEntry(e);
  }

  console.log(
    `Generated ${entries.length} publication markdown files into ${OUT_DIR}`,
  );
}

main();
