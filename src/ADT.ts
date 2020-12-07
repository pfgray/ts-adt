import { MakeADT, makeMatchers } from "./MakeADT";

/**
 * A sum-type generator. Uses the keys of the passed type as string discriminators
 *
 *
 * ```ts
 * type Option<T> = ADT<{
 *   none: {},
 *   some: {value: T}
 * }>
 *
 * type These<A, B> = ADT<{
 *   left: {left: A},
 *   right: {right: B},
 *   both: {left: A, right: B}
 * }>
 * ```
 */
export type ADT<T extends Record<string, {}>> = MakeADT<"_type", T>;

export const [
  /**
   * Pattern matching for a sum type defined with ADT, with
   * discriminant field "_type"
   *
   * ```ts
   * declare const foo: Option<string>
   *
   * pipe(
   *   foo,
   *   match({
   *     none: () => 'none',
   *     some: ({value}) => 'some'
   *   })
   * )
   * ```
   */
  match,
  /**
   * Partial pattern matching for a sum type defined with ADT
   *
   * ```ts
   * declare const foo: Option<string>
   *
   * pipe(
   *   foo,
   *   matchP({
   *     some: ({value}) => 'some'
   *   }, (_option) => 'none')
   * )
   * ```
   */
  matchP,
  /**
   * Inverted version of match, useful for better inference in some circumstances
   *
   * ```ts
   * declare const foo: Option<string>
   *
   * matchI(foo)({
   *   none: () => 'none',
   *   some: ({value}) => 'some'
   * })
   * ```
   */
  matchI,
  /**
   * Inverted version of matchP, useful for better inference in some circumstances
   *
   * ```ts
   * declare const foo: Option<string>
   *
   * matchPI(foo)({
   *   some: ({value}) => 'some'
   * }, (_option) => 'none')
   * ```
   */
  matchPI,
] = makeMatchers("_type");
