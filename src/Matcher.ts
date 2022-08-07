import { UnionToIntersection } from "./types/helpers"
import { TuplifyUnion } from "./types/UnionToIntersection"

const MATCH_SYMBOL = Symbol()

/**
 * A predicate which matches values of "A"
 * 
 * The "_Out" phantom type parameter indicates
 * what type the value should be narrowed to. 
 */
export type Matcher<A, _Out extends A> = {
  [MATCH_SYMBOL]: true
  match: (a: A) => a is _Out
}

export const makeMatcher = <A, Out extends A>(match: (a: A) => a is Out): Matcher<A, Out> => ({
  [MATCH_SYMBOL]: true,
  match
})

export const isMatcher = (matcher: any): matcher is Matcher<unknown, unknown> => {
  return matcher[MATCH_SYMBOL] === true;
}

// TODO: can we make a tail-recursive version of this?
export type TypeFromMatcher<M> =
  M extends Matcher<never, infer Out> ? Out
  : M extends Record<string, unknown> ? { [K in keyof M]: TypeFromMatcher<M[K]> }
  : M extends unknown[] ? { [K in keyof M]: TypeFromMatcher<M[K]> }
  : never

export type TypeFromMatcherTailRec<M> = TypeFromMatcherTailRecInner<M, unknown>
export type TypeFromMatcherTailRecInner<M, MappedType> = {}

// {
//   foo: {
//     bar: number
//   }
//   baz: {
//     biff: string
//   }
// }
// export type TypeFromMatcherObj<M, Obj> =
//   TuplifyUnion<keyof M> extends [infer H, ...infer T] ? TypeFromMatcherObj<Obj[H], Obj & Record<H, >> : Obj

type Foo = [
  ['a', ['a', ['b', number]]]
]


// type TypeFromMatcherObj<M, ObjInTupForm, Rest> =
//   TuplifyUnion<keyof M> extends [infer H, ...infer Rest] ? H extends keyof M ? TypeFromMatcherObj<[H, M[H]], Rest> : Obj : never





// type TypeFromMatcher<M, Obj> =


type KeysInTuple<T> = TuplifyUnion<keyof T>
// type TypeFromMatcherTailRecObj<Keys, >

type A = KeysInTuple<{foo: number, bar: string}>

type FirstFromArray<T> = T extends [infer A, ...infer Rest] ? A : never

type Wut = FirstFromArray<{foo: string}>

// type KeySize<T>
// type KeySizeRec<T, Count> = T extends Record<string, unknown> ? {
//   [K in T]: 
// } : 1

type Matchers = {
  any: Matcher<unknown, unknown>
  string: Matcher<string, string>
  number: Matcher<number, number>
  boolean: Matcher<boolean, boolean>
  function: Matcher<(...args: any[]) => any, (...args: any[]) => any>
  arrayOf: <A, AA extends A>(m: Matcher<A, AA>) => Matcher<Array<AA>, Array<AA>>
  array: Matcher<Array<any>, Array<any>>
}

function isArray(a: unknown): a is Array<unknown> {
  return Array.isArray(a);
}

function arrayOfMatcher<A, AA extends A>(a: Matcher<A, AA>): Matcher<Array<AA>, Array<AA>> {
  return makeMatcher((as): as is Array<AA> => {
    return isArray(as) && as.reduce((acc, curr) => acc && a.match(curr as unknown as A), true)
  })
}

export const __: Matchers = {
  any: makeMatcher((a): a is unknown => true),
  string: makeMatcher((s): s is string => typeof s === 'string'),
  number: makeMatcher((n): n is number => typeof n === 'number'),
  boolean: makeMatcher((b): b is boolean => typeof b === 'boolean'),
  function: makeMatcher((f): f is ((...a: any[]) => any)  => typeof f === 'function'), // todo: is this right?
  arrayOf: arrayOfMatcher,
  array: makeMatcher(isArray)
}

function inOperator<K extends string, T extends object>(k: K, o: T): o is T & Record<K, unknown> {
  return k in o;
}

export const matchValue = (matcher: unknown, value: unknown): boolean => {
  if(isMatcher(matcher) && matcher.match(value)){
    return true
  } else if (typeof matcher === 'function' && matcher(value)) {
    return true
  // is not a matcher, so we're matching on value:
  } else if(matcher === value) {
      return true;
  } else if (matcher === null) {
    // special case null here, since null is an 'object'
    return false
  } else if (typeof matcher === 'object' && typeof value === 'object' && value !== null) {
    // let's traverse each attribute
    return Object.entries(matcher).reduce((acc, [key, val]) => {
      return acc && key in matcher && inOperator(key, value) && matchValue(val, value[key])
    }, true)
  } else {
    return false;
  }
}

