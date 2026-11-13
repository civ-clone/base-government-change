import {
  PendingEffect,
  PendingEffectRegistry,
} from '@civ-clone/core-pending-effect';
import AnarchyDuration, { RevolutionCause } from '../Rules/AnarchyDuration';
import Government from '@civ-clone/core-government/Government';
import PlayerGovernment from '@civ-clone/core-government/PlayerGovernment';
import { RuleRegistry } from '@civ-clone/core-rule/RuleRegistry';
import { Turn } from '@civ-clone/core-turn-based-game/Turn';

/**
 * A revolution is a `PendingEffect` on the `PlayerGovernment`, so a save keeps it. Its handler name, `key` below, is
 * the ruleset's (a save names it), and its data holds `endTurn`, the turn the new government can be chosen on.
 */

export class RevolutionError extends Error {}

/** What a pending revolution needs to discharge: the chosen government. */
export const applyChosenGovernment = (
  pendingEffect: PendingEffect,
  GovernmentType: typeof Government
): void =>
  (pendingEffect.target() as PlayerGovernment).set(new GovernmentType());

/** Registers the handler that finishes a revolution, so one loaded from a save can still be finished. */
export const registerRevolutionHandler = (
  key: string,
  pendingEffects: PendingEffectRegistry
): void =>
  pendingEffects.handler(key, (pendingEffect, GovernmentType) =>
    applyChosenGovernment(pendingEffect, GovernmentType as typeof Government)
  );

/** The revolution under way for `playerGovernment`, or `null`. */
export const pendingRevolution = (
  key: string,
  playerGovernment: PlayerGovernment,
  pendingEffects: PendingEffectRegistry
): PendingEffect | null =>
  pendingEffects
    .getByTarget(playerGovernment)
    .find(
      (pendingEffect: PendingEffect): boolean => pendingEffect.handler() === key
    ) ?? null;

/** Turns until the new government can be chosen: `0` when it can be chosen now, `null` with no revolution under way. */
export const turnsUntilChoice = (
  key: string,
  playerGovernment: PlayerGovernment,
  pendingEffects: PendingEffectRegistry,
  turn: Turn
): number | null => {
  const pendingEffect = pendingRevolution(
    key,
    playerGovernment,
    pendingEffects
  );

  if (pendingEffect === null) {
    return null;
  }

  return Math.max(0, Number(pendingEffect.data().endTurn) - turn.value());
};

/**
 * Overthrow the current government. The player is in the `Interim` government
 * for as many turns as `AnarchyDuration` allows for the `cause` (the shortest
 * answer, never below 0), then chooses a new government. With no interim at
 * all, the choice is due straight away and the current government stays until
 * it is made.
 */
export const revolution = (
  key: string,
  Interim: typeof Government,
  playerGovernment: PlayerGovernment,
  pendingEffects: PendingEffectRegistry,
  ruleRegistry: RuleRegistry,
  turn: Turn,
  cause: RevolutionCause
): void => {
  if (pendingRevolution(key, playerGovernment, pendingEffects) !== null) {
    throw new RevolutionError('A revolution is already under way.');
  }

  const duration = Math.max(
    0,
    Math.min(
      ...ruleRegistry.process(AnarchyDuration, playerGovernment.player(), cause)
    )
  );

  if (!Number.isFinite(duration)) {
    throw new RevolutionError('No `AnarchyDuration` rule applies.');
  }

  pendingEffects.register(
    new PendingEffect(key, playerGovernment, {
      endTurn: String(turn.value() + duration),
    })
  );

  if (duration > 0) {
    playerGovernment.set(new Interim());
  }
};

/** Finish a revolution whose interim is over, by choosing one of the available governments. */
export const chooseGovernment = (
  key: string,
  playerGovernment: PlayerGovernment,
  GovernmentType: typeof Government,
  pendingEffects: PendingEffectRegistry,
  turn: Turn
): void => {
  const pendingEffect = pendingRevolution(
    key,
    playerGovernment,
    pendingEffects
  );

  if (
    pendingEffect === null ||
    turnsUntilChoice(key, playerGovernment, pendingEffects, turn) !== 0
  ) {
    throw new RevolutionError('No government can be chosen yet.');
  }

  if (!playerGovernment.available().includes(GovernmentType)) {
    throw new RevolutionError(`${GovernmentType.name} is not available.`);
  }

  pendingEffects.discharge(pendingEffect, GovernmentType);
};
