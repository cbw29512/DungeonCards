import type { DndConditionRecord } from "../types/dndConditions";

const sourceReference = "Free Rules 2024 · Rules Glossary: Conditions";
const sourceUrl = "https://www.dndbeyond.com/sources/dnd/free-rules/rules-glossary";
const condition = (name: string, summary: string, effects: string[]): DndConditionRecord => ({
  id: `srd-5.2.1-2024-condition-${name.toLowerCase().replaceAll(" ", "-")}`,
  edition: "srd-5.2.1-2024",
  name,
  summary,
  effects,
  sourceReference,
  sourceUrl
});

export const dndConditions2024: DndConditionRecord[] = [
  condition("Blinded", "Sight is unavailable and attacks are heavily affected.", [
    "You cannot see and automatically fail ability checks that require sight.",
    "Attack rolls against you have Advantage.",
    "Your attack rolls have Disadvantage."
  ]),
  condition("Charmed", "The charmer gains protection and social leverage over you.", [
    "You cannot attack the charmer or target the charmer with damaging abilities or magical effects.",
    "The charmer has Advantage on ability checks to interact with you socially."
  ]),
  condition("Deafened", "Hearing is unavailable.", [
    "You cannot hear and automatically fail ability checks that require hearing."
  ]),
  condition("Exhaustion", "Six cumulative levels reduce d20 Tests and Speed before death at level 6.", [
    "Subtract twice your Exhaustion level from every d20 Test.",
    "Reduce your Speed by 5 feet for each Exhaustion level.",
    "You die when your Exhaustion level reaches 6.",
    "Finishing a Long Rest normally removes one Exhaustion level."
  ]),
  condition("Frightened", "Fear impairs your actions while the source remains visible.", [
    "You have Disadvantage on ability checks and attack rolls while the source of fear is within line of sight.",
    "You cannot willingly move closer to the source of fear."
  ]),
  condition("Grappled", "Your Speed is 0, the grappler draws your attacks, and the grappler can drag or carry you.", [
    "Your Speed is 0 and cannot increase.",
    "Your attacks have Disadvantage against targets other than the grappler.",
    "The grappler can move you, but each foot moved costs the grappler 1 extra foot unless you are Tiny or at least two sizes smaller.",
    "The condition ends when the grapple ends, including when the grappler is Incapacitated or you are moved beyond its reach."
  ]),
  condition("Incapacitated", "Actions stop, concentration ends, speech is unavailable, and initiative suffers.", [
    "You cannot take an Action, Bonus Action, or Reaction.",
    "Your Concentration is broken.",
    "You cannot speak.",
    "If you are Incapacitated when rolling Initiative, you have Disadvantage on the roll."
  ]),
  condition("Invisible", "You are concealed from ordinary sight and gain initiative and attack benefits unless an observer can see you.", [
    "You have Advantage on Initiative rolls.",
    "You cannot be affected by an effect that requires its target to be seen unless the creator can somehow see you.",
    "Attack rolls against you have Disadvantage, and your attack rolls have Advantage, unless the other creature can see you."
  ]),
  condition("Paralyzed", "You are Incapacitated, immobile, and especially vulnerable at close range.", [
    "You are Incapacitated.",
    "Your Speed is 0 and cannot increase.",
    "You automatically fail Strength and Dexterity saving throws.",
    "Attack rolls against you have Advantage.",
    "A hit from an attacker within 5 feet is a Critical Hit."
  ]),
  condition("Petrified", "You and carried nonmagical gear become solid matter.", [
    "Your weight increases tenfold and you stop aging.",
    "You are Incapacitated, your Speed is 0, and you are unaware of your surroundings.",
    "Attack rolls against you have Advantage; you automatically fail Strength and Dexterity saves.",
    "You have Resistance to all damage.",
    "You are immune to the Poisoned condition and disease; an existing poison or disease is suspended rather than removed."
  ]),
  condition("Poisoned", "Poison impairs attacks and general tasks.", [
    "You have Disadvantage on attack rolls and ability checks."
  ]),
  condition("Prone", "You are on the ground until you stand.", [
    "Your movement options are crawling or spending movement equal to half your Speed to stand and end the condition.",
    "Your attack rolls have Disadvantage.",
    "An attack against you has Advantage if the attacker is within 5 feet; otherwise it has Disadvantage."
  ]),
  condition("Restrained", "Movement stops and both attacks and Dexterity saves are impaired.", [
    "Your Speed is 0 and cannot increase.",
    "Attack rolls against you have Advantage, and your attack rolls have Disadvantage.",
    "You have Disadvantage on Dexterity saving throws."
  ]),
  condition("Stunned", "You are Incapacitated and vulnerable, but the condition itself does not set your Speed to 0.", [
    "You are Incapacitated.",
    "You automatically fail Strength and Dexterity saving throws.",
    "Attack rolls against you have Advantage."
  ]),
  condition("Unconscious", "You are unaware, Prone, immobile, and vulnerable to nearby attacks.", [
    "You are Incapacitated, drop what you are holding, and fall Prone.",
    "Your Speed is 0 and cannot increase.",
    "You automatically fail Strength and Dexterity saving throws.",
    "Attack rolls against you have Advantage.",
    "A hit from an attacker within 5 feet is a Critical Hit.",
    "You are unaware of your surroundings."
  ])
];
