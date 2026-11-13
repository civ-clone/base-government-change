"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearYieldCaches = exports.hasPlayerWorld = exports.emitGovernmentChanged = void 0;
/** The effects and criteria of the `Changed` rules, which run when a player's government changes. */
/** Tells the engine's listeners (`player:government:changed`). */
const emitGovernmentChanged = (engine) => (player, government) => {
    engine.emit('player:government:changed', player, government);
};
exports.emitGovernmentChanged = emitGovernmentChanged;
/** Whether the player has a world of their own: `false` while none exists, as for a player still being set up. */
const hasPlayerWorld = (playerWorldRegistry) => (player) => {
    try {
        playerWorldRegistry.getByPlayer(player);
        return true;
    }
    catch (e) {
        if (e instanceof TypeError &&
            e.message.match(/Wrong number of player worlds exist/)) {
            return false;
        }
        throw e;
    }
};
exports.hasPlayerWorld = hasPlayerWorld;
/** Clears the yield cache of every tile the player knows, since what a tile yields can depend on the government. */
const clearYieldCaches = (playerWorldRegistry) => (player) => {
    const playerWorld = playerWorldRegistry.getByPlayer(player);
    playerWorld
        .entries()
        .forEach((tile) => tile.tile().clearYieldCache(player));
};
exports.clearYieldCaches = clearYieldCaches;
//# sourceMappingURL=changed.js.map