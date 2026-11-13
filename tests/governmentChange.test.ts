import {
  RevolutionError,
  applyChosenGovernment,
  chooseGovernment,
  pendingRevolution,
  registerRevolutionHandler,
  revolution,
  turnsUntilChoice,
} from '../lib/revolution';
import {
  choiceDue,
  noRevolutionPending,
  notInInterim,
  offerGovernmentChoice,
  offerRevolution,
} from '../lib/actions';
import {
  clearYieldCaches,
  emitGovernmentChanged,
  hasPlayerWorld,
} from '../lib/changed';
import { forCause, randomDuration } from '../lib/anarchyDuration';
import Advance from '@civ-clone/core-science/Advance';
import AdvanceRegistry from '@civ-clone/core-science/AdvanceRegistry';
import AnarchyDuration from '../Rules/AnarchyDuration';
import Availability from '@civ-clone/core-government/Rules/Availability';
import Criterion from '@civ-clone/core-rule/Criterion';
import ChooseGovernment from '@civ-clone/base-player-action-choose-government/ChooseGovernment';
import Effect from '@civ-clone/core-rule/Effect';
import Engine from '@civ-clone/core-engine/Engine';
import { Game } from '@civ-clone/core-game/Game';
import Government from '@civ-clone/core-government/Government';
import { PendingEffect } from '@civ-clone/core-pending-effect';
import Player from '@civ-clone/core-player/Player';
import PlayerGovernment from '@civ-clone/core-government/PlayerGovernment';
import PlayerGovernmentRegistry from '@civ-clone/core-government/PlayerGovernmentRegistry';
import PlayerResearch from '@civ-clone/core-science/PlayerResearch';
import PlayerWorldRegistry from '@civ-clone/core-player-world/PlayerWorldRegistry';
import Revolution from '@civ-clone/base-player-action-revolution/Revolution';
import addPlayerGovernment from '../lib/playerGovernment';
import { availabilityRulesFor } from '../lib/availability';
import { expect } from 'chai';
import governedBy from '../lib/governedBy';

class Interim extends Government {}
class Start extends Government {}
class Later extends Government {}
class Unavailable extends Government {}
class Learning extends Advance {}

const KEY = 'test:revolution';

const setUp = (...durations: number[]) => {
  const game = new Game();

  game.availableGovernments.register(Interim, Start, Later);
  game.rules.register(
    new Availability(
      new Criterion(
        (GovernmentType: typeof Government): boolean =>
          GovernmentType === Start || GovernmentType === Later
      )
    )
  );

  durations.forEach((duration) =>
    game.rules.register(new AnarchyDuration(new Effect((): number => duration)))
  );

  const player = new Player(game.rules);

  addPlayerGovernment(
    player,
    Start,
    game.availableGovernments,
    game.playerGovernments,
    game.rules
  );

  registerRevolutionHandler(KEY, game.pendingEffects);

  const playerGovernment = game.playerGovernments.getByPlayer(player),
    revolt = (cause: 'chosen' | 'civil-disorder' = 'chosen'): void =>
      revolution(
        KEY,
        Interim,
        playerGovernment,
        game.pendingEffects,
        game.rules,
        game.turn,
        cause
      );

  return { game, player, playerGovernment, revolt };
};

describe('addPlayerGovernment', (): void => {
  it('registers a PlayerGovernment for the player under the initial government', (): void => {
    const { game, player, playerGovernment } = setUp();

    expect(playerGovernment).to.be.instanceOf(PlayerGovernment);
    expect(playerGovernment.player()).to.equal(player);
    expect(playerGovernment.is(Start)).true;
    expect(game.playerGovernments.entries()).to.have.length(1);
  });
});

