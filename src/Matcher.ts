const MATCH_SYMBOL = Symbol()

export type Matcher<A> = {
  $$sym: typeof MATCH_SYMBOL
  match: (a: A) => boolean
}

const makeMatcher = <A>(match: (a: A) => a is A): Matcher<A> => ({
  $$sym: MATCH_SYMBOL,
  match
})

export type TypeFromMatcher<M> =
  M extends Matcher<infer A> ? A
  : M extends {} ? { [K in keyof M]: TypeFromMatcher<M[K]> }
  : M

type foo = TypeFromMatcher<{
    tag: 'foo',
    value: Matcher<string>
}>

type Matchers = {
  any: Matcher<unknown>
  string: Matcher<string>
  number: Matcher<number>
  boolean: Matcher<boolean>
  function: Matcher<(...args: any[]) => any>
  arrayOf: <T>(m: Matcher<T>) => Matcher<Array<T>>
  array: Matcher<Array<any>>
}

function isArray(a: any): a is Array<any> {
  return Array.isArray(a);
}

function arrayOfMatcher<A>(a: Matcher<A>): Matcher<Array<A>> {
  return makeMatcher((as): as is Array<A> => {
    return isArray(as) && as.reduce((acc, curr) => acc && a.match(curr), true)
  })
}

export const __: Matchers = {
  any: makeMatcher((a): a is unknown => true),
  string: makeMatcher((s): s is string => typeof s === 'string'),
  number: makeMatcher((n): n is number => typeof n === 'number'),
  boolean: makeMatcher((b): b is boolean => typeof b === 'boolean'),
  function: makeMatcher((f): f is ((...a: any[]) => any)  => typeof f === 'function'), // todo: is this right? i don't think so
  arrayOf: arrayOfMatcher,
  array: makeMatcher(isArray)
}

