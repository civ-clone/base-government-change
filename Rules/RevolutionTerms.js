"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RevolutionTerms = void 0;
const Rule_1 = require("@civ-clone/core-rule/Rule");
/**
 * Which revolution the loaded ruleset plays: the `key` and `Interim` it passes to `lib/revolution`. A ruleset registers
 * one, so code that isn't part of the ruleset (a computer player, say) can start and finish its revolutions through
 * `lib/revolution` as the ruleset does. `lib/terms`' `revolutionTerms` reads it.
 */
class RevolutionTerms extends Rule_1.default {
}
exports.RevolutionTerms = RevolutionTerms;
exports.default = RevolutionTerms;
//# sourceMappingURL=RevolutionTerms.js.map