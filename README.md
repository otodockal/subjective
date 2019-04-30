# Subjective

*   Opinionated state management
*   Type safety by design. Type inference works for both Update and Selector functions.
*   Logging. Inspect where Update function was called.
*   Pause observable stream, if needed.
*   Always receive the whole state, if needed.

## Concepts

### State

```typescript
const state = new Subjective(
    productState,
    productStateFns,
);
```

##### Default Logger

```typescript
const state = new Subjective(
    productState,
    productStateFns,
    // use default Logger (dev only)
    true
);
```

##### Custom Logger

```typescript
const state = new Subjective(
    productState,
    productStateFns,
    // use custom Logger (dev only)
    (updateFnName: string, payload: any, updateFnRef: Function) => {
        // LOG
        const data = JSON.stringify(payload);
        const dataTrimmed = data.substring(0, 80);
        // logging to console
        console.groupCollapsed(
            `%c${fnName}: %c${dataTrimmed}${
                dataTrimmed.length < data.length ? '…' : ''
            }`,
            `color: green; font-weight: 300;`,
            `color: gray; font-weight: 100;`,
        );
        console.log(payload);
        console.log(updateFnRef);
        console.groupEnd();
    }
);
```

[EXAMPLE](https://stackblitz.com/edit/subjective?file=app%2Fcore%2Fstores%2Fproduct%2Fproduct.state.ts)

### Selector function

##### Subscribe to state.filter.type and notify with its value

```typescript
state.select(s => s.filter.type).subscribe();
```

##### Subscribe to state.filter.type and notify with a whole state
```typescript
state.select(s => s.filter.type, true).subscribe();
```

[EXAMPLE](https://stackblitz.com/edit/subjective?file=app%2Flist%2Flist.component.ts)

### Update function

##### Update value of state.filter.type

```typescript
state.update(f => f.updateFilterType, type);
```

##### Update value of state.filter.type and do not notify subscribers
```typescript
state.update(f => f.updateFilterType, type, false);
```

##### Update value of state.filter.type and return updated state
```typescript
const updatedState = state.update(f => f.updateFilterType, type);
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

## FUTURE
I've been thinking of [this new syntax...check it out](EXP.md). 

## Credits

*   [RxJS](https://github.com/ReactiveX/rxjs)
*   [ngrx](https://github.com/ngrx/platform)
*   [Redux](https://github.com/reactjs/redux)
