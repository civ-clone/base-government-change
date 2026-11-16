import Advance from '@civ-clone/core-science/Advance';
import Engine from '@civ-clone/core-engine/Engine';
import Government from '@civ-clone/core-government/Government';
import PlayerGovernment from '@civ-clone/core-government/PlayerGovernment';
import { PlayerGovernmentRegistry } from '@civ-clone/core-government/PlayerGovernmentRegistry';
import PlayerResearch from '@civ-clone/core-science/PlayerResearch';
import { Requirement } from '@civ-clone/core-requirement/Requirement';
import { RuleRegistry } from '@civ-clone/core-rule/RuleRegistry';
/**
 * The governments discovering `AdvanceType` made available to the player: each one an entry of `entries` (the rule
 * set's "government requires advances" entries, as `lib/availability` plays them) requires the advance for, and that
 * the player may now choose. In the order of `entries`, each once.
 */
export declare const governmentsOpenedBy: (
  entries: readonly Requirement[],
  AdvanceType: typeof Advance,
  playerGovernment: PlayerGovernment
) => (typeof Government)[];
/**
 * A research `Complete` rule's effect that offers a revolution to each government the discovered advance made available
 * (`governmentsOpenedBy`). For each one any `GovernmentAvailable` rule says to offer, the engine emits
 * `player:government:available` with the player and the government, for a client to ask whether to start one. With no
 * `GovernmentAvailable` rules, nothing is offered.
 */
export declare const offerGovernments: (
  entries: readonly Requirement[],
  playerGovernmentRegistry: PlayerGovernmentRegistry,
  ruleRegistry: RuleRegistry,
  engine: Engine
) => (playerResearch: PlayerResearch, advance: Advance) => void;
export default offerGovernments;
