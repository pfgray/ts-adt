import { ADT, matchI, matchPI, match, matchP, refinement } from "../src/ADT";
import test from "ava";

type PrettyPlease<A> = ADT<{
  idle: {};
  workingOnIt: {};
  success: { value: A };
  failure: { error: string };
}>;

const idle: () => PrettyPlease<never> = () => ({ _type: "idle" });
const workingOnIt: () => PrettyPlease<never> = () => ({ _type: "workingOnIt" });
const success: <A>(a: A) => PrettyPlease<A> = (a) => ({
  _type: "success",
  value: a,
});
const failure: (error: string) => PrettyPlease<never> = (error) => ({
  _type: "failure",
  error,
});

/**
 * match
 */
test("match", (t) => {
  const matcher = match({
    idle: () => "I'm lazy",
    workingOnIt: () => "Soon!",
    success: () => "foo",
    failure: () => `error`,
  });

  t.is(matcher(idle()), "I'm lazy");
  t.is(matcher(workingOnIt()), "Soon!");
  t.is(matcher(success("foo")), "foo");
  t.is(matcher(failure("error")), "error");
});

test("matchP", (t) => {
  const matcher = matchP(
    {
      idle: () => "idle",
    },
    (a) => "not idle"
  );
  t.is(matcher(idle()), "idle");
  t.is(matcher(workingOnIt()), "not idle");
  t.is(matcher(success("foo")), "not idle");
  t.is(matcher(failure("error")), "not idle");
});

test("matchI", (t) => {
  const matchers = {
    idle: () => "I'm lazy",
    workingOnIt: () => "Soon!",
    success: () => "foo",
    failure: () => `error`,
  };
  t.is(matchI(idle())(matchers), "I'm lazy");
  t.is(matchI(workingOnIt())(matchers), "Soon!");
  t.is(matchI(success("foo"))(matchers), "foo");
  t.is(matchI(failure("error"))(matchers), "error");
});

test("matchPI", (t) => {
  const matchers = {
    idle: () => "I'm lazy",
    workingOnIt: () => "Soon!",
  };
  t.is(
    matchPI(idle())(matchers, () => "fallthrough"),
    "I'm lazy"
  );
  t.is(
    matchPI(workingOnIt())(matchers, () => "fallthrough"),
    "Soon!"
  );
  t.is(
    matchPI(success("foo"))(matchers, () => "fallthrough"),
    "fallthrough"
  );
  t.is(
    matchPI(failure("error"))(matchers, () => "fallthrough"),
    "fallthrough"
  );
});

test("refinement", (t) => {
  const isComplete = refinement('success', 'failure');

  t.is(isComplete(idle()), false);
  t.is(isComplete(workingOnIt()), false);
  t.is(isComplete(success("foo")), true);
  t.is(isComplete(failure("error")), true);
});