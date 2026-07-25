import type { DndMovementProcedure } from "../types/dndMovement";

const combatUrl = "https://www.dndbeyond.com/sources/dnd/basic-rules-2014/combat";
const abilityUrl = "https://www.dndbeyond.com/sources/dnd/basic-rules-2014/using-ability-scores";
const procedure = (
  id: string,
  category: string,
  title: string,
  summary: string,
  steps: string[],
  sourceReference = "Basic Rules 2014 · Combat",
  sourceUrl = combatUrl
): DndMovementProcedure => ({
  id: `srd-5.1-2014-${id}`,
  edition: "srd-5.1-2014",
  category,
  title,
  summary,
  steps,
  sourceReference,
  sourceUrl
});

export const dndMovement2014: DndMovementProcedure[] = [
  procedure("movement", "Movement", "Move and break up movement", "Spend any portion of your Speed before, between, or after actions and attacks on your turn.", [
    "Track the total distance moved against your Speed.",
    "Movement can be split before and after your action.",
    "When an action grants multiple weapon attacks, movement can also be split between those attacks."
  ]),
  procedure("terrain", "Movement", "Difficult terrain and occupied spaces", "Difficult spaces and creature-occupied spaces consume movement faster.", [
    "Each foot through Difficult Terrain costs 1 extra foot.",
    "Another creature's space counts as Difficult Terrain.",
    "You can move through a nonhostile creature's space; hostile passage normally requires the creature to be at least two sizes larger or smaller.",
    "You cannot willingly end movement in another creature's space."
  ]),
  procedure("crawl-climb-swim", "Movement", "Crawling, climbing, and swimming", "Special movement normally costs 1 extra foot for every foot traveled.", [
    "Crawling, climbing, or swimming 1 foot normally costs 2 feet of movement.",
    "In Difficult Terrain, the costs combine, so 1 foot normally costs 3 feet.",
    "A relevant climbing or swimming Speed can replace the extra movement cost when a rule grants one."
  ]),
  procedure("jumping", "Movement", "Long jumps and high jumps", "Jump distance is derived from Strength and still consumes movement.", [
    "After a 10-foot run, a long jump covers up to your Strength score in feet; a standing long jump covers half.",
    "After a 10-foot run, a high jump rises 3 + Strength modifier feet; a standing high jump rises half.",
    "Every foot jumped costs 1 foot of movement.",
    "The DM can call for Athletics or Acrobatics checks when obstacles, unusual height, or difficult landings matter."
  ]),
  procedure("cover", "Position", "Half, three-quarters, and total cover", "Only the most protective applicable degree of cover applies.", [
    "Half Cover grants +2 AC and +2 to Dexterity saving throws.",
    "Three-Quarters Cover grants +5 AC and +5 to Dexterity saving throws.",
    "Total Cover prevents direct targeting by attacks and spells, though an area effect might still reach the space."
  ]),
  procedure("grapple", "Special attacks", "Grapple with an opposed check", "Replace one Attack-action attack with a Strength (Athletics) contest.", [
    "The target must be within reach and no more than one size larger; you need a free hand.",
    "Roll Strength (Athletics) against the target's Strength (Athletics) or Dexterity (Acrobatics), chosen by the target.",
    "On success, the target gains the Grappled condition.",
    "The target can use its action to repeat Athletics or Acrobatics against the grappler's Athletics to escape.",
    "Dragging or carrying the target halves your Speed unless it is at least two sizes smaller."
  ]),
  procedure("shove", "Special attacks", "Shove with an opposed check", "Replace one Attack-action attack to push a target or knock it Prone.", [
    "The target must be within reach and no more than one size larger.",
    "Roll Strength (Athletics) against the target's Strength (Athletics) or Dexterity (Acrobatics), chosen by the target.",
    "On success, either push the target 5 feet away or give it the Prone condition."
  ]),
  procedure("hide", "Stealth", "Hide and remain unnoticed", "The DM decides whether hiding is possible, then detection depends on Stealth and Perception.", [
    "Make a Dexterity (Stealth) check when circumstances allow hiding.",
    "You cannot hide from a creature that can see you clearly, and noise can reveal your position.",
    "An active search uses Wisdom (Perception) against the recorded Stealth result.",
    "The DM can compare the Stealth result to Passive Perception when a creature is not actively searching.",
    "Attacking while unseen normally reveals your location after the attack."
  ], "Basic Rules 2014 · Using Ability Scores: Hiding", abilityUrl),
  procedure("opportunity", "Reactions", "Opportunity attacks and Disengage", "Leaving an enemy's reach can trigger one reaction attack unless movement is protected.", [
    "A creature you can see triggers an Opportunity Attack when it moves out of your reach using its movement.",
    "Spend your Reaction to make one melee attack immediately before it leaves your reach.",
    "Forced movement, teleportation, and movement that uses no action, reaction, or movement do not normally trigger it.",
    "The Disengage action prevents your movement from provoking Opportunity Attacks for the rest of the turn."
  ])
];
