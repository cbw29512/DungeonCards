import type { DndMovementProcedure } from "../types/dndMovement";

const sourceReference = "Free Rules 2024 · Rules Glossary";
const sourceUrl = "https://www.dndbeyond.com/sources/dnd/br-2024/rules-glossary";
const procedure = (
  id: string,
  category: string,
  title: string,
  summary: string,
  steps: string[]
): DndMovementProcedure => ({
  id: `srd-5.2.1-2024-${id}`,
  edition: "srd-5.2.1-2024",
  category,
  title,
  summary,
  steps,
  sourceReference,
  sourceUrl
});

export const dndMovement2024: DndMovementProcedure[] = [
  procedure("movement", "Movement", "Move and break up movement", "Spend any portion of your Speed before, between, or after actions and attacks on your turn.", [
    "Track the total distance moved against the Speed being used.",
    "Movement can be split before and after your action.",
    "When Extra Attack or another feature grants multiple attacks in the Attack action, movement can be split between those attacks."
  ]),
  procedure("terrain", "Movement", "Difficult Terrain and creature spaces", "Difficult Terrain costs extra movement and is not cumulative with itself.", [
    "Each foot through Difficult Terrain costs 1 extra foot.",
    "A space occupied by a creature that is not Tiny or your ally is Difficult Terrain.",
    "Other examples include heavy snow, ice, rubble, undergrowth, shallow liquid, narrow openings, and steep slopes.",
    "Multiple causes do not stack; a space either is or is not Difficult Terrain."
  ]),
  procedure("crawl-climb-swim", "Movement", "Crawling, climbing, and swimming", "Special movement normally costs 1 extra foot for every foot traveled.", [
    "Crawling, climbing, or swimming 1 foot normally costs 2 feet of movement.",
    "In Difficult Terrain, 1 foot of this special movement normally costs 3 feet.",
    "Using a matching Climb Speed or Swim Speed removes that mode's extra cost, but not Difficult Terrain's extra cost.",
    "The DM can call for DC 15 Strength (Athletics) in slippery climbing or rough-water situations."
  ]),
  procedure("jumping", "Movement", "Long jumps and high jumps", "Jump distance is derived from Strength and every foot jumped consumes movement.", [
    "After moving at least 10 feet immediately beforehand, a long jump covers up to your Strength score in feet; a standing long jump covers half.",
    "After moving at least 10 feet immediately beforehand, a high jump rises 3 + Strength modifier feet, minimum 0; a standing high jump rises half.",
    "Landing a long jump in Difficult Terrain requires a DC 10 Dexterity (Acrobatics) check or you gain the Prone condition.",
    "The DM can require DC 10 Strength (Athletics) to clear a low obstacle during a long jump."
  ]),
  procedure("cover", "Position", "Half, three-quarters, and total cover", "Only the most protective applicable degree of cover applies.", [
    "Half Cover grants +2 AC and +2 to Dexterity saving throws.",
    "Three-Quarters Cover grants +5 AC and +5 to Dexterity saving throws.",
    "Total Cover prevents direct targeting, though an area effect might still reach the protected space."
  ]),
  procedure("unarmed-grapple", "Special attacks", "Grapple with an Unarmed Strike", "Choose Grapple as the effect of an Unarmed Strike against a target within 5 feet.", [
    "The target must be no more than one size larger, and you need a free hand.",
    "The target chooses a Strength or Dexterity saving throw.",
    "The save and escape DC equals 8 + your Strength modifier + Proficiency Bonus.",
    "On a failed save, the target gains the Grappled condition.",
    "The target can use its action to make Athletics or Acrobatics against the escape DC."
  ]),
  procedure("unarmed-shove", "Special attacks", "Shove with an Unarmed Strike", "Choose Shove as the effect of an Unarmed Strike against a target within 5 feet.", [
    "The target must be no more than one size larger.",
    "The target chooses a Strength or Dexterity saving throw against 8 + your Strength modifier + Proficiency Bonus.",
    "On a failed save, either push the target 5 feet away or give it the Prone condition."
  ]),
  procedure("hide-search", "Stealth", "Hide, record the result, and Search", "The Hide action has explicit prerequisites and creates a detection DC from the Stealth result.", [
    "Start Heavily Obscured or behind Three-Quarters or Total Cover and outside every enemy's line of sight.",
    "Make a DC 15 Dexterity (Stealth) check.",
    "On success, record the total as the DC to find you and gain the Invisible condition while hidden.",
    "You stop being hidden after a loud sound, discovery, an attack roll, or casting a spell with a Verbal component.",
    "The Search action uses a Wisdom check; Perception applies when detecting a concealed creature or object."
  ]),
  procedure("opportunity", "Reactions", "Opportunity Attacks and Disengage", "Certain voluntary movement out of reach can trigger one reaction attack.", [
    "A creature you can see triggers an Opportunity Attack when it leaves your reach using its action, Bonus Action, Reaction, or one of its Speeds.",
    "Spend your Reaction to make one melee attack with a weapon or an Unarmed Strike immediately before it leaves.",
    "The Disengage action prevents your movement from provoking Opportunity Attacks for the rest of the current turn."
  ])
];
