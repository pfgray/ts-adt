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
  [K in keyof T]: K extends "_" ? never : { _type: K } & T[K];
}[keyof T];

type MatchObj<ADT extends { _type: string }, Z> = {
  [K in ADT["_type"]]: (v: ADTMember<ADT, K>) => Z;
};

type PartialMatchObj<ADT extends { _type: string }, Z> = Partial<
  MatchObj<ADT, Z>
> & { _: (v: ADT) => Z };

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
export function match<ADT extends { _type: string }, Z>(
  matchObj: MatchObj<ADT, Z>
): (v: ADT) => Z {
  return (v) =>
    (matchObj as any)[v._type] != null
      ? (matchObj as any)[v._type](v)
      : (matchObj as any)["_"](v);
}

/**
 * Partial pattern matching for a sum type defined with ADT
 *
 * ```ts
 * declare const foo: Option<string>
 *
 * pipe(
 *   foo,
 *   match({
 *     some: ({value}) => 'some'
 *     _: (_option) => 'none',
 *   })
 * )
 * ```
 */
export function matchP<ADT extends { _type: string }, Z>(
  matchObj: MatchObj<ADT, Z> | PartialMatchObj<ADT, Z>
): (v: ADT) => Z {
  return (v) =>
    (matchObj as any)[v._type] != null
      ? (matchObj as any)[v._type](v)
      : (matchObj as any)["_"](v);
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
export function matchI<ADT extends { _type: string }>(
  v: ADT
): <Z>(matchObj: MatchObj<ADT, Z>) => Z {
  return (matchObj) => (matchObj as any)[v._type](v);
}

/**
 * Item-first version of matchP, useful for better inference in some circumstances
 *
 * ```ts
 * declare const foo: Option<string>
 *
 * matchP(foo)({
 *   some: ({value}) => 'some'
 *   _: (_option) => 'none',
 * })
 * ```
 */
export function matchPI<ADT extends { _type: string }>(
  v: ADT
): <Z>(matchObj: MatchObj<ADT, Z> | PartialMatchObj<ADT, Z>) => Z {
  return (matchObj) =>
    (matchObj as any)[v._type] != null
      ? (matchObj as any)[v._type](v)
      : (matchObj as any)["_"](v);
}
