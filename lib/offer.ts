import Advance from '@civ-clone/core-science/Advance';
import Engine from '@civ-clone/core-engine/Engine';
import { PendingEffectRegistry } from '@civ-clone/core-pending-effect';
import Government from '@civ-clone/core-government/Government';
import GovernmentAvailable from '../Rules/GovernmentAvailable';
import PlayerGovernment from '@civ-clone/core-government/PlayerGovernment';
import { PlayerGovernmentRegistry } from '@civ-clone/core-government/PlayerGovernmentRegistry';
import PlayerResearch from '@civ-clone/core-science/PlayerResearch';
import { Requirement } from '@civ-clone/core-requirement/Requirement';
import { RuleRegistry } from '@civ-clone/core-rule/RuleRegistry';
import { pendingRevolution } from './revolution';

/**
 * The governments discovering `AdvanceType` made available to the player: each one an entry of `entries` (the rule
 * set's "government requires advances" entries, as `lib/availability` plays them) requires the advance for, and that
 * the player may now choose. In the order of `entries`, each once.
 */
export const governmentsOpenedBy = (
  entries: readonly Requirement[],
  AdvanceType: typeof Advance,
  playerGovernment: PlayerGovernment
): (typeof Government)[] => {
  const available = playerGovernment.available();

  return entries
    .filter(
      (entry: Requirement): boolean =>
        entry.relation === 'requires' && entry.targets.includes(AdvanceType)
    )
    .map((entry: Requirement) => entry.subject as typeof Government)
    .filter(
      (GovernmentType: typeof Government, index: number, all): boolean =>
        all.indexOf(GovernmentType) === index &&
        available.includes(GovernmentType)
    );
};

/**
 * A research `Complete` rule's effect that offers a revolution to each government the discovered advance made available
 * (`governmentsOpenedBy`), other than the one the player already has. For each one any `GovernmentAvailable` rule says
 * to offer, the engine emits `player:government:available` with the player and the government, for a client to ask
 * whether to start one. Nothing is offered while a revolution under the handler `key` is under way, nor with no
 * `GovernmentAvailable` rules.
 */
export const offerGovernments =
  (
    key: string,
    entries: readonly Requirement[],
    playerGovernmentRegistry: PlayerGovernmentRegistry,
    pendingEffects: PendingEffectRegistry,
    ruleRegistry: RuleRegistry,
    engine: Engine
  ): ((playerResearch: PlayerResearch, advance: Advance) => void) =>
  (playerResearch: PlayerResearch, advance: Advance): void => {
    const player = playerResearch.player(),
      [playerGovernment] = playerGovernmentRegistry.getBy('player', player);

    if (
      !playerGovernment ||
      pendingRevolution(key, playerGovernment, pendingEffects) !== null
    ) {
      return;
    }

    governmentsOpenedBy(
      entries,
      advance.constructor as typeof Advance,
      playerGovernment
    ).forEach((GovernmentType: typeof Government): void => {
      if (
        !playerGovernment.is(GovernmentType) &&
        ruleRegistry
          .process(GovernmentAvailable, player, GovernmentType)
          .some((offered: boolean): boolean => offered === true)
      ) {
        engine.emit('player:government:available', player, GovernmentType);
      }
    });
  };

export default offerGovernments;
