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
    if (!line || isPageNoise(line)) {
      flush();
      return;
    }
    current.push(line);
  });
  flush();
  return paragraphs.filter(Boolean).join("\n\n");
};

export const parseLabeledValue = (records, label) => {
  const pattern = new RegExp(`^${label}:\\s*(.*)$`, "i");
  const record = records.find((item) => pattern.test(item.text));
  return record?.text.match(pattern)?.[1]?.trim() ?? "";
};

export const uniqueByName = (records) => {
  const byName = new Map();
  records.forEach((record) => {
    if (!byName.has(record.name)) byName.set(record.name, record);
  });
  return [...byName.values()].sort((a, b) => a.name.localeCompare(b.name));
};