describe('revolution', (): void => {
  it('lasts the shortest duration any rule gives, under the interim government', (): void => {
    const { game, playerGovernment, revolt } = setUp(3, 2, 5);

    revolt();

    expect(playerGovernment.is(Interim)).true;
    expect(
      turnsUntilChoice(KEY, playerGovernment, game.pendingEffects, game.turn)
    ).to.equal(2);
    expect(
      pendingRevolution(KEY, playerGovernment, game.pendingEffects)?.data()
    ).to.deep.equal({ endTurn: String(game.turn.value() + 2) });
  });

  it('passes the player and the cause to the duration rules', (): void => {
    const { game, player, playerGovernment, revolt } = setUp(),
      asked: [Player, string][] = [];

    game.rules.register(
      new AnarchyDuration(
        new Effect((asker: Player, cause: string): number => {
          asked.push([asker, cause]);

          return 1;
        })
      )
    );

    revolt('civil-disorder');

    expect(asked).to.deep.equal([[player, 'civil-disorder']]);
    expect(playerGovernment.is(Interim)).true;
  });

  it('never lasts less than no turns', (): void => {
    const { game, playerGovernment, revolt } = setUp(-3);

    revolt();

    expect(playerGovernment.is(Start)).true;
    expect(
      turnsUntilChoice(KEY, playerGovernment, game.pendingEffects, game.turn)
    ).to.equal(0);
  });

  it('keeps the current government when it lasts no turns, with the choice due at once', (): void => {
    const { game, playerGovernment, revolt } = setUp(0, 4);

    revolt();

    expect(playerGovernment.is(Start)).true;
    expect(pendingRevolution(KEY, playerGovernment, game.pendingEffects)).not
      .null;
    expect(
      turnsUntilChoice(KEY, playerGovernment, game.pendingEffects, game.turn)
    ).to.equal(0);
  });

  it('refuses a second revolution while one is under way, and one with no duration rule', (): void => {
    const { revolt } = setUp(2);

    revolt();

    expect(() => revolt()).to.throw(
      RevolutionError,
      'A revolution is already under way.'
    );

    const { revolt: noRules } = setUp();

    expect(() => noRules()).to.throw(
      RevolutionError,
      'No `AnarchyDuration` rule applies.'
    );
  });

  it('records the revolution before the government changes', (): void => {
    const { game, playerGovernment, revolt } = setUp(1),
      seen: (PendingEffect | null)[] = [];

    playerGovernment.set = ((set) =>
      function (this: PlayerGovernment, government: Government): void {
        seen.push(
          pendingRevolution(KEY, playerGovernment, game.pendingEffects)
        );

        set.call(this, government);
      })(playerGovernment.set);

    revolt();

    expect(seen).to.have.length(1);
    expect(seen[0]?.handler()).to.equal(KEY);
  });

  it('only sees revolutions recorded under its own key', (): void => {
    const { game, playerGovernment, revolt } = setUp(2);

    revolt();

    expect(pendingRevolution('other', playerGovernment, game.pendingEffects))
      .null;
    expect(
      turnsUntilChoice(
        'other',
        playerGovernment,
        game.pendingEffects,
        game.turn
      )
    ).null;
    expect(
      noRevolutionPending(
        'other',
        game.playerGovernments,
        game.pendingEffects
      )(playerGovernment.player())
    ).true;
  });

  it('counts down to the choice, then never below 0', (): void => {
    const { game, playerGovernment, revolt } = setUp(2),
      left = (): number | null =>
        turnsUntilChoice(KEY, playerGovernment, game.pendingEffects, game.turn);

    expect(left()).null;

    revolt();

    const counts = [left()];

    for (let i = 0; i < 3; i++) {
      game.turn.increment();
      counts.push(left());
    }

    expect(counts).to.deep.equal([2, 1, 0, 0]);
  });
});

