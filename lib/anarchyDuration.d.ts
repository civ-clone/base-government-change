import Player from '@civ-clone/core-player/Player';
import { RevolutionCause } from '../Rules/AnarchyDuration';
/** An `AnarchyDuration` criterion: the revolution has this `cause`. */
export declare const forCause: (
  cause: RevolutionCause
) => (player: Player, given: RevolutionCause) => boolean;
/** An `AnarchyDuration` effect: a whole number of turns from `min` to `max`, each equally likely. */
export declare const randomDuration: (
  min: number,
  max: number,
  randomNumberGenerator: () => number
) => () => number;
