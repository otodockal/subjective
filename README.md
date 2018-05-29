# Subjective

*   Opinionated state management
*   Type safety by design
*   Selector functions
*   Update functions
*   Composition

## Concepts

### State

```typescript
// define new state
const state = new Subjective(
    productState,
    productStateFns,
);
```

[EXAMPLE](https://stackblitz.com/edit/subjective?file=app%2Fcore%2Fstores%2Fproduct%2Fproduct.state.ts)

### Selector function

```typescript
// subscribe to state.filter.type
state.select(s => s.filter.type).subscribe(type => {
    console.log(type);
});
```

[EXAMPLE](https://stackblitz.com/edit/subjective?file=app%2Flist%2Flist.component.ts)

### Update function

```typescript
// change value of state.filter.type
state.update(f => f.updateFilterType, type);
```

[EXAMPLE](https://stackblitz.com/edit/subjective?file=app%2Flist%2Flist.component.ts)

## Examples

*   [Observable Service in Angular](examples/ANGULAR.md)
*   [Angular E-commerce App - StackBlitz](https://stackblitz.com/edit/subjective?file=app%2Fcore%2Fstores%2Fproduct%2Fproduct.state.ts)
*   [Testing](examples/TESTING.md)

## NOTES

### Immutable pattern

Always use [immutable pattern](https://glimmerjs.com/guides/tracked-properties) otherwise it will not work. We can't rely on mutations since object reference is always the same.

### Type-safety

Types are always inferred either from state class or payload parameter of the update function.

## Credits

*   [RxJS](https://github.com/ReactiveX/rxjs)
*   [ngrx](https://github.com/ngrx/platform)
*   [Redux](https://github.com/reactjs/redux)
