import type { CocCharacteristics } from "../utils/cocInvestigator";

export type CocInvestigatorEra = "1920s" | "modern";

export type CocOccupationCategory =
  | "academic"
  | "investigative"
  | "medical"
  | "technical"
  | "social"
  | "field";

export type CocOccupationRecord = {
  id: string;
  name: string;
  category: CocOccupationCategory;
  eras: CocInvestigatorEra[];
  summary: string;
  suggestedSkills: string[];
  creditRatingRange: [number, number];
  contacts: string[];
  typicalGear: string[];
  complication: string;
};

export type CocInvestigatorRecord = {
  id: string;
  name: string;
  pronouns: string;
  age: number;
  era: CocInvestigatorEra;
  occupationId: string;
  residence: string;
  birthplace: string;
  characteristics: CocCharacteristics;
  luck: number;
  cthulhuMythos: number;
  skills: Record<string, number>;
  weaponIds: string[];
  biography: string;
  ideology: string;
  significantPeople: string[];
  meaningfulLocations: string[];
  treasuredPossessions: string[];
  traits: string[];
  notes: string[];
};