import type { CocInvestigatorRecord } from "../types/cocInvestigatorCatalog";
import { getCocOccupation } from "./cocOccupationCatalog";

type CocInvestigatorSeed = Omit<CocInvestigatorRecord, "skills">;

const occupationSkillValues = [70, 60, 60, 50, 50, 50, 40, 40] as const;
const personalInterestPool = [
  "Dodge",
  "Fighting (Brawl)",
  "First Aid",
  "Drive Auto",
  "Stealth",
  "Listen",
  "Photography",
  "Occult",
  "Navigate",
  "Computer Use",
  "Charm",
  "Survival"
];

const normalizeSkill = (skill: string): string => skill.trim().toLocaleLowerCase("en-US");

const buildSkills = (occupationId: string): Record<string, number> => {
  const occupation = getCocOccupation(occupationId);
  const occupationEntries = occupation.suggestedSkills.map((skill, index) => [
    skill,
    occupationSkillValues[index] ?? 40
  ] as const);
  const used = new Set([
    ...occupation.suggestedSkills.map(normalizeSkill),
    normalizeSkill("Credit Rating")
  ]);
  const interests = personalInterestPool
    .filter((skill) => !used.has(normalizeSkill(skill)))
    .slice(0, 4)
    .map((skill, index) => [skill, index === 0 ? 50 : 40] as const);

  return Object.fromEntries([
    ...occupationEntries,
    ["Credit Rating", 40] as const,
    ...interests
  ]);
};

