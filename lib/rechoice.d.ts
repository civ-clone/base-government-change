import { PendingEffectRegistry } from '@civ-clone/core-pending-effect';
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
export declare const rechoiceKey: (key: string) => string;
/** Whether any `MayRechoose` rule lets `player` choose its government again in the turn it chose one. */
export declare const mayRechoose: (
  player: Player,
  ruleRegistry: RuleRegistry
) => boolean;
/** Records that a government was chosen this turn, replacing any earlier record. */
export declare const recordChoice: (
  key: string,
  playerGovernment: PlayerGovernment,
  pendingEffects: PendingEffectRegistry,
  turn: Turn
) => void;
/** Whether a government was chosen (and recorded) this turn. */
export declare const chosenThisTurn: (
  key: string,
  playerGovernment: PlayerGovernment,
  pendingEffects: PendingEffectRegistry,
  turn: Turn
) => boolean;
/** Whether the player may choose again now, with no interim government: it chose this turn, and a rule allows it. */
export declare const rechoiceOpen: (
  key: string,
  playerGovernment: PlayerGovernment,
  pendingEffects: PendingEffectRegistry,
  ruleRegistry: RuleRegistry,
  turn: Turn
) => boolean;
