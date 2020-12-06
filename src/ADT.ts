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

type MakeMatchObj<D extends string, ADT extends Record<D, string>, Z> = {
  [K in ADT[D]]: (v: MakeADTMember<D, ADT, K>) => Z;
};

type MatchObj<ADT extends { _type: string }, Z> = MakeMatchObj<"_type", ADT, Z>;

/**
 * Unions all the return types of matcher functions
 */
type Returns<
  ADT extends { _type: string },
  M extends MatchObj<ADT, unknown>
> = MakeReturns<"_type", ADT, M>;

type MakeReturns<
  D extends string,
  ADT extends Record<D, string>,
  M extends MakeMatchObj<D, ADT, unknown>
> = {
  [K in keyof M]: ReturnType<M[K]>;
}[keyof M];

/**
 * Helper type for extracting a member from an ADT
 */
export type ADTMember<ADT, Type extends string> = MakeADTMember<
  "_type",
  ADT,
  Type
>;
export type MakeADTMember<D extends string, ADT, Type extends string> = Extract<
  ADT,
  Record<D, Type>
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
export const match = makeMatch("_type");

export function makeMatch<D extends string>(
  d: D
): <ADT extends Record<D, string>, M extends MakeMatchObj<D, ADT, unknown>>(
  matchObj: M
) => (v: ADT) => MakeReturns<D, ADT, M> {
  return (matchObj) => (v) => matchObj[v[d]](v as any) as any;
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
export const matchP = makeMatchP("_type");

export function makeMatchP<D extends string>(
  d: D
): <
  ADT extends Record<D, string>,
  M extends Partial<MakeMatchObj<D, ADT, unknown>>,
  F extends (rest: Exclude<ADT, Record<D, keyof M>>) => unknown
>(
  matchObj: M,
  otherwise: F
) => (v: ADT) => MakePartialReturns<D, ADT, M> | ReturnType<F> {
  return (matchObj, otherwise) => (v) =>
    matchObj[v[d]] != null ? (matchObj[v[d]] as any)(v) : (otherwise as any)(v);
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
> = MakePartialReturns<"_type", ADT, M>;

type MakePartialReturns<
  D extends string,
  ADT extends Record<D, string>,
  M extends
    | MakeMatchObj<D, ADT, unknown>
    | Partial<MakeMatchObj<D, ADT, unknown>>
> = {
  [K in keyof M]: UndefineableReturn<M[K]>;
}[keyof M];

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
export const matchI = makeMatchI("_type");

export function makeMatchI<D extends string>(
  d: D
): <ADT extends Record<D, string>>(
  v: ADT
) => <M extends MakeMatchObj<D, ADT, unknown>>(
  matchObj: M
) => MakeReturns<D, ADT, M> {
  return (v) => (matchObj) => matchObj[v[d]](v as any) as any;
}

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
export const matchPI = makeMatchPI("_type");

export function makeMatchPI<D extends string>(
  d: D
): <ADT extends Record<D, string>>(
  v: ADT
) => <
  M extends
    | MakeMatchObj<D, ADT, unknown>
    | Partial<MakeMatchObj<D, ADT, unknown>>,
  F extends (rest: Exclude<ADT, { _type: keyof M }>) => unknown
>(
  matchObj: M,
  otherwise: F
) => MakePartialReturns<D, ADT, M> | ReturnType<F> {
  return (v) => (matchObj, otherwise) =>
    matchObj[v[d]] != null
      ? ((matchObj[v[d]] as any)(v) as any)
      : (otherwise as any)(v);
}
