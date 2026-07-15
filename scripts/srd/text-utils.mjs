export const cleanLine = (value = "") => value
  .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, "")
  .replace(/[\u00ad\u2010-\u2015\u2212]+/g, "-")
  .replace(/-{2,}/g, "-")
  .replace(/\s+/g, " ")
  .trim();

export const slugify = (value) => cleanLine(value)
  .toLowerCase()
  .normalize("NFKD")
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/(^-|-$)/g, "");

export const toLineRecords = (text, firstPage) => {
  const pages = text.split("\f");
  return pages.flatMap((pageText, pageIndex) => pageText
    .split(/\r?\n/)
    .map((raw) => ({ raw, text: cleanLine(raw), page: firstPage + pageIndex }))
  );
};

export const previousNonEmpty = (lines, index) => {
  for (let cursor = index - 1; cursor >= 0; cursor -= 1) {
    if (lines[cursor].text) return lines[cursor];
  }
  return undefined;
};

const isPageNoise = (line) => (
  /^System Reference Document(?: 5\.1| 5\.2\.1)?$/i.test(line)
  || /^\d+ System Reference Document/i.test(line)
  || /^System Reference Document.*\d+$/i.test(line)
  || /^\d+$/.test(line)
);

const preservedHyphenPrefixes = new Set([
  "all", "day", "foot", "half", "high", "hour", "level", "long",
  "mile", "non", "one", "round", "self", "short", "three", "turn",
  "two", "well"
]);

const appendWrappedLine = (current, line) => {
  const previous = current.at(-1);
  const firstCharacter = line.charAt(0);
  if (!previous?.endsWith("-") || !/[a-z]/.test(firstCharacter)) {
    current.push(line);
    return;
  }

  const previousToken = previous.match(/([^\s]+)-$/)?.[1] ?? "";
  const keepHyphen = previousToken.includes("-")
    || /\d/.test(previousToken)
    || preservedHyphenPrefixes.has(previousToken.toLowerCase());
  current[current.length - 1] = `${previous.slice(0, -1)}${keepHyphen ? "-" : ""}${line}`;
};

export const joinBody = (records) => {
  const paragraphs = [];
  let current = [];

  const flush = () => {
    if (!current.length) return;
    paragraphs.push(current.join(" ").replace(/\s+/g, " ").trim());
    current = [];
  };

  records.forEach((record) => {
    const line = cleanLine(record.raw);
    if (isPageNoise(line)) return;
    if (!line) {
      flush();
      return;
    }
    appendWrappedLine(current, line);
  });
  flush();
  return paragraphs.filter(Boolean).join("\n\n");
};

export const parseLabeledValue = (records, label) => {
  const pattern = new RegExp(`^${label}:\\s*(.*)$`, "i");
  const record = records.find((item) => pattern.test(item.text));
  return record?.text.match(pattern)?.[1]?.trim() ?? "";
};

export const parseLabeledBlockValue = (records, label, stopLabels) => {
  const pattern = new RegExp(`^${label}:\\s*(.*)$`, "i");
  const start = records.findIndex((item) => pattern.test(item.text));
  if (start < 0) return "";

  const value = [records[start].text.match(pattern)?.[1]?.trim() ?? ""];
  const stopPattern = new RegExp(`^(?:${stopLabels.join("|")}):`, "i");
  for (const record of records.slice(start + 1)) {
    if (stopPattern.test(record.text)) break;
    if (record.text && !isPageNoise(record.text)) value.push(record.text);
  }
  return value.filter(Boolean).join(" ").replace(/\s+/g, " ").trim();
};

export const uniqueByName = (records) => {
  const byName = new Map();
  records.forEach((record) => {
    if (!byName.has(record.name)) byName.set(record.name, record);
  });
  return [...byName.values()].sort((a, b) => a.name.localeCompare(b.name));
};
