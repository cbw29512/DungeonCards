const dndRules = [
  {
    title: "The basic d20 test",
    steps: [
      "Roll a d20 and add the listed modifier.",
      "Compare the total with Armor Class or a Difficulty Class.",
      "Attack rolls, ability checks, and saving throws are separate types of d20 tests."
    ]
  },
  {
    title: "Advantage and Disadvantage",
    steps: [
      "Advantage rolls two d20s and keeps the higher die.",
      "Disadvantage rolls two d20s and keeps the lower die.",
      "They cancel each other; never roll three d20s because both apply."
    ]
  },
  {
    title: "Attacks and damage",
    steps: [
      "Roll the attack card first and compare the result with the target's AC.",
      "On a hit, roll the separate damage card.",
      "A natural 20 is a critical hit; double the damage dice, not static modifiers. A natural 1 automatically misses."
    ]
  },
  {
    title: "Checks and saving throws",
    steps: [
      "Ability checks resolve something a creature attempts to do.",
      "Saving throws resist a hazard, spell, or effect.",
      "Natural 20 and natural 1 are not automatically success or failure unless a specific rule says so."
    ]
  },
  {
    title: "Your turn in combat",
    steps: [
      "Move up to your Speed and take one Action unless a feature changes this.",
      "A Bonus Action is available only when a rule gives you one.",
      "You normally have one Reaction between the start of your turn and the start of your next turn."
    ]
  },
  {
    title: "Hit points and death",
    steps: [
      "Damage reduces Hit Points; healing cannot raise them above the maximum.",
      "At 0 HP, a player character is normally unconscious and begins making death saving throws.",
      "Three successes stabilize the character; three failures cause death. Damage at 0 HP can add failures."
    ]
  },
  {
    title: "Spells and concentration",
    steps: [
      "Use the spell's attack roll or saving throw exactly as listed.",
      "Only one concentration spell can be maintained at a time.",
      "Taking damage while concentrating normally requires a Constitution saving throw."
    ]
  },
  {
    title: "2014 and 2024 rules",
    steps: [
      "Choose the ruleset shown on each card and keep the whole table consistent.",
      "Do not combine changed spell, weapon, condition, or class wording across editions unless the DM deliberately house-rules it.",
      "Dungeon Cards keeps SRD 5.1 and SRD 5.2.1 records separate."
    ]
  }
];

export const DndRulesGuide = () => (
  <section className="rules-guide" aria-labelledby="dnd-rules-guide-title">
    <header className="section-heading rules-guide__heading">
      <p>D&amp;D rules guide</p>
      <h1 id="dnd-rules-guide-title">What to do at the table, in plain English.</h1>
      <span>
        Start here when you need the procedure, then open the matching card to perform the roll.
        Edition-specific card text remains the final reference.
      </span>
    </header>
    <div className="rules-guide__grid">
      {dndRules.map((rule, index) => (
        <article className="rules-guide__card" key={rule.title}>
          <small>Rule {index + 1}</small>
          <h2>{rule.title}</h2>
          <ol>
            {rule.steps.map((step) => <li key={step}>{step}</li>)}
          </ol>
        </article>
      ))}
    </div>
  </section>
);
