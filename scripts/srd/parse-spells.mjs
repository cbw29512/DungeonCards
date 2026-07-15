import {
  joinBody,
  parseLabeledBlockValue,
  parseLabeledValue,
  previousNonEmpty,
  slugify,
  toLineRecords,
  uniqueByName
} from "./text-utils.mjs";

const parseClasses = (value = "") => value
  .replace(/[()]/g, "")
  .split(",")
  .map((item) => item.trim())
  .filter(Boolean);

const parseDescriptor = (line) => {
  const modern = line.match(/^Level (\d) ([A-Za-z]+)(?: \((.*)\))?$/);
  if (modern) {
    return {
      level: Number(modern[1]),
      school: modern[2],
      classes: parseClasses(modern[3])
    };
  }

  const cantrip = line.match(/^([A-Za-z]+) cantrip(?: \((.*)\))?$/i);
  if (cantrip) {
    return { level: 0, school: cantrip[1], classes: parseClasses(cantrip[2]) };
  }

  const legacy = line.match(/^(\d+)(?:st|nd|rd|th)-level ([A-Za-z]+)(?: \((ritual)\))?$/i);
  return legacy
    ? { level: Number(legacy[1]), school: legacy[2], classes: [] }
    : undefined;
};

const isPlausibleTitle = (value) => (
  value.length >= 2
  && value.length <= 80
  && !value.includes(":")
  && !/^(Level|Casting|Range|Components|Duration|Using|At Higher)/i.test(value)
);

const findStarts = (lines) => lines.flatMap((line, index) => {
  const descriptor = parseDescriptor(line.text);
  if (!descriptor) return [];
  const title = previousNonEmpty(lines, index);
  if (!title || !isPlausibleTitle(title.text)) return [];
  return [{ index: lines.indexOf(title), page: title.page, name: title.text, descriptor }];
});

const bodyAfterMetadata = (block) => {
  const durationIndex = block.findIndex((item) => /^Duration:/i.test(item.text));
  return durationIndex >= 0 ? block.slice(durationIndex + 1) : block.slice(2);
};

const completeDescriptor = (block, fallback) => {
  const castingIndex = block.findIndex((item) => /^Casting Time:/i.test(item.text));
  if (castingIndex < 0) return fallback;
  const descriptorText = block
    .slice(1, castingIndex)
    .map((item) => item.text)
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
  return parseDescriptor(descriptorText) ?? fallback;
};

export const parseSpells = ({ text, source }) => {
  const lines = toLineRecords(text, source.spellPages[0]);
  const starts = findStarts(lines);
  const records = starts.map((start, index) => {
    const end = starts[index + 1]?.index ?? lines.length;
    const block = lines.slice(start.index, end);
    const descriptor = completeDescriptor(block, start.descriptor);
    const body = joinBody(bodyAfterMetadata(block));
    const higherLevelMarker = body.search(/(?:Using a Higher-Level Spell Slot|At Higher Levels?|Cantrip Upgrade)\.?/i);

    return {
      id: `${source.edition}-spell-${slugify(start.name)}`,
      edition: source.edition,
      sourceVersion: source.version,
      name: start.name,
      level: descriptor.level,
      school: descriptor.school,
      classes: descriptor.classes,
      castingTime: parseLabeledValue(block, "Casting Time"),
      range: parseLabeledValue(block, "Range"),
      components: parseLabeledBlockValue(block, "Components?", ["Duration"]),
      duration: parseLabeledValue(block, "Duration"),
      description: higherLevelMarker >= 0 ? body.slice(0, higherLevelMarker).trim() : body,
      higherLevels: higherLevelMarker >= 0 ? body.slice(higherLevelMarker).trim() : "",
      sourcePage: start.page,
      sourceReference: `SRD ${source.version} p. ${start.page}`
    };
  });

  return uniqueByName(records).filter((record) => record.description.length > 20);
};
