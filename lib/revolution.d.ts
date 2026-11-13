import {
  PendingEffect,
  PendingEffectRegistry,
} from '@civ-clone/core-pending-effect';
import { RevolutionCause } from '../Rules/AnarchyDuration';
import Government from '@civ-clone/core-government/Government';
import PlayerGovernment from '@civ-clone/core-government/PlayerGovernment';
import { RuleRegistry } from '@civ-clone/core-rule/RuleRegistry';
import { Turn } from '@civ-clone/core-turn-based-game/Turn';
/**
 * A revolution is a `PendingEffect` on the `PlayerGovernment`, so a save keeps it. Its handler name, `key` below, is
 * the ruleset's (a save names it), and its data holds `endTurn`, the turn the new government can be chosen on.
 */
export declare class RevolutionError extends Error {}
/** What a pending revolution needs to discharge: the chosen government. */
export declare const applyChosenGovernment: (
  pendingEffect: PendingEffect,
  GovernmentType: typeof Government
) => void;
/** Registers the handler that finishes a revolution, so one loaded from a save can still be finished. */
export declare const registerRevolutionHandler: (
  key: string,
  pendingEffects: PendingEffectRegistry
) => void;
/** The revolution under way for `playerGovernment`, or `null`. */
export declare const pendingRevolution: (
  key: string,
  playerGovernment: PlayerGovernment,
  pendingEffects: PendingEffectRegistry
) => PendingEffect | null;
/** Turns until the new government can be chosen: `0` when it can be chosen now, `null` with no revolution under way. */
export declare const turnsUntilChoice: (
  key: string,
  playerGovernment: PlayerGovernment,
  pendingEffects: PendingEffectRegistry,
  turn: Turn
) => number | null;
/**
 * Overthrow the current government. The player is in the `Interim` government
 * for as many turns as `AnarchyDuration` allows for the `cause` (the shortest
 * answer, never below 0), then chooses a new government. With no interim at
 * all, the choice is due straight away and the current government stays until
 * it is made.
 */
export declare const revolution: (
  key: string,
  Interim: typeof Government,
  playerGovernment: PlayerGovernment,
  pendingEffects: PendingEffectRegistry,
  ruleRegistry: RuleRegistry,
  turn: Turn,
  cause: RevolutionCause
) => void;
/** Finish a revolution whose interim is over, by choosing one of the available governments. */
export declare const chooseGovernment: (
  key: string,
  playerGovernment: PlayerGovernment,
  GovernmentType: typeof Government,
  pendingEffects: PendingEffectRegistry,
  turn: Turn
) => void;
