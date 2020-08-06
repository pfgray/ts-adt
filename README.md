# ADTs for typescript

### Enables succinct ADT declaration.

In typescript, [Algebraic Data Types](https://www.typescriptlang.org/docs/handbook/advanced-types.html#discriminated-unions) are encoded using union types with a discriminator field.

Example:

```ts
import { ADT } from 'ts-adt'

type Option<A> = ADT<{
  some: {value: A},
  none: {}
}>
```

This translates to:
```ts
type Option<A> = { _type: 'some', value: A} | { _type: 'none' }
```

Here, `Option<A>` represents a value that can be one of two types; either it's an object with a `_type` attribute `"some"` _and_ a value `A`, or it's an object with `_type` attribute `"none"`. This type is quite useful, especially when used with Typescript's type narrowing feature:

```ts
declare const userImage: Option<string>

function getUserImage(): string {
  if(userImage._type === 'some') {
    return userImage.value // value is accessible here, since _type is 'some'
  } else {
    return "http://example.com/defaultImage" 
  }
}
```

Pattern matching is a common usecase when dealing with ADTs. You'll often find yourself in a position where you need to default to certain values depending on what the underlying value is. For this reason, we've included a `match` and `matchI` function:

```ts
import { ADT, match, matchI } from 'ts-adt'

declare const userImage: Option<string>

const img = matchItem(userImage)({
  some: ({value}) => value,
  none: () => "http://example.com/defaultImage"
})

const img = pipe(
  userImage,
  match({
    some: ({value}) => value,
    none: () => "http://example.com/defaultImage"
  })
)
```

Both functions work the same way, but their arguments are ordered differently for better inference in different cases.




