import { Observable, BehaviorSubject } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';

export type SubjectivePayloadType<DATA> =
    // is Array? infer object from Array
    DATA extends Array<infer O>
        ? { [K in keyof O]: O[K] }[] 
        // is Object?
        : DATA extends object 
            ? { [K in keyof DATA]: DATA[K] } : DATA;


export class Subjective<S, F> {
    private _subject = new BehaviorSubject<S>(this._initialState);

    /**
     * Subjective
     * @param _initialState Inital state
     * @param _updateFns Update functions
     */
    constructor(private _initialState: S, private _updateFns: F) {}

    /**
     * Update function
     * - optionally with a payload
     * - return the last snapshot of updated state
     * EXAMPLES:
     * - state.update(f => f.updateQuery)
     * - state.update(f => f.updateQuery, 'food')
     * - const lastState = state.update(f => f.updateQuery)
     * - const lastState = state.update(f => f.updateQuery, 'food')
     */
    update(updateFn: (fns: F) => (state: S) => S): S;
    update<DATA>(
        updateFn: (fns: F) => (state: S, payload: DATA) => S,
        payload: SubjectivePayloadType<DATA>,
    ): S;
    update<DATA>(
        updateFn: (fns: F) => (state: S, payload?: DATA) => S,
        payload?: SubjectivePayloadType<DATA>,
    ): S {
        this._subject.next(
            updateFn(this._updateFns)(this.snapshot, payload as any),
        );
        return this.snapshot;
    }

    /**
     * State selector
     * - subscribe to a key defined by selectorFn
     * - return value of the key or whole state
     * EXAMPLES:
     * - state.select(s => s.items)
     * - state.select(s => s.items, true)
     * - state.select(s => s.filter.types)
     * - state.select(s => s.filter.types, true)
     */
    select<K>(
        selectorFn: (state: S) => K,
        returnWholeState?: false,
    ): Observable<K>;
    select<K>(
        selectorFn: (state: S) => K,
        returnWholeState: true,
    ): Observable<S>;
    select<K>(
        selectorFn: (state: S) => K,
        returnWholeState?: boolean,
    ): Observable<K | S> {
        return this._subject.pipe(
            map(state => selectorFn(state)),
            distinctUntilChanged(),
            map(value => {
                return returnWholeState === true ? this.snapshot : value;
            }),
        );
    }

    /**
     * Snapshot of the state
     */
    get snapshot() {
        return this._subject.getValue();
    }

    /**
     * Initial state
     * - useful for resetting the state
     * EXAMPLES:
     * - update functions should be pure, so update function with initial state
     */
    get initialState() {
        return this._initialState;
    }
}
