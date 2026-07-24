#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const DEFAULT_MANIFEST = "config/homebrew-sources.json";
const DEFAULT_OUTPUT = "public/dm-forge/homebrew-index.json";
const MAX_RESPONSE_BYTES = 2_000_000;
const MIN_HOST_DELAY_MS = 1_500;

export const ALLOWED_LICENSES = new Set([
  "CC-BY-4.0",
  "CC-BY-SA-4.0",
  "OGL-1.0a",
  "ORC",
  "PUBLIC-DOMAIN",
  "CREATOR-PERMISSION"
]);

const sleep = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

const decodeEntities = (value) => value
  .replaceAll("&nbsp;", " ")
  .replaceAll("&amp;", "&")
  .replaceAll("&lt;", "<")
  .replaceAll("&gt;", ">")
  .replaceAll("&quot;", "\"")
  .replaceAll("&#39;", "'")
  .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)));

export const htmlToText = (html) => decodeEntities(String(html))
  .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
  .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
  .replace(/<noscript\b[^>]*>[\s\S]*?<\/noscript>/gi, " ")
  .replace(/<br\s*\/?>/gi, "\n")
  .replace(/<\/(p|div|section|article|li|h[1-6])>/gi, "\n")
  .replace(/<[^>]+>/g, " ")
  .replace(/[\t\r ]+/g, " ")
  .replace(/\n\s+/g, "\n")
  .replace(/\n{3,}/g, "\n\n")
  .trim();

export const titleFromHtml = (html, fallback) => {
  const match = String(html).match(/<title\b[^>]*>([\s\S]*?)<\/title>/i);
  return decodeEntities(match?.[1]?.replace(/<[^>]+>/g, " ").trim() || fallback);
};

