import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { distinctUntilKeyChanged } from 'rxjs/operators/distinctUntilKeyChanged';
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
    dispatch(updateFunction: (state: S) => S): S;
    dispatch<DATA>(
        updateFunction: (state: S, payload: DATA) => S,
        payload: { [K in keyof DATA]: DATA[K] },
    ): S;
    dispatch<DATA>(
        updateFunction: (state: S, payload?: DATA) => S,
        payload?: { [K in keyof DATA]: DATA[K] },
    ): S {
        this._subject.next(updateFunction.call(null, this.snapshot, payload));
        return this.snapshot;
    }

    /**
     * Observable two levels state key selector
     * - return value of the key or whole state
     * EXAMPLES:
     * - state.key$('items')
     * - state.key$('items', true)
     * - state.key$('filter', 'types')
     * - state.key$('filter', 'types', true)
     */
    key$<K extends keyof S, K1 extends keyof S[K]>(
        key: K,
        nestedKey: K1,
        returnWholeState?: false,
    ): Observable<S[K][K1]>;
    key$<K extends keyof S, K1 extends keyof S[K]>(
        key: K,
        nestedKey: K1,
        returnWholeState: true,
    ): Observable<S>;
    key$<K extends keyof S>(key: K, returnWholeState?: false): Observable<S[K]>;
    key$<K extends keyof S>(key: K, returnWholeState: true): Observable<S>;
    key$<K extends keyof S, K1 extends keyof S[K]>(
        key: K,
        nestedKey?: K1,
        returnWholeState?: boolean,
    ): Observable<S | S[K] | S[K][K1]> {
        let self = null;
        let s: Observable<S[K] | S[K][K1]> = (self = this.$).pipe.apply(
            self,
            this._distinctUntilKeyChanged(key),
        );

        if (typeof nestedKey === 'string') {
            s = this.$.pipe.apply(s, this._distinctUntilKeyChanged(nestedKey));
        }

        return s.pipe(
            map(value => {
                return (typeof nestedKey === 'boolean' && nestedKey === true) ||
                    returnWholeState === true
                    ? this.snapshot
                    : value;
            }),
        );
    }

    /**
     * An observable of the state
     */
    get $(): Observable<S> {
        return this._subject.pipe(distinctUntilChanged());
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

    private _distinctUntilKeyChanged(key: any): any[] {
        return [distinctUntilKeyChanged(key), map((state: any) => state[key])];
    }
}
