"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chooseGovernment = exports.revolution = exports.turnsUntilChoice = exports.pendingRevolution = exports.registerRevolutionHandler = exports.applyChosenGovernment = exports.RevolutionError = void 0;
const core_pending_effect_1 = require("@civ-clone/core-pending-effect");
const AnarchyDuration_1 = require("../Rules/AnarchyDuration");
/**
 * A revolution is a `PendingEffect` on the `PlayerGovernment`, so a save keeps it. Its handler name, `key` below, is
 * the ruleset's (a save names it), and its data holds `endTurn`, the turn the new government can be chosen on.
 */
class RevolutionError extends Error {
}
exports.RevolutionError = RevolutionError;
/** What a pending revolution needs to discharge: the chosen government. */
const applyChosenGovernment = (pendingEffect, GovernmentType) => pendingEffect.target().set(new GovernmentType());
exports.applyChosenGovernment = applyChosenGovernment;
/** Registers the handler that finishes a revolution, so one loaded from a save can still be finished. */
const registerRevolutionHandler = (key, pendingEffects) => pendingEffects.handler(key, (pendingEffect, GovernmentType) => (0, exports.applyChosenGovernment)(pendingEffect, GovernmentType));
exports.registerRevolutionHandler = registerRevolutionHandler;
/** The revolution under way for `playerGovernment`, or `null`. */
const pendingRevolution = (key, playerGovernment, pendingEffects) => {
    var _a;
    return (_a = pendingEffects
        .getByTarget(playerGovernment)
        .find((pendingEffect) => pendingEffect.handler() === key)) !== null && _a !== void 0 ? _a : null;
};
exports.pendingRevolution = pendingRevolution;
/** Turns until the new government can be chosen: `0` when it can be chosen now, `null` with no revolution under way. */
const turnsUntilChoice = (key, playerGovernment, pendingEffects, turn) => {
    const pendingEffect = (0, exports.pendingRevolution)(key, playerGovernment, pendingEffects);
    if (pendingEffect === null) {
        return null;
    }
    return Math.max(0, Number(pendingEffect.data().endTurn) - turn.value());
};
exports.turnsUntilChoice = turnsUntilChoice;
/**
 * Overthrow the current government. The player is in the `Interim` government
 * for as many turns as `AnarchyDuration` allows for the `cause` (the shortest
 * answer, never below 0), then chooses a new government. With no interim at
 * all, the choice is due straight away and the current government stays until
 * it is made.
 */
const revolution = (key, Interim, playerGovernment, pendingEffects, ruleRegistry, turn, cause) => {
    if ((0, exports.pendingRevolution)(key, playerGovernment, pendingEffects) !== null) {
        throw new RevolutionError('A revolution is already under way.');
    }
    const duration = Math.max(0, Math.min(...ruleRegistry.process(AnarchyDuration_1.default, playerGovernment.player(), cause)));
    if (!Number.isFinite(duration)) {
        throw new RevolutionError('No `AnarchyDuration` rule applies.');
    }
    pendingEffects.register(new core_pending_effect_1.PendingEffect(key, playerGovernment, {
        endTurn: String(turn.value() + duration),
    }));
    if (duration > 0) {
        playerGovernment.set(new Interim());
    }
};
exports.revolution = revolution;
/** Finish a revolution whose interim is over, by choosing one of the available governments. */
const chooseGovernment = (key, playerGovernment, GovernmentType, pendingEffects, turn) => {
    const pendingEffect = (0, exports.pendingRevolution)(key, playerGovernment, pendingEffects);
    if (pendingEffect === null ||
        (0, exports.turnsUntilChoice)(key, playerGovernment, pendingEffects, turn) !== 0) {
        throw new RevolutionError('No government can be chosen yet.');
    }
    if (!playerGovernment.available().includes(GovernmentType)) {
        throw new RevolutionError(`${GovernmentType.name} is not available.`);
    }
    pendingEffects.discharge(pendingEffect, GovernmentType);
};
exports.chooseGovernment = chooseGovernment;
//# sourceMappingURL=revolution.js.map