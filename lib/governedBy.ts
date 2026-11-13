import Government from '@civ-clone/core-government/Government';
import Player from '@civ-clone/core-player/Player';
import { PlayerGovernmentRegistry } from '@civ-clone/core-government/PlayerGovernmentRegistry';

/**
 * Whether `player` has one of `governments`. A player with no `PlayerGovernment` has none of them (unlike
 * `PlayerGovernmentRegistry#getByPlayer`, which throws), so a rule that depends on the government can ask before
 * governments are set up.
 */
export const governedBy = (
  player: Player,
  governments: (typeof Government)[],
  playerGovernmentRegistry: PlayerGovernmentRegistry
): boolean =>
  playerGovernmentRegistry
    .getBy('player', player)
    .some((playerGovernment) => playerGovernment.is(...governments));

export default governedBy;