describe('chooseGovernment', (): void => {
  it('sets the chosen government and finishes the revolution once it is due', (): void => {
    const { game, playerGovernment, revolt } = setUp(1);

    revolt();

    expect(() =>
      chooseGovernment(
        KEY,
        playerGovernment,
        Later,
        game.pendingEffects,
        game.turn
      )
    ).to.throw(RevolutionError, 'No government can be chosen yet.');

    game.turn.increment();

    chooseGovernment(
      KEY,
      playerGovernment,
      Later,
      game.pendingEffects,
      game.turn
    );

    expect(playerGovernment.is(Later)).true;
    expect(pendingRevolution(KEY, playerGovernment, game.pendingEffects)).null;
  });

  it('refuses with no revolution, and a government that is not available', (): void => {
    const { game, playerGovernment, revolt } = setUp(0);

    expect(() =>
      chooseGovernment(
        KEY,
        playerGovernment,
        Later,
        game.pendingEffects,
        game.turn
      )
    ).to.throw(RevolutionError, 'No government can be chosen yet.');

    revolt();

    expect(() =>
      chooseGovernment(
        KEY,
        playerGovernment,
        Unavailable,
        game.pendingEffects,
        game.turn
      )
    ).to.throw(RevolutionError, 'Unavailable is not available.');
    expect(pendingRevolution(KEY, playerGovernment, game.pendingEffects)).not
      .null;
  });

  it('applies the chosen government to the revolution’s target', (): void => {
    const { game, playerGovernment } = setUp(),
      pendingEffect = new PendingEffect(KEY, playerGovernment, {
        endTurn: '0',
      });

    applyChosenGovernment(pendingEffect, Later);

    expect(playerGovernment.is(Later)).true;
    expect(game.pendingEffects.entries()).to.have.length(0);
  });
});

describe('the actions', (): void => {
  it('offer a revolution outside the interim with none pending, then the choice once it is due', (): void => {
    const { game, player, playerGovernment, revolt } = setUp(1),
      canRevolt = (): boolean =>
        notInInterim(Interim, game.playerGovernments)(player) &&
        noRevolutionPending(
          KEY,
          game.playerGovernments,
          game.pendingEffects
        )(player),
      canChoose = (): boolean =>
        choiceDue(
          KEY,
          game.playerGovernments,
          game.pendingEffects,
          game.turn
        )(player);

    expect([canRevolt(), canChoose()]).to.deep.equal([true, false]);

    revolt();

    expect(notInInterim(Interim, game.playerGovernments)(player)).false;
    expect([canRevolt(), canChoose()]).to.deep.equal([false, false]);

    game.turn.increment();

    expect([canRevolt(), canChoose()]).to.deep.equal([false, true]);

    chooseGovernment(
      KEY,
      playerGovernment,
      Later,
      game.pendingEffects,
      game.turn
    );

    expect([canRevolt(), canChoose()]).to.deep.equal([true, false]);
  });

  it('refuse a second revolution with no interim until the choice is made', (): void => {
    const { game, player, revolt } = setUp(0);

    revolt();

    expect(notInInterim(Interim, game.playerGovernments)(player)).true;
    expect(
      noRevolutionPending(
        KEY,
        game.playerGovernments,
        game.pendingEffects
      )(player)
    ).false;
  });

  it('give the player their own Revolution and ChooseGovernment', (): void => {
    const { game, player, playerGovernment } = setUp(),
      [revolutionAction] = offerRevolution(game.playerGovernments)(player),
      [choice] = offerGovernmentChoice(game.playerGovernments)(player);

    expect(revolutionAction).to.be.instanceOf(Revolution);
    expect(choice).to.be.instanceOf(ChooseGovernment);
    expect(revolutionAction.player()).to.equal(player);
    expect(revolutionAction.value()).to.equal(playerGovernment);
    expect(choice.player()).to.equal(player);
    expect(choice.value()).to.equal(playerGovernment);
  });
});

describe('governedBy', (): void => {
  it('says whether the player has one of the governments, and no for a player without one', (): void => {
    const { game, player } = setUp(),
      stranger = new Player(game.rules);

    expect(governedBy(player, [Start], game.playerGovernments)).true;
    expect(governedBy(player, [Later, Start], game.playerGovernments)).true;
    expect(governedBy(player, [Later], game.playerGovernments)).false;
    expect(governedBy(player, [], game.playerGovernments)).false;
    expect(governedBy(stranger, [Start], game.playerGovernments)).false;
    expect(governedBy(stranger, [Start], new PlayerGovernmentRegistry())).false;
  });
});

