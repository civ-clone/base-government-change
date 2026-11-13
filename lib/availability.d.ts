import { Requirement } from '@civ-clone/core-requirement/Requirement';
import Availability from '@civ-clone/core-government/Rules/Availability';
import { Deriver } from '@civ-clone/core-requirement/RequirementRegistry';
import { PlayerResearchRegistry } from '@civ-clone/core-science/PlayerResearchRegistry';
/**
 * The rule `entry` is played by: a player may choose its subject while it has the advances the entry `requires`.
 *
 * Each entry is one alternative way to its government, not a condition every way must meet: `PlayerGovernment`
 * offers a government if *any* `Availability` rule allows it, so a second entry for the same government opens another
 * way rather than closing this one.
 *
 * An entry with no targets is always met, so its rule only checks the government.
 */
export declare const availabilityRulesFor: (
  entry: Requirement,
  playerResearchRegistry: PlayerResearchRegistry
) => Availability[];
/** What a ruleset gives the game's `requirements` to make each entry's rules with. */
export declare const deriveAvailabilityRules: (
  playerResearchRegistry: PlayerResearchRegistry
) => Deriver;
