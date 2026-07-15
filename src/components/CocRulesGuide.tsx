const cocRules = [
  {
    title: "Make a skill roll",
    steps: [
      "Roll percentile dice to produce a number from 1 to 100.",
      "Regular success means rolling at or below the full skill value.",
      "Hard success means rolling at or below half the skill; Extreme success means at or below one-fifth."
    ]
  },
  {
    title: "Bonus and Penalty dice",
    steps: [
      "Keep the same units die and roll extra tens dice.",
      "With Bonus dice, choose the lowest valid result. With Penalty dice, choose the highest.",
      "Bonus and Penalty dice cancel before the roll."
    ]
  },
  {
    title: "Opposed rolls",
    steps: [
      "Both sides roll the relevant skill.",
      "The better success level wins: Extreme beats Hard, Hard beats Regular, and success beats failure.",
      "When success levels tie, use the procedure shown on the opposed-roll card because combat and ordinary contests resolve ties differently."
    ]
  },
  {
    title: "Pushing a roll",
    steps: [
      "A failed non-combat skill roll may sometimes be attempted again if the Investigator changes the approach.",
      "The player explains the new effort and the Keeper states the consequence of another failure.",
      "A failed pushed roll brings that consequence into play; combat rolls are not pushed."
    ]
  },
  {
    title: "Sanity",
    steps: [
      "Roll against current SAN when the Keeper calls for a Sanity check.",
      "Apply the listed loss for success or failure and never reduce SAN below zero.",
      "A loss of 5 or more from one event prompts the temporary-insanity procedure shown on the card."
    ]
  },
  {
    title: "Damage and Major Wounds",
    steps: [
      "Apply each damaging hit separately.",
      "A single hit dealing at least half maximum HP causes a Major Wound.",
      "At zero HP, a character with a Major Wound is dying; without one, the character is unconscious but not dying."
    ]
  },
  {
    title: "Close combat",
    steps: [
      "The defender chooses to Dodge or Fight Back when the procedure allows it.",
      "Dodge wins a tied success level; the initiating attacker wins a tie against Fight Back.",
      "If both close-combat rolls fail, neither side deals damage."
    ]
  },
  {
    title: "Firearms",
    steps: [
      "Each selected shot is rolled separately and consumes ammunition.",
      "Point-blank range may grant a Bonus die; multiple shots and successful diving for cover may add Penalty dice.",
      "Use the firearm procedure card for the current modifiers before rolling."
    ]
  }
];

export const CocRulesGuide = () => (
  <section className="coc-section coc-section--page">
    <header className="coc-section__heading">
      <small>Plain-language rules guide</small>
      <h1>Start with what you do—not the audit record.</h1>
      <p>
        These short procedures explain the current playable mechanics. Open the source audit only when you need verification details.
      </p>
    </header>
    <div className="coc-rule-guide-grid">
      {cocRules.map((rule, index) => (
        <article className="coc-rule-guide-card" key={rule.title}>
          <small>Procedure {index + 1}</small>
          <h2>{rule.title}</h2>
          <ol>
            {rule.steps.map((step) => <li key={step}>{step}</li>)}
          </ol>
        </article>
      ))}
    </div>
  </section>
);