describe('the duration helpers', (): void => {
  it('match one cause', (): void => {
    const { player } = setUp();

    expect(forCause('chosen')(player, 'chosen')).true;
    expect(forCause('chosen')(player, 'civil-disorder')).false;
    expect(forCause('civil-disorder')(player, 'civil-disorder')).true;
  });

  it('give each whole number from min to max', (): void => {
    expect(
      [0, 0.25, 0.5, 0.75, 0.999].map((value) =>
        randomDuration(1, 4, () => value)()
      )
    ).to.deep.equal([1, 2, 3, 4, 4]);
    expect(
      [0, 0.5, 0.999].map((value) => randomDuration(2, 8, () => value)())
    ).to.deep.equal([2, 5, 8]);
  });

  it('draw one number each time they are asked', (): void => {
    let calls = 0;

    const duration = randomDuration(1, 4, (): number => {
      calls++;

      return 0.5;
    });

    expect([duration(), duration()]).to.deep.equal([3, 3]);
    expect(calls).to.equal(2);
  });
});

describe('the change helpers', (): void => {
  it('emit player:government:changed with the player and the government', (): void => {
    const engine = new Engine(),
      { player } = setUp(),
      government = new Later(),
      seen: unknown[][] = [];

    engine.on('player:government:changed', (...args: unknown[]) =>
      seen.push(args)
    );

    emitGovernmentChanged(engine)(player, government);

    expect(seen).to.deep.equal([[player, government]]);
  });

  it('say a player has no world while none exists, and rethrow anything else', (): void => {
    const { player } = setUp(),
      throwing = (error: Error) =>
        ({
          getByPlayer: (): never => {
            throw error;
          },
        } as unknown as PlayerWorldRegistry);

    expect(hasPlayerWorld(new PlayerWorldRegistry())(player)).false;
    expect(
      hasPlayerWorld({
        getByPlayer: () => ({}),
      } as unknown as PlayerWorldRegistry)(player)
    ).true;
    expect(() =>
      hasPlayerWorld(throwing(new TypeError('something else')))(player)
    ).to.throw('something else');
    expect(() =>
      hasPlayerWorld(
        throwing(new Error('Wrong number of player worlds exist'))
      )(player)
    ).to.throw('Wrong number of player worlds exist');
  });

  it('clear the yield cache of every tile the player knows, for that player', (): void => {
    const { player } = setUp(),
      cleared: [string, Player][] = [],
      tile = (name: string) => ({
        tile: () => ({
          clearYieldCache: (forPlayer: Player): void => {
            cleared.push([name, forPlayer]);
          },
        }),
      }),
      playerWorldRegistry = {
        getByPlayer: () => ({ entries: () => [tile('a'), tile('b')] }),
      } as unknown as PlayerWorldRegistry;

    clearYieldCaches(playerWorldRegistry)(player);

    expect(cleared).to.deep.equal([
      ['a', player],
      ['b', player],
    ]);
  });
});

describe('availabilityRulesFor', (): void => {
  it('makes a rule with the entry’s id that allows its government while the player has the advances it requires', (): void => {
    const { game, player } = setUp(),
      research = new PlayerResearch(player, new AdvanceRegistry(), game.rules),
      [rule] = availabilityRulesFor(
        {
          id: 'test:later',
          relation: 'requires',
          subject: Later,
          targets: [Learning],
        } as any,
        game.playerResearch
      );

    game.playerResearch.register(research);

    expect(rule.id()).to.equal('test:later');
    expect(rule.validate(Later, player)).false;
    expect(rule.validate(Start, player)).false;

    research.addAdvance(Learning);

    expect(rule.validate(Later, player)).true;
    expect(rule.validate(Start, player)).false;
  });

  it('only checks the government for an entry with no targets, and makes nothing for other relations', (): void => {
    const { game } = setUp(),
      rules = availabilityRulesFor(
        {
          id: 'test:start',
          relation: 'requires',
          subject: Start,
          targets: [],
        } as any,
        game.playerResearch
      );

    expect(rules).to.have.length(1);
    expect(rules[0].validate(Start, undefined as any)).true;
    expect(rules[0].validate(Later, undefined as any)).false;
    expect(
      availabilityRulesFor(
        {
          id: 'test:x',
          relation: 'obsoletes',
          subject: Start,
          targets: [],
        } as any,
        game.playerResearch
      )
    ).to.deep.equal([]);
  });
});