export const robotsAllows = (robotsText, pathname, userAgent = "DMForgeHomebrewBot") => {
  const groups = [];
  let current = null;

  for (const rawLine of String(robotsText || "").split(/\r?\n/)) {
    const line = rawLine.replace(/#.*$/, "").trim();
    if (!line) continue;
    const separator = line.indexOf(":");
    if (separator < 0) continue;
    const key = line.slice(0, separator).trim().toLowerCase();
    const value = line.slice(separator + 1).trim();

    if (key === "user-agent") {
      if (!current || current.rules.length > 0) {
        current = { agents: [], rules: [] };
        groups.push(current);
      }
      current.agents.push(value.toLowerCase());
    } else if ((key === "allow" || key === "disallow") && current) {
      current.rules.push({ type: key, path: value });
    }
  }

  const normalizedAgent = userAgent.toLowerCase();
  const matching = groups.filter((group) => group.agents.some((agent) => agent === "*" || normalizedAgent.includes(agent)));
  const rules = matching.flatMap((group) => group.rules).filter((rule) => rule.path);
  const applicable = rules.filter((rule) => pathname.startsWith(rule.path));
  if (applicable.length === 0) return true;
  applicable.sort((a, b) => b.path.length - a.path.length);
  return applicable[0].type === "allow";
};

const validateSource = (source) => {
  if (!source || typeof source !== "object") throw new Error("Every source must be an object.");
  if (!/^[a-z0-9][a-z0-9-]{1,79}$/i.test(source.id || "")) throw new Error(`Invalid source id: ${source.id || "missing"}`);
  if (!ALLOWED_LICENSES.has(source.license)) throw new Error(`${source.id}: unsupported or missing license ${source.license || "(none)"}.`);
  if (!source.attribution?.trim()) throw new Error(`${source.id}: attribution is required.`);
  if (source.license === "CREATOR-PERMISSION" && !source.permissionUrl) {
    throw new Error(`${source.id}: creator permission requires a public permissionUrl.`);
  }

  const url = new URL(source.url);
  if (url.protocol !== "https:") throw new Error(`${source.id}: only HTTPS sources are allowed.`);
  if (url.username || url.password) throw new Error(`${source.id}: credential-bearing URLs are forbidden.`);
  return url;
};

const fetchWithLimit = async (url, options = {}) => {
  const response = await fetch(url, {
    redirect: "follow",
    headers: {
      "User-Agent": "DMForgeHomebrewBot/1.0 (+https://cbw29512.github.io/monstercardforge/)",
      Accept: "text/html,application/json;q=0.9,text/plain;q=0.8"
    },
    ...options
  });

  if (!response.ok) throw new Error(`${url} returned HTTP ${response.status}.`);
  const length = Number(response.headers.get("content-length") || 0);
  if (length > MAX_RESPONSE_BYTES) throw new Error(`${url} exceeds the ${MAX_RESPONSE_BYTES}-byte limit.`);
  const bytes = new Uint8Array(await response.arrayBuffer());
  if (bytes.byteLength > MAX_RESPONSE_BYTES) throw new Error(`${url} exceeds the ${MAX_RESPONSE_BYTES}-byte limit.`);
  return { response, text: new TextDecoder().decode(bytes) };
};

const fetchRobots = async (url) => {
  const robotsUrl = new URL("/robots.txt", url);
  try {
    const response = await fetch(robotsUrl, {
      redirect: "follow",
      headers: { "User-Agent": "DMForgeHomebrewBot/1.0" }
    });
    if (response.status === 404) return "";
    if (!response.ok) throw new Error(`robots.txt returned HTTP ${response.status}`);
    return await response.text();
  } catch (error) {
    throw new Error(`${url.hostname}: robots.txt could not be verified (${error instanceof Error ? error.message : String(error)}).`);
  }
};

const recordFromSource = async (source, url) => {
  const robots = await fetchRobots(url);
  if (!robotsAllows(robots, url.pathname)) throw new Error(`${source.id}: blocked by robots.txt.`);

  const { response, text } = await fetchWithLimit(url);
  const contentType = response.headers.get("content-type") || "";
  let title = source.title || source.id;
  let body = "";

  if (contentType.includes("application/json")) {
    const parsed = JSON.parse(text);
    title = source.title || parsed.name || parsed.title || title;
    body = JSON.stringify(parsed, null, 2);
  } else if (contentType.includes("text/html") || contentType.includes("text/plain") || !contentType) {
    title = source.title || titleFromHtml(text, title);
    body = contentType.includes("text/html") ? htmlToText(text) : text.trim();
  } else {
    throw new Error(`${source.id}: unsupported content type ${contentType}.`);
  }

  const excerptLength = Math.min(Math.max(Number(source.maxCharacters) || 12_000, 500), 30_000);
  return {
    id: source.id,
    system: source.system || "dnd-5e",
    kind: source.kind || "homebrew-reference",
    title: String(title).slice(0, 200),
    url: url.href,
    author: source.author || "Unknown creator",
    attribution: source.attribution,
    license: source.license,
    licenseUrl: source.licenseUrl || null,
    permissionUrl: source.permissionUrl || null,
    tags: Array.isArray(source.tags) ? source.tags.map(String).slice(0, 20) : [],
    excerpt: body.slice(0, excerptLength),
    excerptTruncated: body.length > excerptLength
  };
};

export const ingestApprovedSources = async ({ manifestPath = DEFAULT_MANIFEST, outputPath = DEFAULT_OUTPUT, dryRun = false } = {}) => {
  const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  const sources = Array.isArray(manifest) ? manifest : manifest.sources;
  if (!Array.isArray(sources)) throw new Error("The manifest must be an array or an object with a sources array.");

  const records = [];
  const lastRequestByHost = new Map();
  for (const source of sources) {
    const url = validateSource(source);
    const lastRequest = lastRequestByHost.get(url.hostname) || 0;
    const remainingDelay = MIN_HOST_DELAY_MS - (Date.now() - lastRequest);
    if (remainingDelay > 0) await sleep(remainingDelay);
    records.push(await recordFromSource(source, url));
    lastRequestByHost.set(url.hostname, Date.now());
  }

  const payload = {
    schemaVersion: 1,
    policy: {
      crawlMode: "manifest-only",
      robotsRequired: true,
      loginOrPaywallBypass: false,
      allowedLicenses: [...ALLOWED_LICENSES]
    },
    recordCount: records.length,
    records
  };

  if (!dryRun) {
    await mkdir(path.dirname(outputPath), { recursive: true });
    await writeFile(outputPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  }
  return payload;
};

const main = async () => {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const positional = args.filter((argument) => !argument.startsWith("--"));
  const manifestPath = positional[0] || DEFAULT_MANIFEST;
  const outputPath = positional[1] || DEFAULT_OUTPUT;
  const payload = await ingestApprovedSources({ manifestPath, outputPath, dryRun });
  console.log(`${dryRun ? "Validated" : "Wrote"} ${payload.recordCount} approved homebrew source records${dryRun ? "" : ` to ${outputPath}`}.`);
};

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
