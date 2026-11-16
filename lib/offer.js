"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.offerGovernments = exports.governmentsOpenedBy = void 0;
const GovernmentAvailable_1 = require("../Rules/GovernmentAvailable");
const revolution_1 = require("./revolution");
/**
 * The governments discovering `AdvanceType` made available to the player: each one an entry of `entries` (the rule
 * set's "government requires advances" entries, as `lib/availability` plays them) requires the advance for, and that
 * the player may now choose. In the order of `entries`, each once.
 */
const governmentsOpenedBy = (entries, AdvanceType, playerGovernment) => {
    const available = playerGovernment.available();
    return entries
        .filter((entry) => entry.relation === 'requires' && entry.targets.includes(AdvanceType))
        .map((entry) => entry.subject)
        .filter((GovernmentType, index, all) => all.indexOf(GovernmentType) === index &&
        available.includes(GovernmentType));
};
exports.governmentsOpenedBy = governmentsOpenedBy;
/**
 * A research `Complete` rule's effect that offers a revolution to each government the discovered advance made available
 * (`governmentsOpenedBy`), other than the one the player already has. For each one any `GovernmentAvailable` rule says
 * to offer, the engine emits `player:government:available` with the player and the government, for a client to ask
 * whether to start one. Nothing is offered while a revolution under the handler `key` is under way, nor with no
 * `GovernmentAvailable` rules.
 */
const offerGovernments = (key, entries, playerGovernmentRegistry, pendingEffects, ruleRegistry, engine) => (playerResearch, advance) => {
    const player = playerResearch.player(), [playerGovernment] = playerGovernmentRegistry.getBy('player', player);
    if (!playerGovernment ||
        (0, revolution_1.pendingRevolution)(key, playerGovernment, pendingEffects) !== null) {
        return;
    }
    (0, exports.governmentsOpenedBy)(entries, advance.constructor, playerGovernment).forEach((GovernmentType) => {
        if (!playerGovernment.is(GovernmentType) &&
            ruleRegistry
                .process(GovernmentAvailable_1.default, player, GovernmentType)
                .some((offered) => offered === true)) {
            engine.emit('player:government:available', player, GovernmentType);
        }
    });
};
exports.offerGovernments = offerGovernments;
exports.default = exports.offerGovernments;
//# sourceMappingURL=offer.js.map