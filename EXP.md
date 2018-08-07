

Alternative (future) syntax
---------------------------
- I've been thinking of this change, easier TS, but different update fns declaration...

```typescript
// define update fns
class ProductStateFns {
    updateQuery = (query: string) => (state: ProductState): ProductState => {
        return {
            ...state,
            query,
        };
    };
}

// update state
state.update(f => f.updateQuery('Oto'));
```