type CocRuleProcedure = {
  category: string;
  title: string;
  when: string;
  steps: string[];
};

const cocRules: CocRuleProcedure[] = [
  {
    category: "Core roll",
    title: "Make a skill roll",
    when: "Use only when failure would change the scene or create a meaningful cost.",
    steps: [
      "Agree on the investigator's goal, the skill, and the required difficulty before rolling.",
      "Regular success is at or below the full skill, Hard at or below half, and Extreme at or below one-fifth.",
      "A roll of 01 is critical. A fumble begins at 96 when the skill is below 50, or at 100 when the skill is 50 or more."
    ]
  },
  {
    category: "Core roll",
    title: "Choose the difficulty",
    when: "Set difficulty from the fictional obstacle rather than from how badly the Keeper wants an outcome.",
    steps: [
      "Use Regular for a demanding task under ordinary pressure.",
      "Use Hard when opposition, conditions, or required precision are severe.",
      "Use Extreme for tasks approaching the limits of human capability."
    ]
  },
  {
    category: "Core roll",
    title: "Bonus and Penalty dice",
    when: "Use for a clear situational advantage or disadvantage that difficulty alone does not represent.",
    steps: [
      "Cancel Bonus and Penalty dice one-for-one.",
      "Keep one units die and roll the required tens dice.",
      "Choose the lowest candidate for Bonus dice or the highest candidate for Penalty dice."
    ]
  },
  {
    category: "Core roll",
    title: "Push a failed roll",
    when: "Use for an eligible failed non-combat skill roll when the investigator changes the approach and accepts greater risk.",
    steps: [
      "The player explains what is different about the second attempt.",
      "The Keeper may foreshadow the dire consequence before the player commits.",
      "A failed pushed roll brings that consequence into play. Combat rolls cannot be pushed."
    ]
  },
  {
    category: "Contests",
    title: "Resolve an opposed roll",
    when: "Use when two characters actively compete and the outcome cannot be handled by one passive difficulty.",
    steps: [
      "Both sides roll the relevant skill and compare success levels.",
      "If the levels tie, the higher skill value wins.",
      "If both skill values also tie, each side rolls a separate D100 and the lower result wins."
    ]
  },
  {
    category: "Investigation",
    title: "Handle an essential clue",
    when: "Use when the scenario cannot continue unless the investigators receive the information.",
    steps: [
      "Give the essential clue when they take the correct action or search the correct place.",
      "Roll for speed, additional detail, secrecy, safety, or what the opposition learns.",
      "On failure, move the case forward with a cost, complication, delay, or weaker lead."
    ]
  },
  {
    category: "Investigation",
    title: "Run a research scene",
    when: "Use for libraries, archives, interviews, laboratories, records, and extended searches.",
    steps: [
      "State the question and the time available.",
      "Choose the relevant skill and define what success adds beyond the essential lead.",
      "Track time, attention, exposure, and opposition movement while the investigators work."
    ]
  },
  {
    category: "Development",
    title: "Mark a skill for improvement",
    when: "Use after a successful skill roll during play.",
    steps: [
      "Check the skill on the investigator sheet after a successful use.",
      "A skill may hold only one improvement check at a time.",
      "Wait until the Keeper calls for improvement rolls at the end of the scenario or session."
    ]
  },
  {
    category: "Development",
    title: "Resolve a skill improvement",
    when: "Use when the Keeper calls for improvement rolls.",
    steps: [
      "Roll D100 against each checked skill.",
      "If the roll is over the current skill, add 1D10 to that skill.",
      "Erase the check whether the skill increases or not."
    ]
  },
  {
    category: "Sanity",
    title: "Resolve a Sanity check",
    when: "Use when an investigator confronts a Mythos horror or another campaign-defined shock.",
    steps: [
      "Roll against current SAN and apply the listed success or failure loss.",
      "Any SAN loss causes a momentary involuntary action chosen by the Keeper.",
      "Never reduce SAN below zero."
    ]
  },
  {
    category: "Sanity",
    title: "Check for temporary insanity",
    when: "Use when one Sanity roll causes a loss of 5 or more SAN.",
    steps: [
      "Roll INT after applying the SAN loss.",
      "If the INT roll succeeds, the investigator comprehends the horror and becomes temporarily insane for 1D10 hours.",
      "If the INT roll fails, the mind closes itself to the horror and the investigator remains sane for now."
    ]
  },
  {
    category: "Sanity",
    title: "Run a bout of madness",
    when: "Use when temporary insanity begins.",
    steps: [
      "Choose or roll a bout result and determine its 1D10-round duration.",
      "If other investigators are present, play the bout round by round. If alone, summarize the lost time and how the investigator is found.",
      "Record any lasting phobia, mania, or altered backstory entry the Keeper applies."
    ]
  },
  {
    category: "Sanity",
    title: "Handle a delusion and reality check",
    when: "Use during the 1D10-hour temporary-insanity period.",
    steps: [
      "The Keeper may present a false perception as real to the investigator.",
      "The player may request a reality check by making a Sanity roll.",
      "A success sees through the delusion; a failure draws the investigator deeper into it."
    ]
  },
  {
    category: "Combat",
    title: "Start a combat round",
    when: "Use when moment-by-moment action matters.",
    steps: [
      "Establish positions, cover, exits, hazards, and each side's immediate objective.",
      "Act in descending DEX order; a readied firearm acts at DEX + 50 for that shot.",
      "A round lasts long enough for everyone to take one significant action."
    ]
  },
  {
    category: "Combat",
    title: "Resolve close combat",
    when: "Use for Fighting attacks and ordinary melee exchanges.",
    steps: [
      "The defender chooses Dodge or Fight Back when the procedure allows it.",
      "Dodge wins a tied success level; the initiating attacker wins a tie against Fight Back.",
      "If both sides fail, neither side deals damage. Combat rolls cannot be pushed."
    ]
  },
  {
    category: "Combat",
    title: "Resolve a Fighting Maneuver",
    when: "Use for a non-damage goal such as disarming, knocking down, or restraining.",
    steps: [
      "Use Fighting (Brawl); the defender may Dodge or Fight Back.",
      "If the attacker has lower Build, apply one Penalty die per point of difference, maximum two.",
      "If the defender is three or more Build higher, the maneuver cannot affect them."
    ]
  },
  {
    category: "Combat",
    title: "Apply the outnumbered rule",
    when: "Use for later melee attacks against someone who has already defended this round.",
    steps: [
      "The first Dodge or Fight Back in the round is resolved normally.",
      "Each later melee attack against that defender gains one Bonus die.",
      "Do not apply this Bonus die to firearms attacks."
    ]
  },
  {
    category: "Combat",
    title: "Resolve firearms",
    when: "Use for each selected shot after range, cover, movement, and firing rate are established.",
    steps: [
      "A readied firearm acts at DEX + 50. Point blank is within one-fifth DEX in feet and grants one Bonus die.",
      "Two or three handgun shots apply one Penalty die to each shot; roll and spend each shot separately.",
      "A successful dive for cover gives the attack one Penalty die, while any attempted dive costs the target's next attack."
    ]
  },
  {
    category: "Injury",
    title: "Apply damage and Major Wounds",
    when: "Use after every damaging hit rather than combining several attacks into one total.",
    steps: [
      "Apply armor or other protection, then deduct the remaining damage without going below zero HP.",
      "A single blow dealing at least half maximum HP causes a Major Wound and a CON roll to remain conscious.",
      "A single blow equal to or above maximum HP causes instant death."
    ]
  },
  {
    category: "Injury",
    title: "Track dying",
    when: "Use when a character with a Major Wound reaches zero HP.",
    steps: [
      "The character is unconscious and dying.",
      "Make a CON roll at the end of the following round and every round thereafter; failure means death.",
      "Successful First Aid stabilizes the dying condition so Medicine can be used."
    ]
  },
  {
    category: "Injury",
    title: "Use First Aid or Medicine",
    when: "Use after injury or to stabilize a dying character.",
    steps: [
      "Successful First Aid restores 1 HP and can rouse an unconscious character.",
      "Medicine takes at least one hour with appropriate equipment and restores 1D3 HP.",
      "On a dying character, First Aid stabilizes and Medicine enables the later healing roll."
    ]
  },
  {
    category: "Injury",
    title: "Resolve natural healing",
    when: "Use during downtime after immediate treatment.",
    steps: [
      "Without a Major Wound, recover 1 HP per day.",
      "With a Major Wound, make a weekly CON roll: success restores 1D3 HP and Extreme success restores 2D3.",
      "Remove the Major Wound on an Extreme healing success or when current HP reaches at least half maximum HP."
    ]
  },
  {
    category: "Magic",
    title: "Spend Magic Points",
    when: "Use whenever an authorized spell requires an MP cost.",
    steps: [
      "Pay the spell's listed MP and SAN costs from the authorized spell record.",
      "If MP reaches zero, any further MP cost is deducted from HP one-for-one.",
      "Track the resource payment separately from whether a first-casting roll succeeds."
    ]
  },
  {
    category: "Magic",
    title: "Cast a newly learned spell",
    when: "Use the first time a character attempts a newly learned spell.",
    steps: [
      "Pay the costs and make a Hard POW roll.",
      "On failure, nothing happens yet; the caster may pay the costs again and push the roll.",
      "A failed pushed roll still casts the spell normally, but the Keeper applies a dire consequence. Later castings need no casting roll."
    ]
  },
  {
    category: "Magic",
    title: "Place a spell in combat order",
    when: "Use when a spell is cast during combat.",
    steps: [
      "An instantaneous spell activates at DEX + 50.",
      "A one-round spell activates on the caster's DEX in the present round.",
      "Longer spells activate on the caster's DEX after the listed number of rounds is completed."
    ]
  },
  {
    category: "Keeper flow",
    title: "Close the scene",
    when: "Use when the investigators have learned enough, escaped, failed forward, or changed the situation.",
    steps: [
      "Summarize confirmed facts, changed beliefs, and unresolved questions.",
      "Name active leads, threats, deadlines, injuries, and resources.",
      "Update SAN, HP, MP, ammunition, evidence, NPC attitudes, skill checks, and the opposition clock."
    ]
  }
];

export const CocRulesGuide = () => (
  <section className="coc-section coc-section--page">
    <header className="coc-section__heading">
      <small>Verified plain-language table procedures</small>
      <h1>Resolve the rule, record the cost, and keep the scene moving.</h1>
      <p>
        These summaries follow Chaosium's official free 7th-edition rules pages. Individual scenarios,
        proprietary stat blocks, equipment catalogs, and spell effects remain in authorized sources.
      </p>
    </header>
    <div className="coc-rule-guide-grid coc-rule-guide-grid--expanded">
      {cocRules.map((rule, index) => (
        <article className="coc-rule-guide-card" key={rule.title}>
          <small>{rule.category} · Procedure {index + 1}</small>
          <h2>{rule.title}</h2>
          <p><strong>Use when:</strong> {rule.when}</p>
          <ol>{rule.steps.map((step) => <li key={step}>{step}</li>)}</ol>
        </article>
      ))}
    </div>
  </section>
);
