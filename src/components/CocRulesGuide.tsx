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
      "Set the skill and the required difficulty before rolling.",
      "Roll percentile dice. Regular success is at or below the full skill, Hard is at or below half, and Extreme is at or below one-fifth.",
      "Read the result as both success level and fictional outcome; do not stop at pass or fail."
    ]
  },
  {
    category: "Core roll",
    title: "Choose the difficulty",
    when: "Set difficulty from the situation, not from how badly the Keeper wants the scene to go.",
    steps: [
      "Use Regular for a demanding task under ordinary pressure.",
      "Use Hard when conditions, opposition, or required precision are severe.",
      "Use Extreme only for exceptional feats; explain the danger before the roll."
    ]
  },
  {
    category: "Core roll",
    title: "Bonus and Penalty dice",
    when: "Use for a clear situational advantage or disadvantage that difficulty alone does not represent.",
    steps: [
      "Keep the same units die and roll the additional tens dice.",
      "With Bonus dice, choose the lowest valid percentile result. With Penalty dice, choose the highest.",
      "Bonus and Penalty dice cancel one-for-one before the roll."
    ]
  },
  {
    category: "Core roll",
    title: "Spend Luck",
    when: "Use after an eligible failed roll when the table allows Luck spending.",
    steps: [
      "Compare the roll to the exact number needed for the desired success level.",
      "Spend that many Luck points to lower the result to the threshold.",
      "Do not use Luck to erase every consequence; some rolls and procedures can remain ineligible by campaign rule."
    ]
  },
  {
    category: "Core roll",
    title: "Push a failed roll",
    when: "Use for a failed non-combat skill roll when the Investigator can change the approach and accept greater risk.",
    steps: [
      "The player explains what is different about the second attempt.",
      "The Keeper states the serious consequence of failing again before the dice are rolled.",
      "A failed pushed roll brings that consequence into play. Combat rolls are not pushed."
    ]
  },
  {
    category: "Contests",
    title: "Resolve an opposed roll",
    when: "Use when two characters actively compete and the outcome cannot be handled by one passive difficulty.",
    steps: [
      "Both sides roll the relevant skill.",
      "The better success level wins: Extreme beats Hard, Hard beats Regular, and any success beats failure.",
      "When success levels tie, use the specific tie rule for the procedure; ordinary contests and close combat do not always resolve ties the same way."
    ]
  },
  {
    category: "Investigation",
    title: "Handle an essential clue",
    when: "Use when the scenario cannot continue unless the investigators receive the information.",
    steps: [
      "Give the essential clue when the investigators take the right action or search the right place.",
      "Use a roll to determine speed, extra detail, safety, or what the opposition learns—not whether the entire scenario stops.",
      "On failure, move the investigation forward with a cost, complication, delay, or reduced-quality lead."
    ]
  },
  {
    category: "Investigation",
    title: "Run a research scene",
    when: "Use for libraries, archives, interviews, laboratories, records, and extended searches.",
    steps: [
      "State the question the investigators are trying to answer and the time available.",
      "Choose the most relevant skill and identify what success adds beyond the essential lead.",
      "Track time, attention, exposure, and new danger while the investigators work."
    ]
  },
  {
    category: "Sanity",
    title: "Resolve a Sanity check",
    when: "Use when an investigator confronts a Mythos horror or another campaign-defined shock.",
    steps: [
      "Roll against current SAN and determine whether the success or failure loss applies.",
      "Apply the loss and never reduce SAN below zero.",
      "Check whether the single loss or accumulated daily loss triggers the campaign's temporary or indefinite breakdown procedure."
    ]
  },
  {
    category: "Sanity",
    title: "Run a bout of madness",
    when: "Use when the Sanity procedure calls for an acute loss of control.",
    steps: [
      "Keep the episode short enough to preserve player involvement and clear enough to change the scene.",
      "Choose or roll a response appropriate to the character, danger, and table boundaries.",
      "Record any lasting belief, fear, attachment, injury, or altered backstory element before play resumes."
    ]
  },
  {
    category: "Combat",
    title: "Start a combat round",
    when: "Use when moment-by-moment action matters and violence cannot be resolved as one narrative exchange.",
    steps: [
      "Establish positions, immediate threats, cover, escape routes, and what each side is trying to accomplish.",
      "Resolve actions in the table's chosen Dexterity order and keep reactions tied to the triggering attack.",
      "Re-state changing cover, distance, wounds, ammunition, and escape options at the top of each new round."
    ]
  },
  {
    category: "Combat",
    title: "Resolve close combat",
    when: "Use for fighting, brawling, grappling, or a melee weapon exchange.",
    steps: [
      "The defender chooses to Dodge or Fight Back when the procedure allows it.",
      "Dodge wins a tied success level; the initiating attacker wins a tied success level against Fight Back.",
      "If both rolls fail, neither side deals damage. Apply build and maneuver limits before resolving special moves."
    ]
  },
  {
    category: "Combat",
    title: "Resolve firearms",
    when: "Use for each selected shot after range, cover, movement, and firing rate are established.",
    steps: [
      "Calculate net Bonus or Penalty dice before rolling and state the ammunition being spent.",
      "Roll each shot separately unless a specific automatic-fire procedure says otherwise.",
      "Apply damage, impales or special results, armor, Major Wounds, and remaining ammunition immediately."
    ]
  },
  {
    category: "Injury",
    title: "Apply damage and Major Wounds",
    when: "Use after every damaging hit rather than combining several attacks into one total.",
    steps: [
      "Subtract armor or other protection, then apply the remaining damage.",
      "A single hit dealing at least half maximum HP causes a Major Wound.",
      "At zero HP, a character with a Major Wound is dying; without one, the character is unconscious but not dying."
    ]
  },
  {
    category: "Injury",
    title: "Stabilize and recover",
    when: "Use after immediate danger or whenever a dying investigator receives aid.",
    steps: [
      "Use the appropriate first-aid or medical procedure and record whether the character is stable.",
      "Track Major Wounds separately from current HP because consciousness, dying, and recovery depend on both.",
      "Advance healing by the campaign's recovery schedule and note treatment, rest, and continuing hazards."
    ]
  },
  {
    category: "Keeper flow",
    title: "Close the scene",
    when: "Use when the investigators have learned enough, escaped, failed forward, or changed the situation.",
    steps: [
      "Summarize what the investigators now know, what changed, and what remains uncertain.",
      "Name the immediate leads, threats, deadlines, and resources available next.",
      "Update wounds, Sanity, Luck, ammunition, evidence, NPC attitudes, and the campaign clock before moving on."
    ]
  }
];

export const CocRulesGuide = () => (
  <section className="coc-section coc-section--page">
    <header className="coc-section__heading">
      <small>Plain-language table procedures</small>
      <h1>Enough information to run the scene without opening five books.</h1>
      <p>
        These original summaries are organized in the order a Keeper or Investigator uses them.
        The source audit remains available for verification and licensing boundaries.
      </p>
    </header>
    <div className="coc-rule-guide-grid coc-rule-guide-grid--expanded">
      {cocRules.map((rule, index) => (
        <article className="coc-rule-guide-card" key={rule.title}>
          <small>{rule.category} · Procedure {index + 1}</small>
          <h2>{rule.title}</h2>
          <p><strong>Use when:</strong> {rule.when}</p>
          <ol>
            {rule.steps.map((step) => <li key={step}>{step}</li>)}
          </ol>
        </article>
      ))}
    </div>
  </section>
);
