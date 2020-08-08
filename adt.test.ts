import { ADT, matchI, match } from "./ADT";

type UnderScoreAsTagAttempt<A> = ADT<{
  good: { value: A };
  _: { value: "NEVER" };
}>;

declare const underScoreAsTagAttempt: UnderScoreAsTagAttempt<string>;

// Does not fail since the original underscore was excluded.
matchI(underScoreAsTagAttempt)({
  good: (_) => _.value,
});

type PrettyPlease<A> = ADT<{
  idle: {};
  workingOnIt: {};
  success: { value: A };
  failure: { error: Error };
}>;

declare const promise: PrettyPlease<"Chocolate">;

// Testing match
match<typeof promise, string>({
  idle: (_) => "I'm lazy",
  workingOnIt: (_) => "Soon!",
  success: (_) => _.value,
  failure: (_) => `${_.error}`,
})(promise);

// @ts-expect-error
match<typeof promise, string>({
  workingOnIt: (_) => "Soon!",
  success: (_) => _.value,
})(promise);

match<typeof promise, string>({
  success: (_) => _.value,
  _: () => "Wait or come back later.",
})(promise);

// Testing matchI

matchI(promise)({
  idle: (_) => "I'm lazy",
  workingOnIt: (_) => "Soon!",
  success: (_) => _.value,
  failure: (_) => `${_.error}`,
});

matchI(promise)({
    idle: (_) => "I'm lazy",
    workingOnIt: (_) => "Soon!",
    success: (_) => _.value,
    failure: (_) => `${_.error}`,
    // Only known types are allowed.
    // @ts-expect-error
    stale: _ => "Old news"
  });

// @ts-expect-error
matchI(promise)({
  workingOnIt: (_) => "Soon!",
  success: (_) => _.value,
});

matchI(promise)({
  success: (_) => _.value,
  _: () => "Wait or come back later.",
});
