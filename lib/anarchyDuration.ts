import Player from '@civ-clone/core-player/Player';
import { RevolutionCause } from '../Rules/AnarchyDuration';

/** An `AnarchyDuration` criterion: the revolution has this `cause`. */
export const forCause =
  (
    cause: RevolutionCause
  ): ((player: Player, given: RevolutionCause) => boolean) =>
  (player: Player, given: RevolutionCause): boolean =>
    given === cause;

/** An `AnarchyDuration` effect: a whole number of turns from `min` to `max`, each equally likely. */
export const randomDuration =
  (
    min: number,
    max: number,
    randomNumberGenerator: () => number
  ): (() => number) =>
  (): number =>
    min + Math.floor(randomNumberGenerator() * (max - min + 1));
