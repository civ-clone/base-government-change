import {
  Requirement,
  Target,
  met,
} from '@civ-clone/core-requirement/Requirement';
import Advance from '@civ-clone/core-science/Advance';
import Availability from '@civ-clone/core-government/Rules/Availability';
import Criterion from '@civ-clone/core-rule/Criterion';
import { Deriver } from '@civ-clone/core-requirement/RequirementRegistry';
import Government from '@civ-clone/core-government/Government';
import Player from '@civ-clone/core-player/Player';
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
export const availabilityRulesFor = (
  entry: Requirement,
  playerResearchRegistry: PlayerResearchRegistry
): Availability[] => {
  if (entry.relation !== 'requires') {
    return [];
  }

  const isSubject = new Criterion(
    (GovernmentType: typeof Government): boolean =>
      GovernmentType === entry.subject
  );

  if (entry.targets.length === 0) {
    return [new Availability(entry.id, isSubject)];
  }

  return [
    new Availability(
      entry.id,
      isSubject,
      new Criterion((GovernmentType: typeof Government, player: Player) => {
        const playerResearch = playerResearchRegistry.getByPlayer(player);

        return met(entry, (target: Target): boolean =>
          playerResearch.completed(target as typeof Advance)
        );
      })
    ),
  ];
};

/** What a ruleset gives the game's `requirements` to make each entry's rules with. */
export const deriveAvailabilityRules =
  (playerResearchRegistry: PlayerResearchRegistry): Deriver =>
  (entry: Requirement): Availability[] =>
    availabilityRulesFor(entry, playerResearchRegistry);
