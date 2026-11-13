"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addPlayerGovernment = void 0;
const PlayerGovernment_1 = require("@civ-clone/core-government/PlayerGovernment");
/** Gives `player` a `PlayerGovernment` under the `Initial` government, and registers it. */
const addPlayerGovernment = (player, Initial, availableGovernmentRegistry, playerGovernmentRegistry, ruleRegistry) => {
    const playerGovernment = new PlayerGovernment_1.default(player, availableGovernmentRegistry, ruleRegistry);
    playerGovernment.set(new Initial());
    playerGovernmentRegistry.register(playerGovernment);
};
exports.addPlayerGovernment = addPlayerGovernment;
exports.default = exports.addPlayerGovernment;
//# sourceMappingURL=playerGovernment.js.map