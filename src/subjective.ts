import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { distinctUntilKeyChanged } from 'rxjs/operators/distinctUntilKeyChanged';
import { distinctUntilChanged } from 'rxjs/operators/distinctUntilChanged';
import { map } from 'rxjs/operators/map';

interface SubjectiveItem<S> {
    type: { new (arg): S };
    value: Subjective<S>;
}

export class Subjective<S> {
    private _subject = new BehaviorSubject<S>(this._initialState);

    constructor(private _initialState: S) {}

    /**
     * Dispatch update function, optionally with a payload
     * EXAMPLES:
     * - state.dispatch(updateQuery)
     * - state.dispatch(updateQuery, 'food')
     */
    dispatch<DATA>(
        updateFunction: (state: S, payload?: DATA) => S,
        payload?: { [K in keyof DATA]: DATA[K] },
    ) {
        this._subject.next(updateFunction.call(null, this.snapshot, payload));
    }

    /**
     * An observable of key of the state
     * - return always partial state defined by the key
     * - return whole state if returnWholeState param is true
     * EXAMPLES:
     * - state.key$('items')
     * - state.key$('items', true)
     */
    key$<K extends keyof S>(key: K, returnWholeState?: false): Observable<S[K]>;
    key$<K extends keyof S>(key: K, returnWholeState: true): Observable<S>;
    key$<K extends keyof S>(
        key: K,
        returnWholeState?: boolean,
    ): Observable<S | S[K]> {
        return this.$.pipe(
            ...[
                distinctUntilKeyChanged(key),
                returnWholeState ? null : map(s => s[key as any]),
            ].filter(i => i !== null),
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
    select<S>(type: { new (arg): S }): Subjective<S> {
        for (const item of this._states) {
            if (item.type instanceof type) {
                return item.value;
            }
        }
    }
}
