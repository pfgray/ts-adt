import { pipe } from "fp-ts/lib/function";
import { expectNotAssignable, expectNotType, expectType } from "tsd";
import test from "ava";
import { MakeADT, makeMatchers } from "../src/MakeADT";

type These<A, B> =
  | MakeADT<
      "_tag",
      {
        this: { this: A };
        that: { that: B };
        both: { this: A; that: B };
      }
    >
  | { _tag: "x" | "y"; xy: boolean };

const thiss = <A>(a: A): These<A, never> => ({ _tag: "this", this: a });
const that = <B>(b: B): These<never, B> => ({ _tag: "that", that: b });
const both = <A, B>(a: A, b: B): These<A, B> => ({
  _tag: "both",
  this: a,
  that: b,
});

const these: These<string, number> = that(42);

const [match, matchP, matchI, matchPI] = makeMatchers("_tag");

test("inference [makeMatch]", (t) => {
  const result = pipe(
    these,
    match({
      both: () => "both" as const,
      that: () => 5,
      this: () => "this" as const,
      x: () => "x" as const,
      y: (y) => y.xy,
    })
  );
  expectType<number | "this" | "both" | "x" | boolean>(result);
  t.assert(result === 5);
});

test("inference [makeMatchP]", (t) => {
  const result = pipe(
    these,
    matchP(
      {
        both: () => "both" as const,
        that: () => 5,
        x: () => "x" as const,
        y: (y) => y.xy,
      },
      (a) => a.this
    )
  );
  expectType<string | number | boolean>(result);
  t.is(result, 5);

  const result2 = pipe(
    these,
    matchP(
      {
        both: () => "both" as const,
      },
      (a) => {
        expectType<
          | { _tag: "this"; this: string }
          | { _tag: "that"; that: number }
          | { _tag: "x" | "y"; xy: boolean }
          | { _tag: "x"; xy: boolean }
          | { _tag: "y"; xy: boolean }
        >(a);
        return a._tag;
      }
    )
  );
  expectType<"this" | "that" | "both" | "x" | "y">(result2);
  t.is(result2, "that");
});

test("inference [makeMatchI]", (t) => {
  const result = matchI(these)({
    both: () => "both" as const,
    that: () => 5,
    this: () => "this" as const,
    x: ({ xy }) => "x" as const,
    y: (y) => y.xy,
  });

  expectType<number | "this" | "both" | "x" | boolean>(result);

  t.is(result, 5);
});

test("inference [makeMatchPI]", (t) => {
  const result = matchPI(these)(
    {
      both: () => "both" as const,
      that: () => 5,
    },
    (otherwize) =>
      matchPI(otherwize)(
        {
          x: () => "x" as const,
          y: (y) => y.xy,
        },
        () => "this" as const
      )
  );
  expectType<number | "this" | "both" | "x" | boolean>(result);
  t.is(result, 5);

  const result2 = matchPI(these)(
    {
      both: () => "both" as const,
    },
    (a) => {
      expectType<
        | { _tag: "this"; this: string }
        | { _tag: "that"; that: number }
        | { _tag: "x" | "y"; xy: boolean }
        | { _tag: "x"; xy: boolean }
        | { _tag: "y"; xy: boolean }
      >(a);
      return a._tag;
    }
  );
});
