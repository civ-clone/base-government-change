import Government from '@civ-clone/core-government/Government';
import Player from '@civ-clone/core-player/Player';
import Rule from '@civ-clone/core-rule/Rule';
/**
 * Whether `player` is offered a revolution to `GovernmentType`, which an advance it has just discovered made available
 * (`lib/offer`). With no rule that says so, nothing is offered.
 */
export declare class GovernmentAvailable extends Rule<
  [Player, typeof Government],
  boolean
> {}
export default GovernmentAvailable;
