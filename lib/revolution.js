"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chooseGovernment = exports.revolution = exports.turnsUntilChoice = exports.pendingRevolution = exports.registerRevolutionHandler = exports.applyChosenGovernment = exports.RevolutionError = void 0;
const core_pending_effect_1 = require("@civ-clone/core-pending-effect");
const AnarchyDuration_1 = require("../Rules/AnarchyDuration");
const rechoice_1 = require("./rechoice");
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
/**
 * Registers the handler that finishes a revolution, so one loaded from a save can still be finished, and one that does
 * nothing for the record of a choice (`lib/rechoice`), which owes nothing, so discharging every pending effect can't
 * throw on it.
 */
const registerRevolutionHandler = (key, pendingEffects) => {
    pendingEffects.handler(key, (pendingEffect, GovernmentType) => (0, exports.applyChosenGovernment)(pendingEffect, GovernmentType));
    pendingEffects.handler((0, rechoice_1.rechoiceKey)(key), () => { });
};
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
 *
 * A player who chose its government this turn, while a `MayRechoose` rule lets
 * it (`lib/rechoice`), starts no interim at all for a revolution it chooses:
 * the choice is due straight away, whatever `AnarchyDuration` says.
 */
const revolution = (key, Interim, playerGovernment, pendingEffects, ruleRegistry, turn, cause) => {
    if ((0, exports.pendingRevolution)(key, playerGovernment, pendingEffects) !== null) {
        throw new RevolutionError('A revolution is already under way.');
    }
    if (cause === 'chosen' &&
        (0, rechoice_1.rechoiceOpen)(key, playerGovernment, pendingEffects, ruleRegistry, turn)) {
        pendingEffects.register(new core_pending_effect_1.PendingEffect(key, playerGovernment, {
            endTurn: String(turn.value()),
        }));
        return;
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
/**
 * Finish a revolution whose interim is over, by choosing one of the available governments. Given the game's
 * `ruleRegistry`, and while a `MayRechoose` rule lets the player choose again in the same turn, the choice is recorded
 * (`lib/rechoice`), so a revolution later in this turn takes no interim.
 */
const chooseGovernment = (key, playerGovernment, GovernmentType, pendingEffects, turn, ruleRegistry) => {
    const pendingEffect = (0, exports.pendingRevolution)(key, playerGovernment, pendingEffects);
    if (pendingEffect === null ||
        (0, exports.turnsUntilChoice)(key, playerGovernment, pendingEffects, turn) !== 0) {
        throw new RevolutionError('No government can be chosen yet.');
    }
    if (!playerGovernment.available().includes(GovernmentType)) {
        throw new RevolutionError(`${GovernmentType.name} is not available.`);
    }
    pendingEffects.discharge(pendingEffect, GovernmentType);
    if (ruleRegistry !== undefined &&
        (0, rechoice_1.mayRechoose)(playerGovernment.player(), ruleRegistry)) {
        (0, rechoice_1.recordChoice)(key, playerGovernment, pendingEffects, turn);
    }
};
exports.chooseGovernment = chooseGovernment;
//# sourceMappingURL=revolution.js.map