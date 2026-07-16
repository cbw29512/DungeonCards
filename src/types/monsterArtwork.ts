import type { RulesetId } from "./ruleCards";

export type MonsterArtworkLicenseId =
  | "public-domain"
  | "cc0-1.0"
  | "cc-by-4.0"
  | "cc-by-sa-4.0"
  | "gpl-2.0-or-later"
  | "direct-permission"
  | "original";

export type MonsterArtworkRecord = {
  id: string;
  monsterName: string;
  rulesets: RulesetId[];
  imageUrl: string;
  sourcePageUrl: string;
  title: string;
  creator: string;
  licenseId: MonsterArtworkLicenseId;
  licenseName: string;
  licenseUrl: string;
  attribution: string;
  modifications: string;
  verifiedOn: string;
};
