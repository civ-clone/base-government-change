# base-government-change

How a player changes government, for a ruleset to wrap in its own `Added`, `Action`, `AnarchyDuration`, `Availability`,
`Changed`, `RevolutionTerms`, `MayRechoose`, `GovernmentAvailable` and research `Complete` rules with its own ids,
governments and numbers:

- `Rules/AnarchyDuration`: the rule asked how many turns of the interim government a revolution causes, for a
  `RevolutionCause` (`'chosen'` or `'civil-disorder'`). The shortest answer wins.
- `Rules/RevolutionTerms`: the rule that names the ruleset's revolution, its handler `key` and `Interim` government, so
  code outside the ruleset (a computer player) can start and finish its revolutions through `lib/revolution`.
  `lib/terms` has `terms(key, Interim)`, the rule's effect, and `revolutionTerms(ruleRegistry)`, which reads it (`null`
  with no rule). A game has one ruleset's terms: if two are registered, the first answer wins.
- `lib/revolution`: a revolution kept as a `PendingEffect` on the `PlayerGovernment` under the ruleset's own handler
  `key` (a save names it). `revolution(key, Interim, …)` starts one, `turnsUntilChoice` and `pendingRevolution` read
  it, `chooseGovernment` finishes it (given the game's rules as its last argument, it also records the choice for
  `MayRechoose`), and `registerRevolutionHandler` lets one loaded from a save finish.
  `RevolutionError` is what they throw.
- `Rules/MayRechoose`: whether a player may choose its government again, with no interim, in the turn it chose one.
  With no rule that says so, it may not. `lib/rechoice` keeps the turn of the choice as a `PendingEffect` on the
  `PlayerGovernment` under `<key>:rechoice` (never discharged; the next choice replaces it), written only when
  `chooseGovernment` is given the game's rules and a `MayRechoose` rule says yes. In that turn, a revolution the player
  chooses (`'chosen'`) starts no interim and makes the choice due at once, whatever `AnarchyDuration` says.
  `mayRechoose`, `chosenThisTurn` and `rechoiceOpen` read it.
- `Rules/GovernmentAvailable` and `lib/offer`: offering a revolution when an advance makes a government available.
  `offerGovernments(entries, …)` is a research `Complete` rule's effect: for each government that one of `entries`
  (the ruleset's "government requires advances" entries) requires the discovered advance for, and that the player may
  now choose (`governmentsOpenedBy`), it asks the `GovernmentAvailable(player, government)` rules, and when any says
  yes the engine emits `player:government:available` with the player and the government. With no `GovernmentAvailable`
  rules, nothing is offered.
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
