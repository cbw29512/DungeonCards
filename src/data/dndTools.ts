import type { RulesetId } from "../types/ruleCards";

export type DndToolAbility = "Strength" | "Dexterity" | "Intelligence" | "Wisdom" | "Charisma";
export type DndToolCategory = "artisan" | "other";

export type DndToolVariant = {
  id: string;
  name: string;
  costCp: number;
  weightPounds?: number;
};

export type DndToolDefinition = {
  id: string;
  name: string;
  category: DndToolCategory;
  costCp?: number;
  weightPounds?: number;
  variants?: DndToolVariant[];
  ability2024: DndToolAbility;
  utilize2024: string[];
  craft2024: string[];
  procedure2014: string;
};

const artisanProcedure = "Choose the ability that fits the task. Proficiency with this specific tool lets you add your Proficiency Bonus to an ability check made using it in the craft or trade.";

export const dndToolCatalog: DndToolDefinition[] = [
  { id: "alchemist", name: "Alchemist’s Supplies", category: "artisan", costCp: 5000, weightPounds: 8, ability2024: "Intelligence", utilize2024: ["Identify a substance (DC 15)", "Start a fire (DC 15)"], craft2024: ["Acid", "Alchemist’s Fire", "Component Pouch", "Oil", "Paper", "Perfume"], procedure2014: artisanProcedure },
  { id: "brewer", name: "Brewer’s Supplies", category: "artisan", costCp: 2000, weightPounds: 9, ability2024: "Intelligence", utilize2024: ["Detect poisoned drink (DC 15)", "Identify alcohol (DC 10)"], craft2024: ["Antitoxin"], procedure2014: artisanProcedure },
  { id: "calligrapher", name: "Calligrapher’s Supplies", category: "artisan", costCp: 1000, weightPounds: 5, ability2024: "Dexterity", utilize2024: ["Write text with impressive flourishes that guard against forgery (DC 15)"], craft2024: ["Ink", "Spell Scroll"], procedure2014: artisanProcedure },
  { id: "carpenter", name: "Carpenter’s Tools", category: "artisan", costCp: 800, weightPounds: 6, ability2024: "Strength", utilize2024: ["Seal or pry open a door or container (DC 20)"], craft2024: ["Club", "Greatclub", "Quarterstaff", "Barrel", "Chest", "Ladder", "Pole", "Portable Ram", "Torch"], procedure2014: artisanProcedure },
  { id: "cartographer", name: "Cartographer’s Tools", category: "artisan", costCp: 1500, weightPounds: 6, ability2024: "Wisdom", utilize2024: ["Draft a map of a small area (DC 15)"], craft2024: ["Map"], procedure2014: artisanProcedure },
  { id: "cobbler", name: "Cobbler’s Tools", category: "artisan", costCp: 500, weightPounds: 5, ability2024: "Dexterity", utilize2024: ["Modify footwear to give Advantage on the wearer’s next Dexterity (Acrobatics) check (DC 10)"], craft2024: ["Climber’s Kit"], procedure2014: artisanProcedure },
  { id: "cook", name: "Cook’s Utensils", category: "artisan", costCp: 100, weightPounds: 8, ability2024: "Wisdom", utilize2024: ["Improve food’s flavor (DC 10)", "Detect spoiled or poisoned food (DC 15)"], craft2024: ["Rations"], procedure2014: artisanProcedure },
  { id: "glassblower", name: "Glassblower’s Tools", category: "artisan", costCp: 3000, weightPounds: 5, ability2024: "Intelligence", utilize2024: ["Discern what a glass object held in the past 24 hours (DC 15)"], craft2024: ["Glass Bottle", "Magnifying Glass", "Spyglass", "Vial"], procedure2014: artisanProcedure },
  { id: "jeweler", name: "Jeweler’s Tools", category: "artisan", costCp: 2500, weightPounds: 2, ability2024: "Intelligence", utilize2024: ["Discern a gem’s value (DC 15)"], craft2024: ["Arcane Focus", "Holy Symbol"], procedure2014: artisanProcedure },
  { id: "leatherworker", name: "Leatherworker’s Tools", category: "artisan", costCp: 500, weightPounds: 5, ability2024: "Dexterity", utilize2024: ["Add a design to a leather item (DC 10)"], craft2024: ["Sling", "Whip", "Hide Armor", "Leather Armor", "Studded Leather Armor", "Backpack", "Crossbow Bolt Case", "Map or Scroll Case", "Parchment", "Pouch", "Quiver", "Waterskin"], procedure2014: artisanProcedure },
  { id: "mason", name: "Mason’s Tools", category: "artisan", costCp: 1000, weightPounds: 8, ability2024: "Strength", utilize2024: ["Chisel a symbol or hole in stone (DC 10)"], craft2024: ["Block and Tackle"], procedure2014: artisanProcedure },
  { id: "painter", name: "Painter’s Supplies", category: "artisan", costCp: 1000, weightPounds: 5, ability2024: "Wisdom", utilize2024: ["Paint a recognizable image of something you’ve seen (DC 10)"], craft2024: ["Druidic Focus", "Holy Symbol"], procedure2014: artisanProcedure },
  { id: "potter", name: "Potter’s Tools", category: "artisan", costCp: 1000, weightPounds: 3, ability2024: "Intelligence", utilize2024: ["Discern what a ceramic object held in the past 24 hours (DC 15)"], craft2024: ["Jug", "Lamp"], procedure2014: artisanProcedure },
  { id: "smith", name: "Smith’s Tools", category: "artisan", costCp: 2000, weightPounds: 8, ability2024: "Strength", utilize2024: ["Pry open a door or container (DC 20)"], craft2024: ["Most Melee weapons", "Medium armor except Hide", "Heavy armor", "Ball Bearings", "Bucket", "Caltrops", "Chain", "Crowbar", "Firearm Bullets", "Grappling Hook", "Iron Pot", "Iron Spikes", "Sling Bullets"], procedure2014: artisanProcedure },
  { id: "tinker", name: "Tinker’s Tools", category: "artisan", costCp: 5000, weightPounds: 10, ability2024: "Dexterity", utilize2024: ["Assemble a Tiny scrap item that falls apart in 1 minute (DC 20)"], craft2024: ["Musket", "Pistol", "Bell", "Bullseye Lantern", "Flask", "Hooded Lantern", "Hunting Trap", "Lock", "Manacles", "Mirror", "Shovel", "Signal Whistle", "Tinderbox"], procedure2014: artisanProcedure },
  { id: "weaver", name: "Weaver’s Tools", category: "artisan", costCp: 100, weightPounds: 5, ability2024: "Dexterity", utilize2024: ["Mend a tear in clothing (DC 10)", "Sew a Tiny design (DC 10)"], craft2024: ["Padded Armor", "Basket", "Bedroll", "Blanket", "Fine Clothes", "Net", "Robe", "Rope", "Sack", "String", "Tent", "Traveler’s Clothes"], procedure2014: artisanProcedure },
  { id: "woodcarver", name: "Woodcarver’s Tools", category: "artisan", costCp: 100, weightPounds: 5, ability2024: "Dexterity", utilize2024: ["Carve a pattern in wood (DC 10)"], craft2024: ["Club", "Greatclub", "Quarterstaff", "Most Ranged weapons", "Arcane Focus", "Arrows", "Bolts", "Druidic Focus", "Ink Pen", "Needles"], procedure2014: artisanProcedure },

  { id: "disguise", name: "Disguise Kit", category: "other", costCp: 2500, weightPounds: 3, ability2024: "Charisma", utilize2024: ["Apply makeup (DC 10)"], craft2024: ["Costume"], procedure2014: "Proficiency lets you add your Proficiency Bonus to ability checks made to create a visual disguise with the kit." },
  { id: "forgery", name: "Forgery Kit", category: "other", costCp: 1500, weightPounds: 5, ability2024: "Dexterity", utilize2024: ["Mimic 10 or fewer words of another person’s handwriting (DC 15)", "Duplicate a wax seal (DC 20)"], craft2024: [], procedure2014: "Proficiency lets you add your Proficiency Bonus to ability checks made to create a physical forgery of a document." },
  { id: "gaming", name: "Gaming Set", category: "other", ability2024: "Wisdom", utilize2024: ["Discern whether someone is cheating (DC 10)", "Win the game (DC 20)"], craft2024: [], procedure2014: "Choose the relevant ability for the game. Proficiency with the specific gaming set lets you add your Proficiency Bonus to checks made to play it.", variants: [
    { id: "dice", name: "Dice Set", costCp: 10 },
    { id: "dragonchess", name: "Dragonchess Set", costCp: 100, weightPounds: 0.5 },
    { id: "cards", name: "Playing Card Set", costCp: 50 },
    { id: "three-dragon-ante", name: "Three-Dragon Ante Set", costCp: 100 }
  ] },
  { id: "herbalism", name: "Herbalism Kit", category: "other", costCp: 500, weightPounds: 3, ability2024: "Intelligence", utilize2024: ["Identify a plant (DC 10)"], craft2024: ["Antitoxin", "Candle", "Healer’s Kit", "Potion of Healing"], procedure2014: "Proficiency lets you add your Proficiency Bonus to checks made to identify or apply herbs and is required to create antitoxin and Potions of Healing." },
  { id: "instrument", name: "Musical Instrument", category: "other", ability2024: "Charisma", utilize2024: ["Play a known tune (DC 10)", "Improvise a song (DC 15)"], craft2024: [], procedure2014: "Proficiency with the specific instrument lets you add your Proficiency Bonus to ability checks made to play it. A bard can use a musical instrument as a spellcasting focus.", variants: [
    { id: "bagpipes", name: "Bagpipes", costCp: 3000, weightPounds: 6 },
    { id: "drum", name: "Drum", costCp: 600, weightPounds: 3 },
    { id: "dulcimer", name: "Dulcimer", costCp: 2500, weightPounds: 10 },
    { id: "flute", name: "Flute", costCp: 200, weightPounds: 1 },
    { id: "horn", name: "Horn", costCp: 300, weightPounds: 2 },
    { id: "lute", name: "Lute", costCp: 3500, weightPounds: 2 },
    { id: "lyre", name: "Lyre", costCp: 3000, weightPounds: 2 },
    { id: "pan-flute", name: "Pan Flute", costCp: 1200, weightPounds: 2 },
    { id: "shawm", name: "Shawm", costCp: 200, weightPounds: 1 },
    { id: "viol", name: "Viol", costCp: 3000, weightPounds: 1 }
  ] },
  { id: "navigator", name: "Navigator’s Tools", category: "other", costCp: 2500, weightPounds: 2, ability2024: "Wisdom", utilize2024: ["Plot a course (DC 10)", "Determine position by stargazing (DC 15)"], craft2024: [], procedure2014: "Proficiency lets you chart and follow a ship’s course and add your Proficiency Bonus to ability checks made to avoid getting lost at sea." },
  { id: "poisoner", name: "Poisoner’s Kit", category: "other", costCp: 5000, weightPounds: 2, ability2024: "Intelligence", utilize2024: ["Detect a poisoned object (DC 10)"], craft2024: ["Basic Poison"], procedure2014: "Proficiency lets you add your Proficiency Bonus to ability checks made to craft or use poisons." },
  { id: "thieves", name: "Thieves’ Tools", category: "other", costCp: 2500, weightPounds: 1, ability2024: "Dexterity", utilize2024: ["Pick a lock (DC 15)", "Disarm a trap (DC 15)"], craft2024: [], procedure2014: "Proficiency lets you add your Proficiency Bonus to ability checks made to disarm traps or open locks. Some tasks, including opening a lock, can require proficiency to attempt or help." }
];

export const dndToolSourceByRuleset: Record<RulesetId, { url: string; reference: string }> = {
  "srd-5.1-2014": {
    url: "https://www.dndbeyond.com/sources/dnd/basic-rules-2014/equipment",
    reference: "Basic Rules 2014 · Equipment: Tools"
  },
  "srd-5.2.1-2024": {
    url: "https://www.dndbeyond.com/sources/dnd/br-2024/equipment",
    reference: "Free Rules 2024 · Equipment: Tools"
  }
};
