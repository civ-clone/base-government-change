"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.offerGovernmentChoice = exports.choiceDue = exports.offerRevolution = exports.noRevolutionPending = exports.notInInterim = void 0;
const revolution_1 = require("./revolution");
const ChooseGovernment_1 = require("@civ-clone/base-player-action-choose-government/ChooseGovernment");
const Revolution_1 = require("@civ-clone/base-player-action-revolution/Revolution");
/**
 * The criteria and effects of the player `Action` rules that offer a change of government. A ruleset makes each
 * criterion its own `Criterion`, in this order: the revolution's two, then the choice's one.
 */
/** Not while the player is in the `Interim` government. */
const notInInterim = (Interim, playerGovernmentRegistry) => (player) => !playerGovernmentRegistry.getByPlayer(player).is(Interim);
exports.notInInterim = notInInterim;
/** Not while a revolution is under way, even one with no interim: its new government still has to be chosen. */
const noRevolutionPending = (key, playerGovernmentRegistry, pendingEffects) => (player) => (0, revolution_1.pendingRevolution)(key, playerGovernmentRegistry.getByPlayer(player), pendingEffects) === null;
exports.noRevolutionPending = noRevolutionPending;
/** The player may start a revolution. */
const offerRevolution = (playerGovernmentRegistry) => (player) => [new Revolution_1.default(player, playerGovernmentRegistry.getByPlayer(player))];
exports.offerRevolution = offerRevolution;
/** Once the revolution's new government can be chosen. */
const choiceDue = (key, playerGovernmentRegistry, pendingEffects, turn) => (player) => (0, revolution_1.turnsUntilChoice)(key, playerGovernmentRegistry.getByPlayer(player), pendingEffects, turn) === 0;
exports.choiceDue = choiceDue;
/** The player must choose the new government. */
const offerGovernmentChoice = (playerGovernmentRegistry) => (player) => [
    new ChooseGovernment_1.default(player, playerGovernmentRegistry.getByPlayer(player)),
];
exports.offerGovernmentChoice = offerGovernmentChoice;
//# sourceMappingURL=actions.js.map