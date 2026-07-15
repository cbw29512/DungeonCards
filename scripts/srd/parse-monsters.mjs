import {
  joinBody,
  previousNonEmpty,
  slugify,
  toLineRecords,
  uniqueByName
} from "./text-utils.mjs";

const descriptorPattern = /^(Tiny|Small|Medium|Large|Huge|Gargantuan)\s+(.+?),\s*(.+)$/i;

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

const matchValue = (text, pattern) => text.match(pattern)?.[1]?.trim() ?? "";

const sectionText = (text, heading, nextHeadings) => {
  const start = text.search(new RegExp(`(?:^|\\n)${heading}(?:\\n|$)`, "i"));
  if (start < 0) return "";
  const remainder = text.slice(start).replace(new RegExp(`^\\s*${heading}\\s*`, "i"), "");
  if (!nextHeadings.length) return remainder.trim();
  const nextPattern = new RegExp(`(?:^|\\n)(?:${nextHeadings.join("|")})(?:\\n|$)`, "i");
  const end = remainder.search(nextPattern);
  return (end >= 0 ? remainder.slice(0, end) : remainder).trim();
};

export const parseMonsters = ({ text, source }) => {
  const lines = toLineRecords(text, source.monsterPages[0]);
  const starts = findStarts(lines);
  const records = starts.map((start, index) => {
    const end = starts[index + 1]?.index ?? lines.length;
    const rawText = joinBody(lines.slice(start.index + 2, end));
    return {
      id: `${source.edition}-monster-${slugify(start.name)}`,
      edition: source.edition,
      sourceVersion: source.version,
      name: start.name,
      size: start.size,
      type: start.type,
      alignment: start.alignment,
      armorClass: matchValue(rawText, /Armor Class\s+([^\n]+)/i),
      hitPoints: matchValue(rawText, /Hit Points\s+([^\n]+)/i),
      speed: matchValue(rawText, /Speed\s+([^\n]+)/i),
      challenge: matchValue(rawText, /Challenge(?: Rating)?\s+([^\n]+)/i),
      traits: sectionText(rawText, "Traits", ["Actions", "Bonus Actions", "Reactions", "Legendary Actions"]),
      actions: sectionText(rawText, "Actions", ["Bonus Actions", "Reactions", "Legendary Actions"]),
      bonusActions: sectionText(rawText, "Bonus Actions", ["Reactions", "Legendary Actions"]),
      reactions: sectionText(rawText, "Reactions", ["Legendary Actions"]),
      legendaryActions: sectionText(rawText, "Legendary Actions", []),
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
