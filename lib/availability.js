"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deriveAvailabilityRules = exports.availabilityRulesFor = void 0;
const Requirement_1 = require("@civ-clone/core-requirement/Requirement");
const Availability_1 = require("@civ-clone/core-government/Rules/Availability");
const Criterion_1 = require("@civ-clone/core-rule/Criterion");
/**
 * The rule `entry` is played by: a player may choose its subject while it has the advances the entry `requires`.
 *
 * Each entry is one alternative way to its government, not a condition every way must meet: `PlayerGovernment`
 * offers a government if *any* `Availability` rule allows it, so a second entry for the same government opens another
 * way rather than closing this one.
 *
 * An entry with no targets is always met, so its rule only checks the government.
 */
const availabilityRulesFor = (entry, playerResearchRegistry) => {
    if (entry.relation !== 'requires') {
        return [];
    }
    const isSubject = new Criterion_1.default((GovernmentType) => GovernmentType === entry.subject);
    if (entry.targets.length === 0) {
        return [new Availability_1.default(entry.id, isSubject)];
    }
    return [
        new Availability_1.default(entry.id, isSubject, new Criterion_1.default((GovernmentType, player) => {
            const playerResearch = playerResearchRegistry.getByPlayer(player);
            return (0, Requirement_1.met)(entry, (target) => playerResearch.completed(target));
        })),
    ];
};
exports.availabilityRulesFor = availabilityRulesFor;
/** What a ruleset gives the game's `requirements` to make each entry's rules with. */
const deriveAvailabilityRules = (playerResearchRegistry) => (entry) => (0, exports.availabilityRulesFor)(entry, playerResearchRegistry);
exports.deriveAvailabilityRules = deriveAvailabilityRules;
//# sourceMappingURL=availability.js.map