import Government from '@civ-clone/core-government/Government';
import { PendingEffectRegistry } from '@civ-clone/core-pending-effect';
import Player from '@civ-clone/core-player/Player';
import PlayerAction from '@civ-clone/core-player/PlayerAction';
import { PlayerGovernmentRegistry } from '@civ-clone/core-government/PlayerGovernmentRegistry';
import { Turn } from '@civ-clone/core-turn-based-game/Turn';
/**
 * The criteria and effects of the player `Action` rules that offer a change of government. A ruleset makes each
 * criterion its own `Criterion`, in this order: the revolution's two, then the choice's one.
 */
/** Not while the player is in the `Interim` government. */
export declare const notInInterim: (
  Interim: typeof Government,
  playerGovernmentRegistry: PlayerGovernmentRegistry
) => (player: Player) => boolean;
/** Not while a revolution is under way, even one with no interim: its new government still has to be chosen. */
export declare const noRevolutionPending: (
  key: string,
  playerGovernmentRegistry: PlayerGovernmentRegistry,
  pendingEffects: PendingEffectRegistry
) => (player: Player) => boolean;
/** The player may start a revolution. */
export declare const offerRevolution: (
  playerGovernmentRegistry: PlayerGovernmentRegistry
) => (player: Player) => PlayerAction[];
/** Once the revolution's new government can be chosen. */
export declare const choiceDue: (
  key: string,
  playerGovernmentRegistry: PlayerGovernmentRegistry,
  pendingEffects: PendingEffectRegistry,
  turn: Turn
) => (player: Player) => boolean;
/** The player must choose the new government. */
export declare const offerGovernmentChoice: (
  playerGovernmentRegistry: PlayerGovernmentRegistry
) => (player: Player) => PlayerAction[];
