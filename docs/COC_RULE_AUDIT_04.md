# Call of Cthulhu 7e Rules Audit 04 — Source Recheck Corrections

Date: 2026-07-14

## Purpose

A second direct reading of the official Chaosium RPG Wiki identified two places where the first implementation overgeneralized the source. Both were corrected before the preview could be treated as accepted.

Official pages rechecked:

- `https://cthulhuwiki.chaosium.com/rules/sanity.html`
- `https://cthulhuwiki.chaosium.com/rules/combat.html`

## Correction 1 — Involuntary action after a Sanity roll

### Incorrect prototype interpretation

The first Sanity helper triggered a momentary involuntary action whenever any positive Sanity loss occurred.

### Official-source rule

The official Sanity page ties the Keeper's momentary control of the investigator's next action to a **failed Sanity roll**, not to the amount of Sanity lost.

### Corrected implementation

- A failed Sanity roll triggers the involuntary-action prompt even when the listed failed loss happens to resolve to zero.
- A successful Sanity roll does not trigger the involuntary-action prompt merely because its listed success loss is positive.
- Losing 5 or more Sanity from one check still triggers the INT follow-up regardless of whether the original Sanity roll succeeded or failed.

Tests now cover all three distinctions.

## Correction 2 — Bout of Madness roll

### Incorrect prototype interpretation

The first Sanity card treated the separate 1D10 bout roll as a fixed number of combat rounds.

### Official-source rule

The official page instructs the Keeper to roll 1D10 and consult the Bouts of Madness table. When other investigators are present, the selected result is played out round by round. The page does not define the D10 result as a fixed round duration.

### Corrected implementation

- The card now displays a **bout-table roll** from 1 to 10.
- It instructs the Keeper to consult an authorized copy of the table.
- It does not copy the official table.
- It does not invent a fixed round duration.
- The separate 1D10-hour duration of temporary insanity remains.

## Correction 3 — Dive for cover action cost

### Incorrect prototype interpretation

The first firearm helper made the target forfeit its next attack only when the Dodge roll for diving for cover succeeded.

### Official-source rule

The official combat page states that choosing to dive for cover forfeits the target's next attack **regardless of whether the Dodge roll succeeds**. Only a successful Dodge roll applies the Penalty die to the attacker's rolls.

### Corrected implementation

The firearm card now distinguishes:

- no dive;
- attempted dive with failed Dodge;
- attempted dive with successful Dodge.

Results:

- no dive: no cover Penalty and no lost attack;
- failed dive: no cover Penalty, but the target loses its next attack;
- successful dive: one cover Penalty die and the target loses its next attack.

Tests cover all three states, including interaction with point blank and multiple handgun shots.

## Accuracy-process result

This correction demonstrates why the project requires:

1. source-linked rule records;
2. boundary tests;
3. a second direct source reading;
4. an independent review before `verified` status;
5. visible separation between prototype content and reviewed rules.

The corrected records remain `needs-review` because independent reviewer signoff is still outstanding.
