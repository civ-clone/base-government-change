import { pendingRevolution, turnsUntilChoice } from './revolution';
import ChooseGovernment from '@civ-clone/base-player-action-choose-government/ChooseGovernment';
import Government from '@civ-clone/core-government/Government';
import { PendingEffectRegistry } from '@civ-clone/core-pending-effect';
import Player from '@civ-clone/core-player/Player';
import PlayerAction from '@civ-clone/core-player/PlayerAction';
import { PlayerGovernmentRegistry } from '@civ-clone/core-government/PlayerGovernmentRegistry';
import Revolution from '@civ-clone/base-player-action-revolution/Revolution';
import { Turn } from '@civ-clone/core-turn-based-game/Turn';

/**
 * The criteria and effects of the player `Action` rules that offer a change of government. A ruleset makes each
 * criterion its own `Criterion`, in this order: the revolution's two, then the choice's one.
 */

/** Not while the player is in the `Interim` government. */
export const notInInterim =
  (
    Interim: typeof Government,
    playerGovernmentRegistry: PlayerGovernmentRegistry
  ): ((player: Player) => boolean) =>
  (player: Player): boolean =>
    !playerGovernmentRegistry.getByPlayer(player).is(Interim);

/** Not while a revolution is under way, even one with no interim: its new government still has to be chosen. */
export const noRevolutionPending =
  (
    key: string,
    playerGovernmentRegistry: PlayerGovernmentRegistry,
    pendingEffects: PendingEffectRegistry
  ): ((player: Player) => boolean) =>
  (player: Player): boolean =>
    pendingRevolution(
      key,
      playerGovernmentRegistry.getByPlayer(player),
      pendingEffects
    ) === null;

/** The player may start a revolution. */
export const offerRevolution =
  (
    playerGovernmentRegistry: PlayerGovernmentRegistry
  ): ((player: Player) => PlayerAction[]) =>
  (player: Player): PlayerAction[] =>
    [new Revolution(player, playerGovernmentRegistry.getByPlayer(player))];

/** Once the revolution's new government can be chosen. */
export const choiceDue =
  (
    key: string,
    playerGovernmentRegistry: PlayerGovernmentRegistry,
    pendingEffects: PendingEffectRegistry,
    turn: Turn
  ): ((player: Player) => boolean) =>
  (player: Player): boolean =>
    turnsUntilChoice(
      key,
      playerGovernmentRegistry.getByPlayer(player),
      pendingEffects,
      turn
    ) === 0;

/** The player must choose the new government. */
export const offerGovernmentChoice =
  (
    playerGovernmentRegistry: PlayerGovernmentRegistry
  ): ((player: Player) => PlayerAction[]) =>
  (player: Player): PlayerAction[] =>
    [
      new ChooseGovernment(
        player,
        playerGovernmentRegistry.getByPlayer(player)
      ),
    ];
