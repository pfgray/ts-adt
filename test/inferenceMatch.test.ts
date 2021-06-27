import { pipe } from "fp-ts/lib/function";
import { ADT, match, matchP, matchI, matchPI, refinement } from "../src/ADT";
import { expectType } from "tsd";
import test from "ava";

type These<A, B> = ADT<{
  this: { this: A };
  that: { that: B };
  both: { this: A; that: B };
}>;

const that = <B>(b: B): These<never, B> => ({ _type: "that", that: b });

const these: These<string, number> = that(42);

test("inference [match]", (t) => {
  const result = pipe(
    these,
    match({
      both: () => "both" as const,
      that: () => 5,
      this: () => "this" as const,
    })
  );
  expectType<number | "this" | "both">(result);
  t.assert(result === 5);
});

test("inference [matchP]", (t) => {
  const result = pipe(
    these,
    matchP(
      {
        both: () => "both" as const,
        that: () => 5,
      },
      (a) => a.this
    )
  );
  expectType<string | number>(result);
  t.is(result, 5);

  const result2 = pipe(
    these,
    matchP(
      {
        both: () => "both" as const,
      },
      (a) => {
        expectType<
          { _type: "this"; this: string } | { _type: "that"; that: number }
        >(a);
        return a._type;
      }
    )
  );
  expectType<"this" | "that" | "both">(result2);
  t.is(result2, "that");
});

test("inference [matchI]", (t) => {
  const result = matchI(these)({
    both: () => "both" as const,
    that: () => 5,
    this: () => "this" as const,
  });

  expectType<number | "this" | "both">(result);

  t.is(result, 5);
});

test("inference [matchPI]", (t) => {
  const result = matchPI(these)(
    {
      both: () => "both" as const,
      that: () => 5,
    },
    () => "this" as const
  );
  expectType<number | "this" | "both">(result);
  t.is(result, 5);
});

test("inference [refinement]", (t) => {
  const hasThat = refinement('that', 'both');
  
  if (hasThat(these)) {
    expectType<"that" | "both">(these._type);
  } else {
    expectType<"this">(these._type);
  }
  
  t.assert(hasThat(these));
});
