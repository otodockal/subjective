import { Observable } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';
import { _InternalSubject } from './subject';

export class Subjective<S, F> {
    private _subject = new _InternalSubject<S>(this._initialState);

    /**
     * Subjective
     * @param _initialState Inital state
     * @param _updateFns Update functions
     */
    constructor(private _initialState: S, private _updateFns: F) {}

    /**
     * Update function
     * @example
     * // update value
     * state.update(f => f.updateQuery, 'food')
     * // update value and do not notify subscribers
     * state.update(f => f.updateQuery, 'food', false)
     * // update value and return updated state
     * const updatedState = state.update(f => f.updateQuery, 'food')
     */
    update<DATA>(
        updateFn: (fns: F) => (state: S, payload: DATA) => S,
        payload: DATA extends Array<infer O>
            ? { [K in keyof O]: O[K] }[]
            : DATA extends object
                ? { [K in keyof DATA]: DATA[K] }
                : DATA,
        emitEvent?: boolean,
    ): S {
        const v = updateFn(this._updateFns)(this.snapshot, payload as any);
        if (emitEvent === false) {
            this._subject.value = v;
        } else {
            this._subject.next(v);
        }
        return this.snapshot;
    }

    /**
     * State selector
     * - subscribe to a key defined by selectorFn
     * @example
     * // subscribe to a key and notify with its value
     * state.select(s => s.filter.types).subscribe()
     * // subscribe to a key and notify with a whole state
     * state.select(s => s.filter.types, true).subscribe()
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
     * @example
     * // update functions should be pure, so update function with initial state
     * state.update(f => f.resetFilterType, state.initialState.resetFilterType)
     */
    get initialState() {
        return this._initialState;
    }
}
