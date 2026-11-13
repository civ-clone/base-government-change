"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.governedBy = void 0;
/**
 * Whether `player` has one of `governments`. A player with no `PlayerGovernment` has none of them (unlike
 * `PlayerGovernmentRegistry#getByPlayer`, which throws), so a rule that depends on the government can ask before
 * governments are set up.
 */
const governedBy = (player, governments, playerGovernmentRegistry) => playerGovernmentRegistry
    .getBy('player', player)
    .some((playerGovernment) => playerGovernment.is(...governments));
exports.governedBy = governedBy;
exports.default = exports.governedBy;
//# sourceMappingURL=governedBy.js.map