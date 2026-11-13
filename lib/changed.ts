import Engine from '@civ-clone/core-engine/Engine';
import Government from '@civ-clone/core-government/Government';
import Player from '@civ-clone/core-player/Player';
import PlayerTile from '@civ-clone/core-player-world/PlayerTile';
import { PlayerWorldRegistry } from '@civ-clone/core-player-world/PlayerWorldRegistry';

/** The effects and criteria of the `Changed` rules, which run when a player's government changes. */

/** Tells the engine's listeners (`player:government:changed`). */
export const emitGovernmentChanged =
  (engine: Engine): ((player: Player, government: Government) => void) =>
  (player: Player, government: Government): void => {
    engine.emit('player:government:changed', player, government);
  };

/** Whether the player has a world of their own: `false` while none exists, as for a player still being set up. */
export const hasPlayerWorld =
  (playerWorldRegistry: PlayerWorldRegistry): ((player: Player) => boolean) =>
  (player: Player): boolean => {
    try {
      playerWorldRegistry.getByPlayer(player);

      return true;
    } catch (e) {
      if (
        e instanceof TypeError &&
        e.message.match(/Wrong number of player worlds exist/)
      ) {
        return false;
      }

      throw e;
    }
  };

/** Clears the yield cache of every tile the player knows, since what a tile yields can depend on the government. */
export const clearYieldCaches =
  (playerWorldRegistry: PlayerWorldRegistry): ((player: Player) => void) =>
  (player: Player): void => {
    const playerWorld = playerWorldRegistry.getByPlayer(player);

    playerWorld
      .entries()
      .forEach((tile: PlayerTile): void => tile.tile().clearYieldCache(player));
  };
