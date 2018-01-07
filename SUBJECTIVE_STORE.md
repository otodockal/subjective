
### SubjectiveStore

SubjectiveStore has been removed, but can be easily implemented using code snippet below.

```typescript
interface SubjectiveItem<S> {
    type: { new (arg: any): S };
    value: Subjective<S>;
}

export class SubjectiveStore {
    private _states: SubjectiveItem<any>[] = [];

    constructor(states: any[]) {
        for (const state of states) {
            const s = new state();
            this._states.push({
                type: s,
                value: new Subjective(s),
            });
        }
    }
    /**
     * Select state by given type
     */
    select<S>(type: { new (arg: any): S }): Subjective<S> | undefined {
        for (const item of this._states) {
            if (item.type instanceof type) {
                return item.value;
            }
        }
    }
}
```