# base-government-change

How a player changes government, for a ruleset to wrap in its own `Added`, `Action`, `AnarchyDuration`, `Availability`
and `Changed` rules with its own ids, governments and numbers:

- `Rules/AnarchyDuration`: the rule asked how many turns of the interim government a revolution causes, for a
  `RevolutionCause` (`'chosen'` or `'civil-disorder'`). The shortest answer wins.
- `lib/revolution`: a revolution kept as a `PendingEffect` on the `PlayerGovernment` under the ruleset's own handler
  `key` (a save names it). `revolution(key, Interim, …)` starts one, `turnsUntilChoice` and `pendingRevolution` read
  it, `chooseGovernment` finishes it, and `registerRevolutionHandler` lets one loaded from a save finish.
  `RevolutionError` is what they throw.
- `lib/actions`: the player `Action` criteria and effects: `notInInterim`, `noRevolutionPending` and `offerRevolution`
  (`Revolution`), then `choiceDue` and `offerGovernmentChoice` (`ChooseGovernment`).
- `lib/playerGovernment`: `addPlayerGovernment(player, Initial, …)`, for an `Added` rule.
- `lib/anarchyDuration`: `forCause(cause)` and `randomDuration(min, max, rng)`, for `AnarchyDuration` rules.
- `lib/availability`: `availabilityRulesFor(entry, …)` and `deriveAvailabilityRules(…)`, the `Availability` rule a
  requirement entry ("government requires advances") is played by.
- `lib/changed`: `emitGovernmentChanged`, `hasPlayerWorld` and `clearYieldCaches`, for `Changed` rules.
- `lib/governedBy`: `governedBy(player, governments, …)`, whether a player has one of `governments` (no, when the
  player has none), for rules that depend on the government.

A library: it registers no rules. See `civ1-government` for Civilization's governments, durations and ids.
