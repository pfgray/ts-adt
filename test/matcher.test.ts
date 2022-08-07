import { ADT } from "../src/ADT";
import { makeMatchZ } from "../src/match";

import test from "ava";

type PrettyPlease<A> = ADT<{
  idle: {};
  workingOnIt: {};
  success: { value: A };
  failure: { error: string };
}>;

type User = {
  name: string
  age: number,
  address: 'aaaa'
  friends: Array<string>
}

const myPlease: PrettyPlease<User> = {
  _type: 'success',
  value: {
    name: 'Bob',
    age: 40,
    address: 'aaaa',
    friends: ['Bob', 'Alice', 'Gina']
  }
} as PrettyPlease<User>

test("aaa", (t) => {
  console.log(
    makeMatchZ('_type')(myPlease)
      .success({ value: { friends: ['Bob', 'Alice']}}, () => false)
      .success({ value: { friends: ['Bob', 'Sue']}}, () => true)
      // .success({ value: { address: {zip: '091234' }}}, () => 34)
      .partial()
  )
  t.deepEqual(5, 5)
});