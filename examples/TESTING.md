# Testing

## Spy update function called by state.update(...)

```typescript
const state = new Subjective(
    productState, 
    productStateFns,
);

it('should call updateIsLoading update function', () => {

    // spy updateIsLoading update function
    const spy = spyOn(productStateFns, 'updateIsLoading');

    // update state
    state.update(f => f.updateIsLoading, true);

    // check updateIsLoading function has been called
    expect(spy).toHaveBeenCalledWith(jasmine.anything(), true);
});
```

## Test update functions

```typescript
const state = new Subjective(
    productState, 
    productStateFns,
);

it('should update isLoading property', () => {

    expect(state.snapshot.isLoading).toBe(false);

    // call function
    const updatedState = productStateFns.updateIsLoading(state.snapshot, true);

    expect(updatedState.isLoading).toBe(true);
});
```
