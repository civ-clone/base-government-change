"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.revolutionTerms = exports.terms = void 0;
const RevolutionTerms_1 = require("../Rules/RevolutionTerms");
/** A `RevolutionTerms` effect: revolutions under the handler `key`, with `Interim` as the government in between. */
const terms = (key, Interim) => () => ({ key, Interim });
exports.terms = terms;
/** The loaded ruleset's revolution (the first `RevolutionTerms` answer), or `null` when no rule gives one. */
const revolutionTerms = (ruleRegistry) => { var _a; return (_a = ruleRegistry.process(RevolutionTerms_1.default)[0]) !== null && _a !== void 0 ? _a : null; };
exports.revolutionTerms = revolutionTerms;
//# sourceMappingURL=terms.js.map