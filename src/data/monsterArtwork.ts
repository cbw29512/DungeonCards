import type { MonsterArtworkRecord } from "../types/monsterArtwork";
import type { RulesetId } from "../types/ruleCards";

export const monsterArtwork: MonsterArtworkRecord[] = [
  {
    id: "john-batten-goblin",
    monsterName: "Goblin",
    rulesets: ["srd-5.1-2014", "srd-5.2.1-2024"],
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/Goblin_illustration_from_19th_century.png/250px-Goblin_illustration_from_19th_century.png",
    sourcePageUrl: "https://commons.wikimedia.org/wiki/File:Goblin_illustration_from_19th_century.png",
    title: "Goblin illustration from English Fairy Tales",
    creator: "John D. Batten",
    licenseId: "public-domain",
    licenseName: "Public Domain",
    licenseUrl: "https://creativecommons.org/publicdomain/mark/1.0/",
    attribution: "John D. Batten, 19th-century goblin illustration, public domain, via Wikimedia Commons.",
    modifications: "Displayed with responsive cropping and contrast treatment; source artwork is otherwise unchanged.",
    verifiedOn: "2026-07-15"
  },
  {
    id: "bertuch-european-dragon",
    monsterName: "Adult Black Dragon",
    rulesets: ["srd-5.1-2014", "srd-5.2.1-2024"],
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d8/Friedrich-Johann-Justin-Bertuch_Mythical-Creature-Dragon_1806.jpg/250px-Friedrich-Johann-Justin-Bertuch_Mythical-Creature-Dragon_1806.jpg",
    sourcePageUrl: "https://commons.wikimedia.org/wiki/File:Friedrich-Johann-Justin-Bertuch_Mythical-Creature-Dragon_1806.jpg",
    title: "European dragon",
    creator: "Friedrich Justin Bertuch",
    licenseId: "public-domain",
    licenseName: "Public Domain",
    licenseUrl: "https://creativecommons.org/publicdomain/mark/1.0/",
    attribution: "Friedrich Justin Bertuch, European dragon illustration, 1806, public domain, via Wikimedia Commons.",
    modifications: "Displayed with responsive cropping and darkening to fit the black-dragon card; source artwork is otherwise unchanged.",
    verifiedOn: "2026-07-15"
  },
  {
    id: "wesnoth-lich",
    monsterName: "Lich",
    rulesets: ["srd-5.1-2014", "srd-5.2.1-2024"],
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/76/Wesnothlich.png/250px-Wesnothlich.png",
    sourcePageUrl: "https://commons.wikimedia.org/wiki/File:Wesnothlich.png",
    title: "Lich portrait from The Battle for Wesnoth",
    creator: "The Battle for Wesnoth art contributors",
    licenseId: "gpl-2.0-or-later",
    licenseName: "GNU General Public License v2.0 or later",
    licenseUrl: "https://www.gnu.org/licenses/old-licenses/gpl-2.0.html",
    attribution: "Lich artwork from The Battle for Wesnoth, credited to the Wesnoth art contributors, GPL-2.0-or-later, via Wikimedia Commons.",
    modifications: "Displayed with responsive cropping; source artwork is otherwise unchanged.",
    verifiedOn: "2026-07-15"
  }
];

const artworkKey = (ruleset: RulesetId, monsterName: string) =>
  `${ruleset}:${monsterName.trim().toLowerCase()}`;

const artworkByMonster = new Map<string, MonsterArtworkRecord>();
monsterArtwork.forEach((record) => {
  record.rulesets.forEach((ruleset) => {
    artworkByMonster.set(artworkKey(ruleset, record.monsterName), record);
  });
});

export const getMonsterArtwork = (
  ruleset: RulesetId,
  monsterName: string
): MonsterArtworkRecord | undefined => artworkByMonster.get(
  artworkKey(ruleset, monsterName)
);
