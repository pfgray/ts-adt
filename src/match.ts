
import {MakeADTMember} from './MakeADT'
import { isMatcher, Matcher, matchValue, TypeFromMatcher, __ } from './Matcher'
import { ADT } from './ADT'

// todo: maybe implement DeepExclude ourselves?
import { DeepExclude } from './types/DeepExclude'
import { CompileError } from './types/CompileError'
import { TuplifyUnion } from './types/UnionToIntersection'
import { InvertPattern } from './types/InvertPattern'

type Foo = InvertPattern<{foo: string}>

type JoinStrUnion<StrTypes extends string> = JoinStrUnionInner<TuplifyUnion<StrTypes>>

type JoinStrUnionInner<T> = T extends string[] ? JoinStrTypes<T, ''> : never

type JoinStrTypes<StrTypes extends string[], Result extends string> =
  StrTypes extends [infer H, ...infer T] ? 
    T extends string[] ?
      H extends string ?
        T extends [] ?
          JoinStrTypes<T, `${Result}${H}`>
          : JoinStrTypes<T, `${H}, ${Result}`>
    : never : never
  : StrTypes extends [infer H] ? H
  : StrTypes extends [] ? Result
  : never

// type RecursiveExclude<T, U> = T extends {} ? U extends {} ?
//   { [KT in keyof T]: 
//     // { [KU in keyof U]: KT extends KU ? RecursiveExclude<T[KT], U[KU]> : never }
//     // RecursiveExclude<T[KT], U[KT]>
//     Exclude<T[KT], U[KT]>
//   } : Exclude<T, U> : Exclude<T, U>


type FooS = DeepExclude<{foo: string}, {foo: never}>

type MatchZ<D extends string, ADT extends Record<D, string>, Z> = {
    [K in ADT[D]]: <ZZ, M>(
      matcher: M,
      f: (p: MakeADTMember<D, ADT, K> & TypeFromMatcher<M>) => ZZ
    ) => MatchZ<
      D,
      // @ts-ignore
      DeepExclude<ADT, MakeADTMember<D, ADT, K> & TypeFromMatcher<M>>,
      Z | ZZ
    >
} & {
    // the arrays wrapping ADT and never are necessary: https://github.com/microsoft/TypeScript/issues/23182
    // @ts-ignore
    exhaustive: [ADT] extends [never] ? (() => Z) : CompileError<`You have not exhausted all possibilities, cases not accounted are: ${JoinStrUnion<ADT[D]>}`>
    partial: () => Z | undefined
    __remaining: ADT
}

export const makeMatchZ = 
  <D extends string>(d: D) =>
  <ADT extends Record<D, string>>(obj: ADT): MatchZ<D, ADT, never> => {
    const makeMatchInner = <ADT2 extends Record<D, string>, Z>(fin: Z | undefined, found: boolean): MatchZ<D, ADT2, Z> => {
      return new Proxy({}, {
        // @ts-ignore
        get: function(target, prop) {
          if(prop === 'partial' || prop === 'exhaustive') {
            return () => fin;
          } else {
            return function(matcher: unknown, f: (o: unknown) => unknown) {
              if (found) {
                return makeMatchInner(fin, true);
              } else if(obj[d] === prop && matchValue(matcher, obj)) {
                return makeMatchInner(f(obj), true);
              } else {
                return makeMatchInner(fin, false);
              }
            }
          }
        }
      }) as MatchZ<D, ADT2, Z>
    }
    return makeMatchInner<ADT, never>(undefined, false);
}
