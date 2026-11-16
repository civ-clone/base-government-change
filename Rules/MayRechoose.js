"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MayRechoose = void 0;
const Rule_1 = require("@civ-clone/core-rule/Rule");
/**
 * Whether `player` may choose its government again, with no interim government, in the turn it chose one. With no
 * rule that says so, it may not, and a second revolution in that turn is a revolution like any other.
 */
class MayRechoose extends Rule_1.default {
}
exports.MayRechoose = MayRechoose;
exports.default = MayRechoose;
//# sourceMappingURL=MayRechoose.js.map