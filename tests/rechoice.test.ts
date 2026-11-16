import {
  RevolutionError,
  chooseGovernment,
  pendingRevolution,
  registerRevolutionHandler,
  revolution,
  turnsUntilChoice,
} from '../lib/revolution';
import {
  chosenThisTurn,
  mayRechoose,
  rechoiceKey,
  rechoiceOpen,
} from '../lib/rechoice';
import AnarchyDuration from '../Rules/AnarchyDuration';
import Availability from '@civ-clone/core-government/Rules/Availability';
import Criterion from '@civ-clone/core-rule/Criterion';
import Effect from '@civ-clone/core-rule/Effect';
import { Game } from '@civ-clone/core-game/Game';
import Government from '@civ-clone/core-government/Government';
import MayRechoose from '../Rules/MayRechoose';
import { PendingEffect } from '@civ-clone/core-pending-effect';
import Player from '@civ-clone/core-player/Player';
import { RevolutionCause } from '../Rules/AnarchyDuration';
import addPlayerGovernment from '../lib/playerGovernment';
import { expect } from 'chai';

class Interim extends Government {}
class Start extends Government {}
class Later extends Government {}

const KEY = 'test:revolution';

// A game whose revolutions last 2 turns, with `MayRechoose` rules answering `rechoose` (none when it's empty).
const setUp = (...rechoose: (() => boolean)[]) => {
  const game = new Game();

  game.availableGovernments.register(Interim, Start, Later);
  game.rules.register(
    new Availability(
      new Criterion(
        (GovernmentType: typeof Government): boolean =>
          GovernmentType === Start || GovernmentType === Later
      )
    ),
    new AnarchyDuration(new Effect((): number => 2)),
    ...rechoose.map(
      (answer: () => boolean): MayRechoose =>
        new MayRechoose(new Effect(answer))
    )
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
    revolt = (cause: RevolutionCause = 'chosen'): void =>
      revolution(
        KEY,
        Interim,
        playerGovernment,
        game.pendingEffects,
        game.rules,
        game.turn,
        cause
      ),
    choose = (
      GovernmentType: typeof Government,
      withRules: boolean = true
    ): void =>
      chooseGovernment(
        KEY,
        playerGovernment,
        GovernmentType,
        game.pendingEffects,
        game.turn,
        withRules ? game.rules : undefined
      ),
    left = (): number | null =>
      turnsUntilChoice(KEY, playerGovernment, game.pendingEffects, game.turn),
    // A revolution, its two turns of the interim, and the choice of `GovernmentType`.
    revolutionTo = (
      GovernmentType: typeof Government,
      withRules: boolean = true
    ): void => {
      revolt();
      game.turn.increment();
      game.turn.increment();
      choose(GovernmentType, withRules);
    },
    records = (): PendingEffect[] =>
      game.pendingEffects.getByHandler(rechoiceKey(KEY));

  return {
    game,
    player,
    playerGovernment,
    revolt,
    choose,
    left,
    revolutionTo,
    records,
  };
};

describe('choosing again in the same turn', (): void => {
  it('is a revolution like any other with no `MayRechoose` rule, and records nothing', (): void => {
    const { playerGovernment, revolt, left, revolutionTo, records } = setUp();

    revolutionTo(Later);

    expect(playerGovernment.is(Later)).true;
    expect(records()).to.deep.equal([]);

    revolt();

    expect(playerGovernment.is(Interim)).true;
    expect(left()).to.equal(2);
  });

  it('is a revolution like any other when every `MayRechoose` rule says no', (): void => {
    const { playerGovernment, revolt, left, revolutionTo, records } = setUp(
      () => false
    );

    revolutionTo(Later);
    revolt();

    expect(records()).to.deep.equal([]);
    expect(playerGovernment.is(Interim)).true;
    expect(left()).to.equal(2);
  });

  it('takes no interim in the turn a government was chosen, and keeps the government until the next choice', (): void => {
    const { game, playerGovernment, revolt, choose, left, revolutionTo } =
      setUp(
        () => false,
        () => true
      );

    revolutionTo(Later);

    expect(
      chosenThisTurn(KEY, playerGovernment, game.pendingEffects, game.turn)
    ).true;

    revolt();

    expect(playerGovernment.is(Later)).true;
    expect(left()).to.equal(0);
    expect(
      pendingRevolution(KEY, playerGovernment, game.pendingEffects)?.data()
    ).to.deep.equal({ endTurn: String(game.turn.value()) });

    // A revolution is under way, so a second one is still refused.
    expect(() => revolt()).to.throw(
      RevolutionError,
      'A revolution is already under way.'
    );

    choose(Start);

    expect(playerGovernment.is(Start)).true;
    expect(left()).null;

    // And again, as often as the player likes in that turn.
    revolt();

    expect(left()).to.equal(0);
    expect(playerGovernment.is(Start)).true;
  });

  it('keeps one record per government, for the latest choice', (): void => {
    const { game, playerGovernment, revolt, choose, revolutionTo, records } =
      setUp(() => true);

    revolutionTo(Later);
    revolt();
    choose(Start);

    expect(records()).length(1);
    expect(records()[0].target()).to.equal(playerGovernment);
    expect(records()[0].data()).to.deep.equal({
      turn: String(game.turn.value()),
    });
  });

  it('is a revolution like any other on a later turn', (): void => {
    const { game, playerGovernment, revolt, left, revolutionTo } = setUp(
      () => true
    );

    revolutionTo(Later);
    game.turn.increment();

    expect(
      chosenThisTurn(KEY, playerGovernment, game.pendingEffects, game.turn)
    ).false;

    revolt();

    expect(playerGovernment.is(Interim)).true;
    expect(left()).to.equal(2);
  });

  it('is not open to a government brought down by disorder', (): void => {
    const { playerGovernment, revolt, left, revolutionTo } = setUp(() => true);

    revolutionTo(Later);
    revolt('civil-disorder');

    expect(playerGovernment.is(Interim)).true;
    expect(left()).to.equal(2);
  });

  it('asks the rules again when the revolution starts', (): void => {
    let allowed = true;

    const { playerGovernment, revolt, left, revolutionTo } = setUp(
      () => allowed
    );

    revolutionTo(Later);
    allowed = false;
    revolt();

    expect(playerGovernment.is(Interim)).true;
    expect(left()).to.equal(2);
  });

  it('records nothing when `chooseGovernment` is not given the rules', (): void => {
    const { playerGovernment, revolt, left, revolutionTo, records } = setUp(
      () => true
    );

    revolutionTo(Later, false);

    expect(records()).to.deep.equal([]);

    revolt();

    expect(playerGovernment.is(Interim)).true;
    expect(left()).to.equal(2);
  });

  it('asks `MayRechoose` about the player', (): void => {
    const asked: Player[] = [],
      { game, player, playerGovernment, revolutionTo } = setUp();

    game.rules.register(
      new MayRechoose(
        new Effect((asker: Player): boolean => {
          asked.push(asker);

          return true;
        })
      )
    );

    expect(mayRechoose(player, game.rules)).true;

    revolutionTo(Later);

    expect(
      rechoiceOpen(
        KEY,
        playerGovernment,
        game.pendingEffects,
        game.rules,
        game.turn
      )
    ).true;
    expect(asked.every((asker: Player): boolean => asker === player)).true;
    expect(asked.length).to.be.greaterThan(1);
  });
});
