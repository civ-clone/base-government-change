import Engine from '@civ-clone/core-engine/Engine';
import Government from '@civ-clone/core-government/Government';
import Player from '@civ-clone/core-player/Player';
import { PlayerWorldRegistry } from '@civ-clone/core-player-world/PlayerWorldRegistry';
/** The effects and criteria of the `Changed` rules, which run when a player's government changes. */
/** Tells the engine's listeners (`player:government:changed`). */
export declare const emitGovernmentChanged: (
  engine: Engine
) => (player: Player, government: Government) => void;
/** Whether the player has a world of their own: `false` while none exists, as for a player still being set up. */
export declare const hasPlayerWorld: (
  playerWorldRegistry: PlayerWorldRegistry
) => (player: Player) => boolean;
/** Clears the yield cache of every tile the player knows, since what a tile yields can depend on the government. */
export declare const clearYieldCaches: (
  playerWorldRegistry: PlayerWorldRegistry
) => (player: Player) => void;
