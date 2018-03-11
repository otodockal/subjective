import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { distinctUntilChanged } from 'rxjs/operators/distinctUntilChanged';
import { map } from 'rxjs/operators/map';

export class Subjective<S> {
    private _subject = new BehaviorSubject<S>(this._initialState);

    constructor(private _initialState: S) {}

    /**
     * Dispatch update function, optionally with a payload, and return the last snapshot of updated state
     * EXAMPLES:
     * - state.dispatch(updateQuery)
     * - state.dispatch(updateQuery, 'food')
     * - const lastState = state.dispatch(updateQuery)
     * - const lastState = state.dispatch(updateQuery, 'food')
     */
    dispatch(updateFn: (state: S) => S): S;
    dispatch<DATA>(
        updateFn: (state: S, payload: DATA) => S,
        payload: { [K in keyof DATA]: DATA[K] },
    ): S;
    dispatch<DATA>(
        updateFn: (state: S, payload?: DATA) => S,
        payload?: { [K in keyof DATA]: DATA[K] },
    ): S {
        this._subject.next(updateFn.call(null, this.snapshot, payload));
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
     * - update functions should be pure, so dispatch update function with initial state
     */
    get initialState() {
        return this._initialState;
    }
}
