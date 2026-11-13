import { AvailableGovernmentRegistry } from '@civ-clone/core-government/AvailableGovernmentRegistry';
import Government from '@civ-clone/core-government/Government';
import Player from '@civ-clone/core-player/Player';
import PlayerGovernment from '@civ-clone/core-government/PlayerGovernment';
import { PlayerGovernmentRegistry } from '@civ-clone/core-government/PlayerGovernmentRegistry';
import { RuleRegistry } from '@civ-clone/core-rule/RuleRegistry';

/** Gives `player` a `PlayerGovernment` under the `Initial` government, and registers it. */
export const addPlayerGovernment = (
  player: Player,
  Initial: typeof Government,
  availableGovernmentRegistry: AvailableGovernmentRegistry,
  playerGovernmentRegistry: PlayerGovernmentRegistry,
  ruleRegistry: RuleRegistry
): void => {
  const playerGovernment = new PlayerGovernment(
    player,
    availableGovernmentRegistry,
    ruleRegistry
  );

  playerGovernment.set(new Initial());

  playerGovernmentRegistry.register(playerGovernment);
};

export default addPlayerGovernment;
