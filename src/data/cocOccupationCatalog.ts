import type {
  CocOccupationCategory,
  CocOccupationRecord
} from "../types/cocInvestigatorCatalog";

export const cocOccupationCategories: CocOccupationCategory[] = [
  "academic",
  "investigative",
  "medical",
  "technical",
  "social",
  "field"
];

export const cocOccupationCatalog: CocOccupationRecord[] = [
  {
    id: "coc-original-archive-researcher",
    name: "Archive Researcher",
    category: "academic",
    eras: ["1920s", "modern"],
    summary: "Tracks obscure people, institutions, and events through fragile records, private collections, and contradictory catalogs.",
    suggestedSkills: ["Library Use", "History", "Other Language", "Appraise", "Accounting", "Spot Hidden", "Persuade", "Law"],
    creditRatingRange: [20, 50],
    contacts: ["Librarians", "University staff", "Private collectors"],
    typicalGear: ["Notebook", "Magnifier", "Document sleeves"],
    complication: "Access often depends on donors or institutions that expect discretion in return."
  },
  {
    id: "coc-original-folklore-lecturer",
    name: "Folklore Lecturer",
    category: "academic",
    eras: ["1920s", "modern"],
    summary: "Studies oral traditions, regional fears, ritual practices, and the way communities reshape traumatic events into stories.",
    suggestedSkills: ["Anthropology", "History", "Occult", "Other Language", "Library Use", "Listen", "Persuade", "Psychology"],
    creditRatingRange: [20, 50],
    contacts: ["Local historians", "Students", "Religious communities"],
    typicalGear: ["Field recorder", "Index cards", "Regional maps"],
    complication: "Communities may resent outsiders who treat living beliefs as research material."
  },
  {
    id: "coc-original-museum-registrar",
    name: "Museum Registrar",
    category: "academic",
    eras: ["1920s", "modern"],
    summary: "Documents provenance, condition, movement, and ownership of artifacts while noticing when an object does not fit its paperwork.",
    suggestedSkills: ["Appraise", "History", "Library Use", "Accounting", "Spot Hidden", "Other Language", "Photography", "Persuade"],
    creditRatingRange: [30, 60],
    contacts: ["Curators", "Customs officials", "Conservators"],
    typicalGear: ["Condition forms", "Measuring tools", "Camera"],
    complication: "A suspicious acquisition can threaten donors, careers, and the institution's reputation."
  },
  {
    id: "coc-original-antiquarian-bookseller",
    name: "Antiquarian Bookseller",
    category: "academic",
    eras: ["1920s", "modern"],
    summary: "Finds rare books, identifies forged editions, and navigates private buyers who value secrecy as much as scholarship.",
    suggestedSkills: ["Appraise", "Library Use", "History", "Other Language", "Accounting", "Persuade", "Psychology", "Spot Hidden"],
    creditRatingRange: [20, 70],
    contacts: ["Book dealers", "Estate attorneys", "Collectors"],
    typicalGear: ["Catalogs", "Loupe", "Acid-free paper"],
    complication: "Clients may pursue books for reasons they refuse to explain."
  },
  {
    id: "coc-original-private-inquiry-agent",
    name: "Private Inquiry Agent",
    category: "investigative",
    eras: ["1920s", "modern"],
    summary: "Locates people, verifies stories, follows money, and gathers evidence for clients whose motives may be incomplete or false.",
    suggestedSkills: ["Spot Hidden", "Listen", "Psychology", "Disguise", "Law", "Stealth", "Persuade", "Photography"],
    creditRatingRange: [20, 50],
    contacts: ["Police clerks", "Hotel staff", "Process servers"],
    typicalGear: ["Camera", "Lockable case", "City directory"],
    complication: "The client controls the initial facts and may be using the investigation to find a victim."
  },
  {
    id: "coc-original-newspaper-correspondent",
    name: "Newspaper Correspondent",
    category: "investigative",
    eras: ["1920s", "modern"],
    summary: "Builds sources, checks claims under pressure, and enters unstable situations in search of a story that can survive publication.",
    suggestedSkills: ["Fast Talk", "Persuade", "Psychology", "Spot Hidden", "Listen", "Photography", "Library Use", "Other Language"],
    creditRatingRange: [20, 50],
    contacts: ["Editors", "Public officials", "Neighborhood sources"],
    typicalGear: ["Notebook", "Camera", "Press credentials"],
    complication: "Editors, owners, or authorities may suppress a true story for political or financial reasons."
  },
  {
    id: "coc-original-insurance-examiner",
    name: "Insurance Examiner",
    category: "investigative",
    eras: ["1920s", "modern"],
    summary: "Reconstructs accidents, evaluates suspicious losses, and notices patterns hidden beneath ordinary claims and damaged property.",
    suggestedSkills: ["Accounting", "Law", "Spot Hidden", "Psychology", "Photography", "Mechanical Repair", "Persuade", "Library Use"],
    creditRatingRange: [30, 60],
    contacts: ["Adjusters", "Fire investigators", "Contractors"],
    typicalGear: ["Measuring tape", "Camera", "Claim forms"],
    complication: "A profitable company may prefer a convenient explanation to a correct one."
  },
  {
    id: "coc-original-legal-investigator",
    name: "Legal Investigator",
    category: "investigative",
    eras: ["1920s", "modern"],
    summary: "Finds witnesses, tests testimony, organizes evidence, and identifies the detail that changes how a case must be argued.",
    suggestedSkills: ["Law", "Library Use", "Psychology", "Persuade", "Spot Hidden", "Listen", "Accounting", "Fast Talk"],
    creditRatingRange: [30, 70],
    contacts: ["Attorneys", "Court clerks", "Expert witnesses"],
    typicalGear: ["Case files", "Dictation device", "Reference books"],
    complication: "Protecting a client can conflict with exposing the truth."
  },
  {
    id: "coc-original-rural-physician",
    name: "Rural Physician",
    category: "medical",
    eras: ["1920s", "modern"],
    summary: "Provides broad medical care with limited support, recognizing how environment, poverty, and isolation shape illness and injury.",
    suggestedSkills: ["Medicine", "First Aid", "Biology", "Pharmacy", "Psychology", "Listen", "Persuade", "Drive Auto"],
    creditRatingRange: [30, 70],
    contacts: ["Pharmacists", "Local officials", "Families"],
    typicalGear: ["Medical bag", "Field dressings", "Reference manual"],
    complication: "Patients expect confidentiality even when a condition threatens the entire community."
  },
  {
    id: "coc-original-emergency-nurse",
    name: "Emergency Nurse",
    category: "medical",
    eras: ["modern"],
    summary: "Stabilizes patients amid confusion, rapidly separates urgent threats from distracting injuries, and reads stressed people well.",
    suggestedSkills: ["First Aid", "Medicine", "Psychology", "Listen", "Spot Hidden", "Persuade", "Science (Biology)", "Drive Auto"],
    creditRatingRange: [20, 50],
    contacts: ["Paramedics", "Hospital staff", "Social workers"],
    typicalGear: ["Trauma kit", "Protective gloves", "Flashlight"],
    complication: "Duty and compassion make it difficult to abandon a dangerous patient or scene."
  },
  {
    id: "coc-original-mortuary-technician",
    name: "Mortuary Technician",
    category: "medical",
    eras: ["1920s", "modern"],
    summary: "Prepares remains, documents unusual injuries, and recognizes when official paperwork does not match what happened to the dead.",
    suggestedSkills: ["Medicine", "Biology", "Chemistry", "Spot Hidden", "Photography", "Psychology", "Accounting", "Mechanical Repair"],
    creditRatingRange: [20, 50],
    contacts: ["Coroners", "Funeral directors", "Police investigators"],
    typicalGear: ["Protective apron", "Instrument case", "Record ledger"],
    complication: "Powerful families may demand silence about what the body reveals."
  },
  {
    id: "coc-original-field-psychologist",
    name: "Field Psychologist",
    category: "medical",
    eras: ["modern"],
    summary: "Evaluates trauma, group behavior, memory, and persuasion outside the safety of a clinic or controlled study.",
    suggestedSkills: ["Psychology", "Psychoanalysis", "Listen", "Persuade", "Anthropology", "Library Use", "Spot Hidden", "Other Language"],
    creditRatingRange: [30, 60],
    contacts: ["Clinicians", "Researchers", "Crisis teams"],
    typicalGear: ["Assessment forms", "Audio recorder", "Field notebook"],
    complication: "Understanding a subject does not guarantee the ability to help them—or remain detached."
  },
  {
    id: "coc-original-radio-engineer",
    name: "Radio Engineer",
    category: "technical",
    eras: ["1920s", "modern"],
    summary: "Builds and repairs communication systems, traces interference, and recognizes signals that should not exist on any assigned frequency.",
    suggestedSkills: ["Electrical Repair", "Mechanical Repair", "Science (Physics)", "Operate Heavy Machinery", "Spot Hidden", "Listen", "Mathematics", "Library Use"],
    creditRatingRange: [30, 60],
    contacts: ["Station operators", "Military technicians", "Equipment suppliers"],
    typicalGear: ["Testing meter", "Hand tools", "Coil wire"],
    complication: "A strange transmission can become an obsession long before its source is understood."
  },
  {
    id: "coc-original-industrial-chemist",
    name: "Industrial Chemist",
    category: "technical",
    eras: ["1920s", "modern"],
    summary: "Analyzes compounds, contamination, and production failures while balancing scientific truth against commercial pressure.",
    suggestedSkills: ["Chemistry", "Pharmacy", "Biology", "Spot Hidden", "Accounting", "Library Use", "Mechanical Repair", "Persuade"],
    creditRatingRange: [30, 70],
    contacts: ["Laboratory staff", "Factory managers", "Regulators"],
    typicalGear: ["Sample vials", "Protective equipment", "Field reagents"],
    complication: "A discovery may implicate an employer capable of destroying careers or evidence."
  },
  {
    id: "coc-original-surveyor",
    name: "Surveyor",
    category: "technical",
    eras: ["1920s", "modern"],
    summary: "Measures land, compares maps to reality, and notices structures, boundaries, and distances that refuse to remain consistent.",
    suggestedSkills: ["Navigate", "Mathematics", "Spot Hidden", "Drafting", "Geology", "Mechanical Repair", "Library Use", "Climb"],
    creditRatingRange: [20, 60],
    contacts: ["Landowners", "Engineers", "Government offices"],
    typicalGear: ["Tripod instrument", "Measuring chain", "Topographic maps"],
    complication: "Accurate measurements can threaten ownership claims and expose deliberately hidden sites."
  },
  {
    id: "coc-original-mechanical-technician",
    name: "Mechanical Technician",
    category: "technical",
    eras: ["1920s", "modern"],
    summary: "Diagnoses machines by sound and wear, improvises repairs, and keeps failing equipment operating under impossible conditions.",
    suggestedSkills: ["Mechanical Repair", "Electrical Repair", "Operate Heavy Machinery", "Drive Auto", "Spot Hidden", "Listen", "Mathematics", "Appraise"],
    creditRatingRange: [20, 50],
    contacts: ["Workshop owners", "Drivers", "Industrial crews"],
    typicalGear: ["Tool roll", "Work light", "Spare fasteners"],
    complication: "Being the only person who can repair something makes leaving a dangerous site much harder."
  },
  {
    id: "coc-original-community-organizer",
    name: "Community Organizer",
    category: "social",
    eras: ["1920s", "modern"],
    summary: "Builds trust across neighborhoods, coordinates people and resources, and recognizes who truly holds influence behind formal titles.",
    suggestedSkills: ["Persuade", "Psychology", "Listen", "Fast Talk", "Law", "Accounting", "Spot Hidden", "Other Language"],
    creditRatingRange: [10, 50],
    contacts: ["Local leaders", "Volunteers", "Mutual-aid groups"],
    typicalGear: ["Contact book", "Meeting notes", "Public notices"],
    complication: "Protecting the community may require confronting institutions with far greater resources."
  },
  {
    id: "coc-original-diplomatic-aide",
    name: "Diplomatic Aide",
    category: "social",
    eras: ["1920s", "modern"],
    summary: "Manages delicate communication, protocol, translation, and political consequences while senior officials avoid direct responsibility.",
    suggestedSkills: ["Persuade", "Other Language", "Psychology", "Law", "History", "Listen", "Accounting", "Fast Talk"],
    creditRatingRange: [40, 80],
    contacts: ["Civil servants", "Foreign delegations", "Security staff"],
    typicalGear: ["Credentials", "Briefing papers", "Formal clothing"],
    complication: "A harmless-looking mistake can become an international incident or a cover for something worse."
  },
  {
    id: "coc-original-stage-performer",
    name: "Stage Performer",
    category: "social",
    eras: ["1920s", "modern"],
    summary: "Commands attention, reads an audience, adopts convincing roles, and moves through social spaces closed to obvious investigators.",
    suggestedSkills: ["Art/Craft (Acting)", "Charm", "Disguise", "Fast Talk", "Psychology", "Listen", "Persuade", "Spot Hidden"],
    creditRatingRange: [10, 70],
    contacts: ["Theater workers", "Patrons", "Entertainers"],
    typicalGear: ["Costume case", "Makeup kit", "Publicity photographs"],
    complication: "Fame attracts attention from admirers, rivals, and people who believe the performer owes them access."
  },
  {
    id: "coc-original-wealth-manager",
    name: "Wealth Manager",
    category: "social",
    eras: ["1920s", "modern"],
    summary: "Understands private fortunes, trusts, debts, and hidden ownership structures that connect respectable clients to troubling enterprises.",
    suggestedSkills: ["Accounting", "Law", "Persuade", "Psychology", "Appraise", "Library Use", "Listen", "Fast Talk"],
    creditRatingRange: [50, 90],
    contacts: ["Bankers", "Attorneys", "Estate representatives"],
    typicalGear: ["Financial ledgers", "Secure correspondence", "Client directory"],
    complication: "Client confidentiality can conceal crimes, cult activity, or assets that are not entirely human."
  },
  {
    id: "coc-original-expedition-photographer",
    name: "Expedition Photographer",
    category: "field",
    eras: ["1920s", "modern"],
    summary: "Documents remote places and unstable events, preserving visual evidence that witnesses may later deny or forget.",
    suggestedSkills: ["Photography", "Spot Hidden", "Navigate", "Climb", "Stealth", "Mechanical Repair", "Other Language", "Natural World"],
    creditRatingRange: [20, 60],
    contacts: ["Editors", "Explorers", "Equipment suppliers"],
    typicalGear: ["Camera kit", "Tripod", "Weatherproof cases"],
    complication: "The most important image may reveal something that also noticed the photographer."
  },
  {
    id: "coc-original-harbor-pilot",
    name: "Harbor Pilot",
    category: "field",
    eras: ["1920s", "modern"],
    summary: "Guides vessels through dangerous local waters and knows which crews, coves, and nighttime signals do not appear on official charts.",
    suggestedSkills: ["Pilot (Boat)", "Navigate", "Listen", "Spot Hidden", "Mechanical Repair", "Swim", "Natural World", "Persuade"],
    creditRatingRange: [20, 60],
    contacts: ["Dockworkers", "Ship captains", "Coast authorities"],
    typicalGear: ["Charts", "Weather gear", "Signal lamp"],
    complication: "Refusing a dangerous passage can cost a livelihood; accepting it may cost far more."
  },
  {
    id: "coc-original-wilderness-guide",
    name: "Wilderness Guide",
    category: "field",
    eras: ["1920s", "modern"],
    summary: "Keeps groups alive away from roads, reads terrain and weather, and recognizes when the natural world has become subtly wrong.",
    suggestedSkills: ["Navigate", "Natural World", "Track", "First Aid", "Spot Hidden", "Listen", "Stealth", "Survival"],
    creditRatingRange: [10, 50],
    contacts: ["Rangers", "Hunters", "Remote communities"],
    typicalGear: ["Compass", "First-aid kit", "Field knife"],
    complication: "Clients often hide their destination, condition, or true reason for entering the wilderness."
  },
  {
    id: "coc-original-railway-inspector",
    name: "Railway Inspector",
    category: "field",
    eras: ["1920s", "modern"],
    summary: "Examines track, schedules, cargo, and accidents across a network where small irregularities can signal deliberate sabotage or impossible travel.",
    suggestedSkills: ["Mechanical Repair", "Spot Hidden", "Accounting", "Law", "Navigate", "Listen", "Operate Heavy Machinery", "Photography"],
    creditRatingRange: [30, 60],
    contacts: ["Station masters", "Freight clerks", "Maintenance crews"],
    typicalGear: ["Inspection lamp", "Timetables", "Measuring tools"],
    complication: "Management may pressure the inspector to classify a disturbing event as ordinary equipment failure."
  }
];

export const getCocOccupation = (occupationId: string): CocOccupationRecord => {
  const occupation = cocOccupationCatalog.find((candidate) => candidate.id === occupationId);
  if (!occupation) throw new Error(`Original occupation not found: ${occupationId}`);
  return occupation;
};
