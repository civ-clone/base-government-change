import Player from '@civ-clone/core-player/Player';
import Rule from '@civ-clone/core-rule/Rule';

/**
 * Whether `player` may choose its government again, with no interim government, in the turn it chose one. With no
 * rule that says so, it may not, and a second revolution in that turn is a revolution like any other.
 */
export class MayRechoose extends Rule<[Player], boolean> {}

export default MayRechoose;
