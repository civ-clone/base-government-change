import { governmentsOpenedBy, offerGovernments } from '../lib/offer';
import Advance from '@civ-clone/core-science/Advance';
import AdvanceRegistry from '@civ-clone/core-science/AdvanceRegistry';
import Availability from '@civ-clone/core-government/Rules/Availability';
import Complete from '@civ-clone/core-science/Rules/Complete';
import Criterion from '@civ-clone/core-rule/Criterion';
import Effect from '@civ-clone/core-rule/Effect';
import Engine from '@civ-clone/core-engine/Engine';
import { Game } from '@civ-clone/core-game/Game';
import Government from '@civ-clone/core-government/Government';
import GovernmentAvailable from '../Rules/GovernmentAvailable';
import Player from '@civ-clone/core-player/Player';
import PlayerResearch from '@civ-clone/core-science/PlayerResearch';
import { Requirement, table } from '@civ-clone/core-requirement/Requirement';
import addPlayerGovernment from '../lib/playerGovernment';
import { availabilityRulesFor } from '../lib/availability';
import { expect } from 'chai';

class Start extends Government {}
class Later extends Government {}
class Elsewhere extends Government {}
class Learning extends Advance {}
class Writing extends Advance {}

const entries: Requirement[] = [
  ...table('test:availability', 'requires', [
    [Start],
    [Later, Learning],
    [Elsewhere, Writing],
  ]),
  // A second way to Later, and another relation, which offers nothing.
  ...table('test:availability/again', 'requires', [[Later, Learning]]),
  ...table('test:obsolete', 'obsoletedBy', [[Start, Learning]]),
];

const setUp = () => {
  const game = new Game(),
    engine = new Engine(),
    player = new Player(game.rules),
    research = new PlayerResearch(player, new AdvanceRegistry(), game.rules),
    offered: unknown[][] = [];

  game.availableGovernments.register(Start, Later, Elsewhere);
  game.rules.register(
    ...entries.flatMap((entry: Requirement): Availability[] =>
      availabilityRulesFor(entry, game.playerResearch)
    ),
    new Complete(
      new Effect(
        offerGovernments(entries, game.playerGovernments, game.rules, engine)
      )
    )
  );
  game.playerResearch.register(research);
  addPlayerGovernment(
    player,
    Start,
    game.availableGovernments,
    game.playerGovernments,
    game.rules
  );

  engine.on('player:government:available', (...args: unknown[]) =>
    offered.push(args)
  );

  return { game, player, research, offered };
};

describe('governmentsOpenedBy', (): void => {
  it('is each government an entry requires the advance for, once, while the player may choose it', (): void => {
    const { game, player, research } = setUp(),
      playerGovernment = game.playerGovernments.getByPlayer(player);

    expect(
      governmentsOpenedBy(entries, Learning, playerGovernment)
    ).to.deep.equal([]);

    research.addAdvance(Learning);

    expect(
      governmentsOpenedBy(entries, Learning, playerGovernment)
    ).to.deep.equal([Later]);
    expect(
      governmentsOpenedBy(entries, Writing, playerGovernment)
    ).to.deep.equal([]);
  });
});

describe('offerGovernments', (): void => {
  it('offers nothing with no `GovernmentAvailable` rules', (): void => {
    const { research, offered } = setUp();

    research.addAdvance(Learning);

    expect(offered).to.deep.equal([]);
  });

  it('offers what a `GovernmentAvailable` rule says to, for the advance just discovered', (): void => {
    const { game, player, research, offered } = setUp(),
      asked: unknown[][] = [];

    game.rules.register(
      new GovernmentAvailable(
        new Criterion(
          (player: Player, GovernmentType: typeof Government): boolean =>
            GovernmentType !== Elsewhere
        ),
        new Effect(
          (player: Player, GovernmentType: typeof Government): boolean => {
            asked.push([player, GovernmentType]);

            return true;
          }
        )
      )
    );

    research.addAdvance(Learning);

    expect(asked).to.deep.equal([[player, Later]]);
    expect(offered).to.deep.equal([[player, Later]]);

    research.addAdvance(Writing);

    expect(offered).to.deep.equal([[player, Later]]);
  });

  it('offers nothing when every rule says no', (): void => {
    const { game, research, offered } = setUp();

    game.rules.register(
      new GovernmentAvailable(new Effect((): boolean => false))
    );

    research.addAdvance(Learning);

    expect(offered).to.deep.equal([]);
  });
});
