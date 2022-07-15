
import {MakeADTMember} from './MakeADT'
import { Matcher, TypeFromMatcher, __ } from './Matcher'
import { ADT } from './ADT'

// todo: maybe implement DeepExclude ourselves?
import { DeepExclude } from './types/DeepExclude'
import { CompileError } from './types/CompileError'

// type RecursiveExclude<T, U> = T extends {} ? U extends {} ?
//   { [KT in keyof T]: 
//     // { [KU in keyof U]: KT extends KU ? RecursiveExclude<T[KT], U[KU]> : never }
//     // RecursiveExclude<T[KT], U[KT]>
//     Exclude<T[KT], U[KT]>
//   } : Exclude<T, U> : Exclude<T, U>

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
    exhaustive: [ADT] extends [never] ? (() => Z) : CompileError<'You have not exhausted all possibilities'>
    partial: () => Z | undefined
    __remaining: ADT
}

export const makeMatchZ = 
  <D extends string>(d: D) =>
  <ADT extends Record<D, string>>(obj: ADT): MatchZ<D, ADT, never> => {
    const makeMatchInner = <ADT2 extends Record<D, string>, Z>(fin: Z | undefined, found: boolean): MatchZ<D, ADT2, Z> => {
      return new Proxy({}, {
        get: function(target, prop) {
          if(prop === 'partial' || prop === 'exhaustive') {
            return () => fin;
          } else {
            return function(matcher: Matcher<any>, f: any) {
              if (found) {
                return makeMatchInner(fin, true);
              } else if(obj[d] === prop && matcher.match(obj)) {
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



const matchZ = makeMatchZ('_type')

type Option<A> = ADT<{
  some: { value: A },
  none: {}
}>

const myOption: Option<number | string> = {
  _type: 'some',
  value: 16
} as Option<number | string>

// type aaa = Exclude<number | string, string> // number
// type bbb = DeepExclude<{value: number | string, foo: number}, {value: string}>
// type bb = DeepExclude<{value: string, foo: number}, {value: string}>
// type ccc = DeepExclude<{value: number | string, foo: number }, {value: string, foo: number}>

console.log(
  `Matched: ${JSON.stringify(myOption)} to: ` + 
    matchZ(myOption)
      .some(__.any, (a) => `some: ${a.value}`)
      .none(__.any, () => 'none')
      .exhaustive()
)

// type Xor<A, B> = ADT<{
//     nothing: {};
//     left: { value: A };
//     right: { value: B };
// }>;

// declare const myXor: Xor<number | string, string>;

// declare const string: Matcher<string>
// declare const number: Matcher<number>
// declare const any: Matcher<any>

// type Wut = never extends never ? "yes" : "no"

// const wut = matchZ(myXor)
//   .left({value: __.string}, hmm => parseInt(hmm.value))
//   .left({value: __.number}, a => a.value)
//   .right(__.any, hmm => 5)
//   .nothing(__.any, () => 5)
//   .exhaustive()
  // .wut
  // .__remaining
  // .exhaustive()
  // .exhaustive()



  // .nothing({}, () => 5)
  
  // .exhaustive()
  // .left({ value: string }, hmm => true)
  // .nothing(any, () => 4)
  // 





