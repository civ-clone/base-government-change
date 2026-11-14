import Government from '@civ-clone/core-government/Government';
import Rule from '@civ-clone/core-rule/Rule';

/** A ruleset's revolution: the handler `key` its revolutions are saved under, and its `Interim` government. */
export interface Terms {
  key: string;
  Interim: typeof Government;
}

/**
 * Which revolution the loaded ruleset plays: the `key` and `Interim` it passes to `lib/revolution`. A ruleset registers
 * one, so code that isn't part of the ruleset (a computer player, say) can start and finish its revolutions through
 * `lib/revolution` as the ruleset does. `lib/terms`' `revolutionTerms` reads it.
 */
export class RevolutionTerms extends Rule<[], Terms> {}

export default RevolutionTerms;
