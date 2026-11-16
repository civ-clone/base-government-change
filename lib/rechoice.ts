import {
  PendingEffect,
  PendingEffectRegistry,
} from '@civ-clone/core-pending-effect';
import MayRechoose from '../Rules/MayRechoose';
import Player from '@civ-clone/core-player/Player';
import PlayerGovernment from '@civ-clone/core-government/PlayerGovernment';
import { RuleRegistry } from '@civ-clone/core-rule/RuleRegistry';
import { Turn } from '@civ-clone/core-turn-based-game/Turn';

/**
 * Choosing again in the turn a government was chosen. The choice is kept as a `PendingEffect` on the
 * `PlayerGovernment` under the handler `<key>:rechoice`, with the turn it was made in its data, so a save keeps it. It
 * is written only while a `MayRechoose` rule lets the player choose again, and it is never discharged: the next choice
 * replaces it, and from the next turn on it no longer counts.
 */

/** The handler name the choice is kept under, for the revolution handler `key`. */
export const rechoiceKey = (key: string): string => `${key}:rechoice`;

/** Whether any `MayRechoose` rule lets `player` choose its government again in the turn it chose one. */
export const mayRechoose = (
  player: Player,
  ruleRegistry: RuleRegistry
): boolean =>
  ruleRegistry
    .process(MayRechoose, player)
    .some((may: boolean): boolean => may === true);

/** Records that a government was chosen this turn, replacing any earlier record. */
export const recordChoice = (
  key: string,
  playerGovernment: PlayerGovernment,
  pendingEffects: PendingEffectRegistry,
  turn: Turn
): void => {
  pendingEffects
    .getByTarget(playerGovernment)
    .filter(
      (pendingEffect: PendingEffect): boolean =>
        pendingEffect.handler() === rechoiceKey(key)
    )
    .forEach((pendingEffect: PendingEffect): void =>
      pendingEffects.unregister(pendingEffect)
    );

  pendingEffects.register(
    new PendingEffect(rechoiceKey(key), playerGovernment, {
      turn: String(turn.value()),
    })
  );
};

/** Whether a government was chosen (and recorded) this turn. */
export const chosenThisTurn = (
  key: string,
  playerGovernment: PlayerGovernment,
  pendingEffects: PendingEffectRegistry,
  turn: Turn
): boolean =>
  pendingEffects
    .getByTarget(playerGovernment)
    .some(
      (pendingEffect: PendingEffect): boolean =>
        pendingEffect.handler() === rechoiceKey(key) &&
        pendingEffect.data().turn === String(turn.value())
    );

/** Whether the player may choose again now, with no interim government: it chose this turn, and a rule allows it. */
export const rechoiceOpen = (
  key: string,
  playerGovernment: PlayerGovernment,
  pendingEffects: PendingEffectRegistry,
  ruleRegistry: RuleRegistry,
  turn: Turn
): boolean =>
  chosenThisTurn(key, playerGovernment, pendingEffects, turn) &&
  mayRechoose(playerGovernment.player(), ruleRegistry);
