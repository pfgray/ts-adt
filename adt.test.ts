import { ADT, matchI, matchPI, match, matchP } from "./ADT";

type UnderScoreAsTagAttempt<A> = ADT<{
  good: { value: A };
  _: { value: "NEVER!" };
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

/**
 * match
 */
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

// match should not allow partial matching
match<typeof promise, string>({
  success: (_) => _.value,
  // @ts-expect-error
  _: () => "Wait or come back later.",
})(promise);

/**
 * matchP
 */

// matchP allows partial matching
matchP<typeof promise, string>({
  success: (_) => _.value,
  _: () => "Wait or come back later.",
})(promise);

/**
 * matchI
 */
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
  stale: (_) => "Old news",
});

// matchI can't match a subset but must match all cases
// @ts-expect-error
matchI(promise)({
  workingOnIt: (_) => "Soon!",
  success: (_) => _.value,
});

// matchI must match against all possible cases
matchI(promise)({
  idle: () => "Start baking!",
  workingOnIt: (_) => "... Tempering",
  success: (_) => _.value,
  failure: (_) => "Oops!",
});

// matchI must not support partial matching
matchI(promise)({
  success: (_) => _.value,
  // @ts-expect-error
  _: (value) => "Wait or come back later.",
});

/**
 * matchPI
 */
matchPI(promise)({
  success: (_) => _.value,
  _: (value) => "Wait or come back later.",
});

// matchPI can't match against unknown cases
matchPI(promise)({
  success: (_) => _.value,
  // @ts-expect-error
  stale: (_) => "Old news",
  _: (value) => "Wait or come back later.",
});

// matchPI should allow matching against all cases
matchPI(promise)({
  idle: () => "Start baking!",
  workingOnIt: (_) => "... Tempering",
  success: (_) => _.value,
  failure: (_) => "Oops!",
});