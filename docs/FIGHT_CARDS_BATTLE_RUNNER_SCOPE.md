# Fight Cards Battle Runner — First Executable Slice

This branch adds a round-by-round one-on-one battle runner on top of the Fight Matchmaker foundation.

## Guaranteed in this slice
- exact combatant profiles from the existing matchmaker adapters
- initiative rolls
- alternating turns
- attack rolls with natural 1 automatic miss and natural 20 critical hit behavior
- ordinary weapon damage and extra critical damage dice
- attacks per round
- hit point tracking
- victory at 0 HP
- deterministic event log suitable for tests and UI replay
- reset/rematch support in the UI

## Explicitly not estimated or silently simulated
- Action Surge
- Second Wind
- Reckless Attack
- Charge
- Multiattack not yet represented by the canonical profile adapter
- save-based actions
- conditions
- resistances/immunities
- recharge actions
- spellcasting
- movement/range positioning beyond the supported profile boundary

The runner must fail closed when a combatant cannot be represented by the canonical fight profile. RAW source statistics are never modified for balance.
