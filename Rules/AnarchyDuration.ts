import Player from '@civ-clone/core-player/Player';
import Rule from '@civ-clone/core-rule/Rule';

/**
 * Why a government is being overthrown: `'chosen'` for a revolution the player
 * starts, `'civil-disorder'` for a government brought down by its cities'
 * disorder.
 */
export type RevolutionCause = 'chosen' | 'civil-disorder';

/**
 * How many turns of the interim government (Anarchy) a revolution starting now
 * would cause. Every matching rule is asked and the shortest answer wins, so a
 * rule that removes the interim only has to return `0`.
 */
export class AnarchyDuration extends Rule<[Player, RevolutionCause], number> {}

export default AnarchyDuration;
