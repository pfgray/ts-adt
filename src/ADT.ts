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

/**
 * A sum-type generator. Uses the keys of the passed type as string discriminators
 *
 * @template {string} D - The discriminant field
 * @template {Record<string, {}>} T - The ADT shorthand description
 *
 * ```ts
 * type Option<T> = MakeADT<"_tag", {
 *   none: {},
 *   some: {value: T}
 * }>
 *
 * type These<A, B> = MakeADT<"type", {
 *   left: {left: A},
 *   right: {right: B},
 *   both: {left: A, right: B}
 * }>
 * ```
 */
export type MakeADT<D extends string, T extends Record<string, {}>> = {
  [K in keyof T]: Record<D, K> & T[K];
}[keyof T];

type MatchObj<ADT extends { _type: string }, Z> = {
  [K in ADT["_type"]]: (v: ADTMember<ADT, K>) => Z;
};

/**
 * Omit helper for TS < 3.5
 */
type Omit<T, K> = Pick<T, Exclude<keyof T, K>>;

/**
 * Unions all the return types of matcher functions
 */
type Returns<
  ADT extends { _type: string },
  M extends MatchObj<ADT, unknown>
> = {
  [K in keyof M]: ReturnType<M[K]>;
}[keyof M];

/**
 * Helper type for omitting the '_type' field from values
 */
export type ADTMember<ADT, Type extends string> = Omit<
  Extract<ADT, { _type: Type }>,
  "_type"
>;

/**
 * Pattern matching for a sum type defined with ADT
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
export function match<
  ADT extends { _type: string },
  M extends MatchObj<ADT, unknown>
>(matchObj: M): (v: ADT) => Returns<ADT, M> {
  return (v) => (matchObj as any)[v._type](v);
}

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
export function matchP<
  ADT extends { _type: string },
  M extends Partial<MatchObj<ADT, unknown>>,
  F extends (rest: Exclude<ADT, { _type: keyof M }>) => unknown
>(
  matchObj: M,
  otherwise: F
): (v: ADT) => PartialReturns<ADT, M> | ReturnType<F> {
  return (v) =>
    (matchObj as any)[v._type] != null
      ? (matchObj as any)[v._type](v)
      : (otherwise as any)(v);
}

type UndefineableReturn<
  T extends undefined | ((...args: any) => any)
> = T extends (...args: any) => any ? ReturnType<T> : never;

/**
 * Unions all the return types of matcher functions
 */
type PartialReturns<
  ADT extends { _type: string },
  M extends MatchObj<ADT, unknown> | Partial<MatchObj<ADT, unknown>>
> = {
  [K in keyof M]: UndefineableReturn<M[K]>;
}[keyof M];

/**
 * Item-first version of match, useful for better inference in some circumstances
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
export function matchI<ADT extends { _type: string }>(
  v: ADT
): <M extends MatchObj<ADT, unknown>>(matchObj: M) => Returns<ADT, M> {
  return (matchObj) => (matchObj as any)[v._type](v);
}

/**
 * Item-first version of matchP, useful for better inference in some circumstances
 *
 * ```ts
 * declare const foo: Option<string>
 *
 * matchPI(foo)({
 *   some: ({value}) => 'some'
 * }, (_option) => 'none')
 * ```
 */
export function matchPI<ADT extends { _type: string }>(
  v: ADT
): <
  M extends MatchObj<ADT, unknown> | Partial<MatchObj<ADT, unknown>>,
  F extends (rest: Exclude<ADT, { _type: keyof M }>) => unknown
>(
  matchObj: M,
  otherwise: F
) => PartialReturns<ADT, M> | ReturnType<F> {
  return (matchObj, otherwise) =>
    (matchObj as any)[v._type] != null
      ? (matchObj as any)[v._type](v)
      : (otherwise as any)(v);
}
