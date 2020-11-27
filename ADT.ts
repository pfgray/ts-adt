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
export type ADT<T extends Record<string, {}>> = {
  [K in keyof T]: { _tag: K } & T[K];
}[keyof T];

// Omit type, for TS < 3.5
type Omit<T, K> = Pick<T, Exclude<keyof T, K>>;

/**
 * Helper type for omitting the '_tag' field from values
 */
export type ADTMember<ADT, Type extends string> = Omit<
  Extract<ADT, { _tag: Type }>,
  "_tag"
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
export function match<ADT extends { _tag: string }, Z>(
  matchObj: { [K in ADT["_tag"]]: (v: ADTMember<ADT, K>) => Z }
): (v: ADT) => Z {
  return (v) => (matchObj as any)[v._tag](v);
}

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
export function matchI<ADT extends { _tag: string }>(
  v: ADT
): <Z>(matchObj: { [K in ADT["_tag"]]: (v: ADTMember<ADT, K>) => Z }) => Z {
  return (matchObj) => (matchObj as any)[v._tag](v);
}
