"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rechoiceOpen = exports.chosenThisTurn = exports.recordChoice = exports.mayRechoose = exports.rechoiceKey = void 0;
const core_pending_effect_1 = require("@civ-clone/core-pending-effect");
const MayRechoose_1 = require("../Rules/MayRechoose");
/**
 * Choosing again in the turn a government was chosen. The choice is kept as a `PendingEffect` on the
 * `PlayerGovernment` under the handler `<key>:rechoice`, with the turn it was made in its data, so a save keeps it. It
 * is written only while a `MayRechoose` rule lets the player choose again, and it is never discharged: the next choice
 * replaces it, and from the next turn on it no longer counts.
 */
/** The handler name the choice is kept under, for the revolution handler `key`. */
const rechoiceKey = (key) => `${key}:rechoice`;
exports.rechoiceKey = rechoiceKey;
/** Whether any `MayRechoose` rule lets `player` choose its government again in the turn it chose one. */
const mayRechoose = (player, ruleRegistry) => ruleRegistry
    .process(MayRechoose_1.default, player)
    .some((may) => may === true);
exports.mayRechoose = mayRechoose;
/** Records that a government was chosen this turn, replacing any earlier record. */
const recordChoice = (key, playerGovernment, pendingEffects, turn) => {
    pendingEffects
        .getByTarget(playerGovernment)
        .filter((pendingEffect) => pendingEffect.handler() === (0, exports.rechoiceKey)(key))
        .forEach((pendingEffect) => pendingEffects.unregister(pendingEffect));
    pendingEffects.register(new core_pending_effect_1.PendingEffect((0, exports.rechoiceKey)(key), playerGovernment, {
        turn: String(turn.value()),
    }));
};
exports.recordChoice = recordChoice;
/** Whether a government was chosen (and recorded) this turn. */
const chosenThisTurn = (key, playerGovernment, pendingEffects, turn) => pendingEffects
    .getByTarget(playerGovernment)
    .some((pendingEffect) => pendingEffect.handler() === (0, exports.rechoiceKey)(key) &&
    pendingEffect.data().turn === String(turn.value()));
exports.chosenThisTurn = chosenThisTurn;
/** Whether the player may choose again now, with no interim government: it chose this turn, and a rule allows it. */
const rechoiceOpen = (key, playerGovernment, pendingEffects, ruleRegistry, turn) => (0, exports.chosenThisTurn)(key, playerGovernment, pendingEffects, turn) &&
    (0, exports.mayRechoose)(playerGovernment.player(), ruleRegistry);
exports.rechoiceOpen = rechoiceOpen;
//# sourceMappingURL=rechoice.js.map