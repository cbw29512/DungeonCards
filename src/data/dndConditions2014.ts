import type { DndConditionRecord } from "../types/dndConditions";

const sourceReference = "Basic Rules 2014 · Appendix A: Conditions";
const sourceUrl = "https://www.dndbeyond.com/sources/dnd/basic-rules-2014/appendix-a-conditions";
const condition = (name: string, summary: string, effects: string[]): DndConditionRecord => ({
  id: `srd-5.1-2014-condition-${name.toLowerCase().replaceAll(" ", "-")}`,
  edition: "srd-5.1-2014",
  name,
  summary,
  effects,
  sourceReference,
  sourceUrl
});

export const dndConditions2014: DndConditionRecord[] = [
  condition("Blinded", "Sight is unavailable and attacks are heavily affected.", [
    "You cannot see and automatically fail ability checks that require sight.",
    "Attack rolls against you have Advantage.",
    "Your attack rolls have Disadvantage."
  ]),
  condition("Charmed", "The charmer gains protection and social leverage over you.", [
    "You cannot attack the charmer or target the charmer with harmful abilities or magical effects.",
    "The charmer has Advantage on ability checks to interact with you socially."
  ]),
  condition("Deafened", "Hearing is unavailable.", [
    "You cannot hear and automatically fail ability checks that require hearing."
  ]),
  condition("Exhaustion", "Six cumulative levels impose increasingly severe penalties.", [
    "Each level includes the effects of that level and every lower level.",
    "Use the edition-specific exhaustion tracker for the current cumulative effects.",
    "A qualifying Long Rest normally removes one level when food and drink requirements are met."
  ]),
  condition("Frightened", "Fear impairs your actions while the source remains visible.", [
    "You have Disadvantage on ability checks and attack rolls while the source of fear is within line of sight.",
    "You cannot willingly move closer to the source of fear."
  ]),
  condition("Grappled", "Your movement is stopped until the grapple ends.", [
    "Your Speed becomes 0 and cannot benefit from bonuses to Speed.",
    "The condition ends if the grappler is Incapacitated.",
    "The condition ends if an effect moves you outside the grappler's reach or the grappling effect's reach."
  ]),
  condition("Incapacitated", "You cannot take actions or reactions.", [
    "You cannot take Actions.",
    "You cannot take Reactions."
  ]),
  condition("Invisible", "You are unseen without special senses or magic, and attacks are affected.", [
    "You are impossible to see without magic or a special sense and count as heavily obscured for hiding.",
    "Your location can still be detected by noise, tracks, or other evidence.",
    "Attack rolls against you have Disadvantage.",
    "Your attack rolls have Advantage."
  ]),
  condition("Paralyzed", "You are Incapacitated, immobile, and especially vulnerable at close range.", [
    "You are Incapacitated and cannot move or speak.",
    "You automatically fail Strength and Dexterity saving throws.",
    "Attack rolls against you have Advantage.",
    "A hit from an attacker within 5 feet is a Critical Hit."
  ]),
  condition("Petrified", "You and carried nonmagical gear become solid matter.", [
    "Your weight increases tenfold and you stop aging.",
    "You are Incapacitated, cannot move or speak, and are unaware of your surroundings.",
    "Attack rolls against you have Advantage; you automatically fail Strength and Dexterity saves.",
    "You have Resistance to all damage.",
    "You are immune to poison and disease; existing poison or disease is suspended rather than removed."
  ]),
  condition("Poisoned", "Poison impairs attacks and general tasks.", [
    "You have Disadvantage on attack rolls and ability checks."
  ]),
  condition("Prone", "You are on the ground until you stand.", [
    "Your movement options are crawling or standing up to end the condition.",
    "Your attack rolls have Disadvantage.",
    "An attack against you has Advantage if the attacker is within 5 feet; otherwise it has Disadvantage."
  ]),
  condition("Restrained", "Movement stops and both attacks and Dexterity saves are impaired.", [
    "Your Speed becomes 0 and cannot benefit from bonuses to Speed.",
    "Attack rolls against you have Advantage, and your attack rolls have Disadvantage.",
    "You have Disadvantage on Dexterity saving throws."
  ]),
  condition("Stunned", "You are Incapacitated and unable to move normally.", [
    "You are Incapacitated, cannot move, and can speak only falteringly.",
    "You automatically fail Strength and Dexterity saving throws.",
    "Attack rolls against you have Advantage."
  ]),
  condition("Unconscious", "You are unaware, helpless, and vulnerable to nearby attacks.", [
    "You are Incapacitated, cannot move or speak, and are unaware of your surroundings.",
    "You drop what you are holding and fall Prone.",
    "You automatically fail Strength and Dexterity saving throws.",
    "Attack rolls against you have Advantage.",
    "A hit from an attacker within 5 feet is a Critical Hit."
  ])
];
