import {
  joinBody,
  previousNonEmpty,
  slugify,
  toLineRecords,
  uniqueByName
} from "./text-utils.mjs";

const descriptorPattern = /^(Tiny|Small|Medium|Large|Huge|Gargantuan)\s+(.+?),\s*(.+)$/i;
const sectionHeadings = ["Traits", "Actions", "Bonus Actions", "Reactions", "Legendary Actions"];

const isPlausibleTitle = (value) => (
  value.length >= 2
  && value.length <= 90
  && !value.includes(":")
  && !/^(Armor Class|Hit Points|Speed|STR|Actions|Traits|Challenge)/i.test(value)
);

const findStarts = (lines) => lines.flatMap((line, index) => {
  const descriptor = line.text.match(descriptorPattern);
  if (!descriptor) return [];
  const title = previousNonEmpty(lines, index);
  if (!title || !isPlausibleTitle(title.text)) return [];
  return [{
    index: lines.indexOf(title),
    page: title.page,
    name: title.text,
    size: descriptor[1],
    type: descriptor[2],
    alignment: descriptor[3]
  }];
});

const lineValue = (records, label) => {
  const pattern = new RegExp(`^${label}\\s+(.+)$`, "i");
  const line = records.find((record) => pattern.test(record.text));
  return line?.text.match(pattern)?.[1]?.trim() ?? "";
};

const sectionRecords = (records, heading) => {
  const start = records.findIndex((record) => record.text.toLowerCase() === heading.toLowerCase());
  if (start < 0) return [];
  const endOffset = records.slice(start + 1).findIndex((record) => (
    sectionHeadings.some((candidate) => candidate.toLowerCase() === record.text.toLowerCase())
  ));
  const end = endOffset < 0 ? records.length : start + 1 + endOffset;
  return records.slice(start + 1, end);
};

export const parseMonsters = ({ text, source }) => {
  const lines = toLineRecords(text, source.monsterPages[0]);
  const starts = findStarts(lines);
  const records = starts.map((start, index) => {
    const end = starts[index + 1]?.index ?? lines.length;
    const block = lines.slice(start.index + 2, end);
    const rawText = joinBody(block);
    return {
      id: `${source.edition}-monster-${slugify(start.name)}`,
      edition: source.edition,
      sourceVersion: source.version,
      name: start.name,
      size: start.size,
      type: start.type,
      alignment: start.alignment,
      armorClass: lineValue(block, "Armor Class"),
      hitPoints: lineValue(block, "Hit Points"),
      speed: lineValue(block, "Speed"),
      challenge: lineValue(block, "Challenge(?: Rating)?"),
      traits: joinBody(sectionRecords(block, "Traits")),
      actions: joinBody(sectionRecords(block, "Actions")),
      bonusActions: joinBody(sectionRecords(block, "Bonus Actions")),
      reactions: joinBody(sectionRecords(block, "Reactions")),
      legendaryActions: joinBody(sectionRecords(block, "Legendary Actions")),
      rawText,
      sourcePage: start.page,
      sourceReference: `SRD ${source.version} p. ${start.page}`
    };
  });

  return uniqueByName(records).filter((record) => (
    record.rawText.length > 60
    && (record.armorClass || record.hitPoints || record.challenge)
  ));
};
