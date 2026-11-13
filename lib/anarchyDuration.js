"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.randomDuration = exports.forCause = void 0;
/** An `AnarchyDuration` criterion: the revolution has this `cause`. */
const forCause = (cause) => (player, given) => given === cause;
exports.forCause = forCause;
/** An `AnarchyDuration` effect: a whole number of turns from `min` to `max`, each equally likely. */
const randomDuration = (min, max, randomNumberGenerator) => () => min + Math.floor(randomNumberGenerator() * (max - min + 1));
exports.randomDuration = randomDuration;
//# sourceMappingURL=anarchyDuration.js.map