const investigatorSeeds: CocInvestigatorSeed[] = [
  {
    id: "coc-original-evelyn-hart",
    name: "Evelyn Hart",
    pronouns: "she/her",
    age: 34,
    era: "1920s",
    occupationId: "coc-original-archive-researcher",
    residence: "Boston, Massachusetts",
    birthplace: "Portsmouth, New Hampshire",
    characteristics: { STR: 40, CON: 50, POW: 60, DEX: 50, APP: 50, SIZ: 60, INT: 80, EDU: 70 },
    luck: 55,
    weaponIds: ["coc-original-pocket-revolver"],
    biography: "Evelyn restores order to neglected collections and has an unnerving talent for connecting anonymous letters to forgotten court records. A sealed family archive recently contained correspondence dated three years after its author died, and the ink still smells fresh whenever the reading-room clock stops.",
    ideology: "Facts survive people, but only when someone accepts responsibility for preserving and confronting them.",
    significantPeople: ["Professor Miriam Vale, former mentor", "Jonas Hart, younger brother and harbor clerk"],
    meaningfulLocations: ["The basement stacks of the Alcott Historical Society", "Her father's shuttered print shop"],
    treasuredPossessions: ["A brass page weight", "Her mother's handwritten household ledger"],
    traits: ["Patient", "Precise", "Quietly stubborn"],
    notes: ["Distrusts undocumented claims", "Cannot resist correcting damaged catalog records"]
  },
  {
    id: "coc-original-isaiah-mercer",
    name: "Isaiah Mercer",
    pronouns: "he/him",
    age: 29,
    era: "1920s",
    occupationId: "coc-original-newspaper-correspondent",
    residence: "Chicago, Illinois",
    birthplace: "St. Louis, Missouri",
    characteristics: { STR: 50, CON: 60, POW: 50, DEX: 70, APP: 60, SIZ: 50, INT: 80, EDU: 40 },
    luck: 65,
    weaponIds: ["coc-original-service-revolver"],
    biography: "Isaiah built his reputation reporting on labor disputes without reducing people to headlines. His newest source insists that workers disappearing from a packing district are still clocking in every night, and payroll photographs show the same unidentified foreman standing behind each missing person.",
    ideology: "A fact hidden to protect the powerful is more dangerous than a fact printed before everyone feels ready.",
    significantPeople: ["Ruth Mercer, schoolteacher and older sister", "Eli Brenner, city-desk editor"],
    meaningfulLocations: ["A twenty-four-hour diner near the pressroom", "The roof of the Tribune annex"],
    treasuredPossessions: ["A dented press camera", "A fountain pen won in a card game"],
    traits: ["Quick-witted", "Restless", "Protective of sources"],
    notes: ["Knows when officials are stalling", "Keeps duplicate notes in a hidden location"]
  },
  {
    id: "coc-original-clara-voss",
    name: "Dr. Clara Voss",
    pronouns: "she/her",
    age: 41,
    era: "1920s",
    occupationId: "coc-original-rural-physician",
    residence: "Ashfield County, Vermont",
    birthplace: "Albany, New York",
    characteristics: { STR: 50, CON: 70, POW: 60, DEX: 50, APP: 40, SIZ: 60, INT: 50, EDU: 80 },
    luck: 45,
    weaponIds: ["coc-original-hunting-shotgun", "coc-original-hunting-knife"],
    biography: "Clara serves isolated families who cannot easily reach a hospital and has delivered children during storms that erased every road. Several patients now exhibit identical scars despite living miles apart and denying contact, while their medical charts contain the same unfamiliar handwriting in margins Clara left blank.",
    ideology: "Fear is a symptom; suffering is the condition that must be treated before judgment or explanation.",
    significantPeople: ["Nora Pike, district nurse", "Dr. Leonard Voss, estranged father"],
    meaningfulLocations: ["Her two-room clinic", "The covered bridge where she survived a winter wreck"],
    treasuredPossessions: ["A leather medical bag", "A silver watch from her first patient"],
    traits: ["Direct", "Compassionate", "Unshaken by blood"],
    notes: ["Keeps meticulous patient histories", "Will not abandon someone under her care"]
  },
  {
    id: "coc-original-thomas-bell",
    name: "Thomas Bell",
    pronouns: "he/him",
    age: 37,
    era: "1920s",
    occupationId: "coc-original-radio-engineer",
    residence: "Pittsburgh, Pennsylvania",
    birthplace: "Cleveland, Ohio",
    characteristics: { STR: 60, CON: 50, POW: 50, DEX: 70, APP: 40, SIZ: 60, INT: 80, EDU: 50 },
    luck: 50,
    weaponIds: ["coc-original-trench-club"],
    biography: "Thomas installs transmitters for commercial stations and can identify failing equipment by the rhythm of its hum. For six weeks an unused receiver has broadcast his own voice describing events one day before they occur, and the predictions now include instructions addressed to someone standing behind him.",
    ideology: "Every signal has a source, even when finding that source proves the world was assembled incorrectly.",
    significantPeople: ["Ada Bell, spouse and accountant", "Marvin Cole, station operator"],
    meaningfulLocations: ["The rooftop aerial above Station KQX", "His crowded basement workshop"],
    treasuredPossessions: ["A homemade crystal receiver", "A notebook of unexplained frequencies"],
    traits: ["Methodical", "Skeptical", "Compulsively curious"],
    notes: ["Hears subtle mechanical changes", "Sleeps poorly near active radios"]
  },
  {
    id: "coc-original-lenora-price",
    name: "Lenora Price",
    pronouns: "she/her",
    age: 27,
    era: "1920s",
    occupationId: "coc-original-stage-performer",
    residence: "New York City, New York",
    birthplace: "Savannah, Georgia",
    characteristics: { STR: 40, CON: 50, POW: 70, DEX: 60, APP: 80, SIZ: 50, INT: 60, EDU: 50 },
    luck: 70,
    weaponIds: ["coc-original-pocket-revolver", "coc-original-pocket-knife"],
    biography: "Lenora headlines a successful touring melodrama and remembers every face in an audience. During the final scene in three different cities she saw the same empty seat occupied by a figure no one else could perceive, and her understudy now recites lines from a play that has never been written.",
    ideology: "A role reveals truth by giving fear somewhere else to stand while people decide what they can admit.",
    significantPeople: ["Mae Price, costume designer and cousin", "Vincent Hale, ambitious producer"],
    meaningfulLocations: ["The Orpheum dressing room", "A rehearsal hall above a closed bakery"],
    treasuredPossessions: ["A red silk scarf", "A marked-up copy of her first script"],
    traits: ["Magnetic", "Observant", "Proud"],
    notes: ["Can improvise under pressure", "Hates being watched from an unlit room"]
  },
  {
    id: "coc-original-samuel-okafor",
    name: "Samuel Okafor",
    pronouns: "he/him",
    age: 33,
    era: "1920s",
    occupationId: "coc-original-expedition-photographer",
    residence: "Philadelphia, Pennsylvania",
    birthplace: "Lagos, Nigeria",
    characteristics: { STR: 60, CON: 70, POW: 50, DEX: 80, APP: 40, SIZ: 50, INT: 50, EDU: 60 },
    luck: 60,
    weaponIds: ["coc-original-hunting-rifle", "coc-original-machete"],
    biography: "Samuel photographs scientific expeditions and insists that every image be logged before anyone invents a story around it. A recent plate shows the expedition party accompanied by a seventh person who cast no shadow and was never present, while the glass negative grows warmer whenever Samuel approaches water.",
    ideology: "Evidence matters most when it contradicts the witness holding it and refuses a convenient explanation.",
    significantPeople: ["Dr. Beatrice Nwosu, botanist", "Caleb Grant, darkroom assistant"],
    meaningfulLocations: ["His rented darkroom", "A cliff camp in the Blue Ridge Mountains"],
    treasuredPossessions: ["A folding field camera", "A weathered compass from his uncle"],
    traits: ["Resourceful", "Dryly humorous", "Careful with promises"],
    notes: ["Always records time and location", "Distrusts photographs that develop too quickly"]
  },
  {
    id: "coc-original-maya-chen",
    name: "Maya Chen",
    pronouns: "she/her",
    age: 31,
    era: "modern",
    occupationId: "coc-original-museum-registrar",
    residence: "Seattle, Washington",
    birthplace: "Vancouver, British Columbia",
    characteristics: { STR: 40, CON: 50, POW: 60, DEX: 50, APP: 60, SIZ: 50, INT: 80, EDU: 70 },
    luck: 55,
    weaponIds: [],
    biography: "Maya manages acquisitions and loans for a regional museum, where she has learned that paperwork can be more revealing than an object. A newly donated sculpture has a complete digital history but appears in photographs taken before its documented creation, and its shipping crate lists tomorrow as the return date.",
    ideology: "Provenance is a chain of human choices; a missing link always protects someone who expects silence.",
    significantPeople: ["Dr. Amina Shah, curator", "Elliot Chen, younger sibling and paramedic"],
    meaningfulLocations: ["The museum loading dock after hours", "A waterfront tea shop"],
    treasuredPossessions: ["A grandfather's seal stamp", "A portable ultraviolet light"],
    traits: ["Organized", "Diplomatic", "Hard to intimidate"],
    notes: ["Photographs every unpacking", "Never touches an unknown object barehanded"]
  },
  {
    id: "coc-original-rafael-ortiz",
    name: "Rafael Ortiz",
    pronouns: "he/him",
    age: 38,
    era: "modern",
    occupationId: "coc-original-insurance-examiner",
    residence: "Tampa, Florida",
    birthplace: "San Juan, Puerto Rico",
    characteristics: { STR: 50, CON: 60, POW: 50, DEX: 70, APP: 60, SIZ: 50, INT: 80, EDU: 40 },
    luck: 50,
    weaponIds: ["coc-original-compact-pistol"],
    biography: "Rafael investigates major property claims and can tell when a fire was staged before the debris cools. Five unrelated houses recently suffered identical interior damage without heat, smoke, or forced entry, and every owner remembers hearing a claims adjuster knock before the loss occurred.",
    ideology: "Patterns do not care who is embarrassed by them, and evidence should not be negotiated into comfort.",
    significantPeople: ["Lucía Ortiz, architect and spouse", "Harold Wynn, veteran fire investigator"],
    meaningfulLocations: ["A hurricane-damaged neighborhood he helped rebuild", "The records room beneath his office"],
    treasuredPossessions: ["A laser measure", "A family photograph saved from a flood"],
    traits: ["Pragmatic", "Persistent", "Calm in damaged buildings"],
    notes: ["Documents before touching", "Dislikes conclusions reached before inspection"]
  },
  {
    id: "coc-original-nia-brooks",
    name: "Nia Brooks",
    pronouns: "she/her",
    age: 30,
    era: "modern",
    occupationId: "coc-original-emergency-nurse",
    residence: "Atlanta, Georgia",
    birthplace: "Birmingham, Alabama",
    characteristics: { STR: 50, CON: 70, POW: 60, DEX: 80, APP: 40, SIZ: 60, INT: 50, EDU: 50 },
    luck: 65,
    weaponIds: ["coc-original-hunting-knife"],
    biography: "Nia thrives in crowded emergency rooms and remembers what patients say when they think no one is listening. Three unconscious arrivals have spoken the same unknown phrase while displaying identical frostbite in midsummer, and each monitor briefly showed a second heartbeat beneath the first.",
    ideology: "People deserve competent care before anyone decides whether their story sounds believable or convenient.",
    significantPeople: ["Darius Brooks, firefighter and cousin", "Dr. Celeste Ward, emergency physician"],
    meaningfulLocations: ["Trauma bay four", "Her grandmother's front porch"],
    treasuredPossessions: ["Reliable trauma shears", "A voice message from her late mother"],
    traits: ["Decisive", "Empathetic", "Physically fearless"],
    notes: ["Notices subtle changes in breathing", "Keeps emergency supplies in her car"]
  },
  {
    id: "coc-original-owen-patel",
    name: "Owen Patel",
    pronouns: "he/him",
    age: 35,
    era: "modern",
    occupationId: "coc-original-industrial-chemist",
    residence: "Houston, Texas",
    birthplace: "Leicester, England",
    characteristics: { STR: 50, CON: 60, POW: 50, DEX: 40, APP: 50, SIZ: 60, INT: 80, EDU: 70 },
    luck: 45,
    weaponIds: [],
    biography: "Owen audits chemical processes after costly production failures and refuses to sign conclusions he cannot reproduce. A contaminated batch now changes composition whenever its sample is observed by more than one person, and the automated logs contain measurements recorded by instruments disconnected from power.",
    ideology: "A result that cannot be repeated is either a mistake, a fraud, or a warning that deserves attention.",
    significantPeople: ["Priya Patel, materials engineer and sister", "Martin Keene, union safety representative"],
    meaningfulLocations: ["A sealed pilot laboratory", "The public garden where he studies after work"],
    treasuredPossessions: ["A mechanical pencil", "A notebook containing every failed experiment"],
    traits: ["Analytical", "Cautious", "Uncomfortable with authority"],
    notes: ["Labels everything twice", "Becomes focused when a process behaves impossibly"]
  },
  {
    id: "coc-original-gabriela-reyes",
    name: "Gabriela Reyes",
    pronouns: "she/her",
    age: 32,
    era: "modern",
    occupationId: "coc-original-community-organizer",
    residence: "Los Angeles, California",
    birthplace: "El Paso, Texas",
    characteristics: { STR: 40, CON: 50, POW: 80, DEX: 60, APP: 70, SIZ: 50, INT: 60, EDU: 50 },
    luck: 70,
    weaponIds: [],
    biography: "Gabriela coordinates tenants, volunteers, and legal support across several neighborhoods. Residents of one apartment block report that an additional floor appears only during blackouts, yet city plans show a structural void in exactly that location and emergency calls from the missing floor arrive every night at 3:17.",
    ideology: "No one should face an institution—or a nightmare—alone when collective action can make truth visible.",
    significantPeople: ["Teresa Reyes, aunt and union steward", "Malik Thompson, housing attorney"],
    meaningfulLocations: ["The community resource center", "A mural-lined pedestrian tunnel"],
    treasuredPossessions: ["A battered contact notebook", "A key ring containing dozens of donated keys"],
    traits: ["Persuasive", "Loyal", "Impossible to discourage"],
    notes: ["Always knows who can help", "Takes threats against others personally"]
  },
  {
    id: "coc-original-daniel-cho",
    name: "Daniel Cho",
    pronouns: "he/him",
    age: 44,
    era: "modern",
    occupationId: "coc-original-railway-inspector",
    residence: "Denver, Colorado",
    birthplace: "Sacramento, California",
    characteristics: { STR: 60, CON: 70, POW: 50, DEX: 50, APP: 40, SIZ: 60, INT: 80, EDU: 50 },
    luck: 40,
    weaponIds: ["coc-original-heavy-revolver"],
    biography: "Daniel examines accidents and maintenance failures across mountain rail corridors. A freight train recently arrived with an extra sealed car whose serial number belongs to equipment scrapped before Daniel was born, and the car's wheel marks continue beyond the end of every photographed track.",
    ideology: "Systems fail in patterns; the danger begins when someone teaches the pattern to hide from inspection.",
    significantPeople: ["Grace Cho, adult daughter and civil engineer", "Wes Calder, retired conductor"],
    meaningfulLocations: ["A high-altitude maintenance shed", "The station café where crews trade rumors"],
    treasuredPossessions: ["A steel inspection gauge", "His first conductor's lantern"],
    traits: ["Thorough", "Reserved", "Dependable"],
    notes: ["Memorizes schedules", "Cannot ignore an unexplained mechanical sound"]
  }
];

export const cocInvestigatorCatalog: CocInvestigatorRecord[] = investigatorSeeds.map((seed) => ({
  ...seed,
  skills: buildSkills(seed.occupationId)
}));
