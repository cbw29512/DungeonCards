# DungeonCards Production Readiness Gates

This checklist is a release contract, not a marketing claim. A gate is checked only when the repository contains evidence that the requirement is implemented and verified.

## Product definition

**Fight Cards differentiation:** Pick a pregen hero and any official SRD monster; Fight Cards runs the fight, shows every roll and rule interaction, and lets you audit exactly why the result happened.

## P0 — Combat correctness

- [ ] 2024 / SRD 5.2.1 roster contains exactly 12 classes with one public SRD subclass each.
- [ ] Every class has a reviewed level 1–20 build: 240/240 hero slots.
- [ ] Every SRD 5.2.1 monster remains selectable: 328/328 source monsters.
- [ ] Every 2024 hero profile is executable by the canonical Fight engine: 240/240.
- [ ] Every 2024 monster is fully modeled, including relevant Traits, Actions, Bonus Actions, Reactions, Legendary Actions, recharge, saves, conditions, defenses, movement, and resources: 328/328.
- [ ] Unsupported mechanics fail closed and produce a named certification blocker; they are never silently dropped, approximated, or hidden.
- [ ] 2014 and 2024 rules are never silently mixed.
- [ ] Standard D&D critical-hit behavior has independent conformance tests.
- [ ] **Heroic Crits** is explicitly labeled as a Fight Cards house rule: maximum crit-eligible base damage dice + one normal damage roll; flat modifiers are added once.
- [ ] Initiative, action economy, movement/range, attack rolls, saves, damage typing, resistance/immunity/vulnerability, concentration, conditions, recharge, resources, and 0-HP resolution have deterministic regression tests.
- [ ] Every automated fight is reproducible from a seed or recorded random sequence.
- [ ] Fight logs expose enough information to audit the ruling that produced each result.
- [ ] Release target: zero known rules deviations within the declared Fight Cards combat scope.

## P1 — Security and user data

- [ ] Document a Supabase/auth threat model: assets, trust boundaries, attack paths, mitigations, and incident response.
- [ ] Add explicit RLS/access-control tests for user-owned characters, vault data, campaigns, lobbies, and claims.
- [ ] Test token storage, token refresh, logout, revocation, and session expiration behavior.
- [ ] Add rate limiting and abuse controls to account, invite, lobby, claim, and write-heavy endpoints.
- [ ] Add CSP and production security headers with automated verification.
- [ ] Add SAST/CodeQL (or equivalent) and keep dependency audit/secret scanning enforced.
- [ ] Document secrets ownership, rotation, and least-privilege policy.
- [ ] Document backup retention and recovery objectives for user data.
- [ ] Perform and record a backup/restore drill rather than assuming backups work.

## P1 — Infrastructure and operations

- [ ] Add production error monitoring with source maps and release identifiers (Sentry/OpenTelemetry or equivalent).
- [ ] Add privacy-aware product analytics with a documented event dictionary and retention policy.
- [ ] Separate staging and production configuration/data.
- [ ] Add feature flags for risky or incomplete releases, especially new combat mechanics.
- [ ] Add uptime monitoring for the web app and critical backend paths.
- [ ] Publish a basic status/incident communication path.
- [ ] Add an incident runbook covering detection, triage, rollback, user communication, and postmortem.
- [ ] Document CDN/cache behavior for immutable app assets and generated SRD/catalog data.

## P1 — Performance and scale

- [ ] Route/component lazy loading prevents the entire product from shipping in one initial JavaScript bundle.
- [ ] Enforce compressed and uncompressed bundle budgets in CI.
- [ ] Serve/cache generated SRD and catalog content as immutable static data where practical instead of rebundling it into every initial visit.
- [ ] Record Core Web Vitals on representative desktop and phone profiles.
- [ ] Add cold-load performance tests for a first-time visitor.
- [ ] Add load tests for concurrent lobby, roll-log, invite, claim, and multiplayer/session traffic before calling those paths production-scale.
- [ ] Define capacity targets and alert thresholds before launch campaigns.

## P2 — Product and growth

- [ ] First-run onboarding gets a new user from landing page to a completed sample fight without prior product knowledge.
- [ ] A DM can share a fight, character, or campaign entry point with one safe link.
- [ ] Fight replays/results can be shared without leaking private account or campaign data.
- [ ] Public character/build cards have explicit privacy controls.
- [ ] Define activation, retention, and sharing metrics before optimizing growth.
- [ ] Decide and document the monetization model: free/OSS, paid features, subscriptions, packs, support, or another explicit strategy.
- [ ] If commercialized at scale, obtain legal review of SRD/CC-BY attribution, WotC IP/trade-dress boundaries, third-party art/assets, trademarks, and any non-D&D game content.

## P2 — Accessibility and responsive design

- [ ] Keyboard-only audit covers all primary flows.
- [ ] Screen-reader audit covers navigation, selectors, fight state, roll logs, forms, dialogs, and dynamic announcements.
- [ ] Automated accessibility tests run in CI, supplemented by manual testing.
- [ ] Focus order, visible focus, labels, contrast, reduced motion, and error messaging are verified.
- [ ] Responsive gates cover compact phones, large phones, tablets, laptops, and desktop widths.
- [ ] Primary table-session workflows remain usable on touch devices without hover-only controls.

## P2 — Team and process

- [ ] Add `CONTRIBUTING.md` with local setup, test expectations, branching, review, and release process.
- [ ] Add `CODEOWNERS` for security-sensitive, rules-engine, generated-data, and deployment paths.
- [ ] Use architecture decision records (ADRs) for consequential rules-engine, auth, data, and deployment decisions.
- [ ] Require review evidence for rules changes: source citation, edition, automated tests, and declared assumptions/variants.
- [ ] Document generated-code/data regeneration so another maintainer can reproduce releases without tribal knowledge.
- [ ] Define rollback and release ownership before production promotion.

## Evidence policy

A checkbox is not evidence. Each completed gate should point to at least one of: a passing CI check, an automated regression test, a reviewed design/security document, an operational dashboard/alert, a recovery/load-test record, or a reproducible release artifact.
