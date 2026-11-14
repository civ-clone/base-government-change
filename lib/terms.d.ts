import { Terms } from '../Rules/RevolutionTerms';
import Government from '@civ-clone/core-government/Government';
import { RuleRegistry } from '@civ-clone/core-rule/RuleRegistry';
/** A `RevolutionTerms` effect: revolutions under the handler `key`, with `Interim` as the government in between. */
export declare const terms: (
  key: string,
  Interim: typeof Government
) => () => Terms;
/** The loaded ruleset's revolution (the first `RevolutionTerms` answer), or `null` when no rule gives one. */
export declare const revolutionTerms: (
  ruleRegistry: RuleRegistry
) => Terms | null;
