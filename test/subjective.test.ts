import { Subjective } from '../src/subjective';
import { Observable } from 'rxjs/Observable';
import { skip } from 'rxjs/operators';
import { Subscription } from 'rxjs/Subscription';

// CounterState
class CounterState {
    count = 0;
}

function increaseCount(state: CounterState): CounterState {
    return {
        ...state,
        count: state.count + 1,
    };
}

function updateCount(state: CounterState, count: number): CounterState {
    return {
        ...state,
        count,
    };
}

// ProductState
interface FilterA {
    id: string;
    name: string;
}

interface FilterB {
    id: string;
    name: string;
}

class ProductState {
    query = '';
    position = 0;
    filter = {
        a: [] as FilterA[],
        b: [] as FilterB[],
        c: true,
    };
    items = [];
}

function updateQuery(state: ProductState, query: string): ProductState {
    return {
        ...state,
        query,
    };
}

function updateFilterA(state: ProductState, a: FilterA[]): ProductState {
    return {
        ...state,
        filter: {
            ...state.filter,
            a,
        },
    };
}

function updateFilterB(state: ProductState, b: FilterB[]): ProductState {
    return {
        ...state,
        filter: {
            ...state.filter,
            b,
        },
    };
}

function updateFilterC(state: ProductState, c: boolean): ProductState {
    return {
        ...state,
        filter: {
            ...state.filter,
            c,
        },
    };
}

describe('Subjective', () => {
    let subscription: Subscription;

    afterEach(() => {
        if (subscription) {
            subscription.unsubscribe();
        }
    });

    it('dispatch - no payload', () => {
        const state = new Subjective(new CounterState());
        state.dispatch(increaseCount);
        expect(state.snapshot.count).toBe(1);
    });

    it('dispatch - payload', () => {
        const state = new Subjective(new CounterState());
        state.dispatch(updateCount, 10);
        expect(state.snapshot.count).toBe(10);
    });

    it('dispatch - should return the last updated state', () => {
        const state = new Subjective(new CounterState());

        const s1 = state.dispatch(updateCount, 10);
        const s2 = state.dispatch(updateCount, 11);
        const s3 = state.dispatch(updateCount, 12);
        
        expect(s1).toEqual({ count: 10 });
        expect(s2).toEqual({ count: 11 });
        expect(s3).toEqual({ count: 12 });

        expect(s1 === s2).toBe(false);
        expect(s1 === s3).toBe(false);
        expect(s2 === s3).toBe(false);
    });

    it(`select - should
        1. update prop query, 
        2. call subscribe callback on query prop change
        3. return value of query
    `, done => {
        const state = new Subjective(new ProductState());
        const obs = state.select(s => s.query);

        subscription = obs.pipe(skip(1)).subscribe(value => {
            expect(value).toBe('Oto');
            done();
        });

        state.dispatch(updateQuery, 'Oto');
        state.dispatch(updateFilterA, [
            {
                id: '1',
                name: 'FilterA',
            },
        ]);
    });

    it(`select - should
        1. update prop query, 
        2. call subscribe callback on query prop change
        3. return whole state
    `, done => {
        const state = new Subjective(new ProductState());
        const obs = state.select(s => s.query, true);

        subscription = obs.pipe(skip(1)).subscribe(value => {
            expect(value).toEqual({
                query: 'Oto',
                position: 0,
                filter: { a: [], b: [], c: true },
                items: [],
            });
            done();
        });

        state.dispatch(updateQuery, 'Oto');
        state.dispatch(updateFilterA, [
            {
                id: '1',
                name: 'FilterA',
            },
        ]);
    });

    it(`select - should
        1. update prop filter,
        2. call subscribe callback on filter prop change
        3. return value of filter
    `, done => {
        const state = new Subjective(new ProductState());
        const obs = state.select(s => s.filter);

        subscription = obs.pipe(skip(1)).subscribe(value => {
            expect(value).toEqual({
                a: [{ id: '1', name: 'FilterA' }],
                b: [],
                c: true,
            });
            done();
        });

        state.dispatch(updateQuery, 'Oto');
        state.dispatch(updateFilterA, [
            {
                id: '1',
                name: 'FilterA',
            },
        ]);
    });

    it(`select - should
        1. update prop filter,
        2. call subscribe callback on filter prop change
        3. return whole state
    `, done => {
        const state = new Subjective(new ProductState());
        const obs = state.select(s => s.filter, true);

        subscription = obs.pipe(skip(1)).subscribe(value => {
            expect(value).toEqual({
                query: 'Oto',
                position: 0,
                filter: { a: [{ id: '1', name: 'FilterA' }], b: [], c: true },
                items: [],
            });
            done();
        });

        state.dispatch(updateQuery, 'Oto');
        state.dispatch(updateFilterA, [
            {
                id: '1',
                name: 'FilterA',
            },
        ]);
    });

    it(`select - should
        1. update prop filter.a,
        2. call subscribe callback on filter prop change
        3. return value of filter.a
    `, done => {
        const state = new Subjective(new ProductState());
        const obs = state.select(s => s.filter.a);

        subscription = obs.pipe(skip(1)).subscribe(value => {
            expect(value).toEqual([{ id: '1', name: 'FilterA' }]);
            done();
        });

        state.dispatch(updateQuery, 'Oto');
        state.dispatch(updateFilterA, [
            {
                id: '1',
                name: 'FilterA',
            },
        ]);
    });

    it(`select - should
        1. update prop filter.a,
        2. call subscribe callback on filter prop change
        3. return whole state
    `, done => {
        const state = new Subjective(new ProductState());
        const obs = state.select(s => s.filter.a, true);

        subscription = obs.pipe(skip(1)).subscribe(value => {
            expect(value).toEqual({
                query: 'Oto',
                position: 0,
                filter: {
                    a: [{ id: '1', name: 'FilterA' }],
                    b: [{ id: '1', name: 'FilterB' }],
                    c: true,
                },
                items: [],
            });
            done();
        });

        state.dispatch(updateQuery, 'Oto');
        state.dispatch(updateFilterB, [
            {
                id: '1',
                name: 'FilterB',
            },
        ]);
        state.dispatch(updateFilterA, [
            {
                id: '1',
                name: 'FilterA',
            },
        ]);
    });

    it(`select - should
        1. update prop filter.c,
        2. call subscribe callback on filter prop change
        3. return whole state
        - NOTE: filter.c is changed 3x
            1. init
            2. false
            3. true
    `, done => {
        const state = new Subjective(new ProductState());
        const obs = state.select(s => s.filter.c, true);

        subscription = obs.pipe(skip(2)).subscribe(value => {
            expect(value).toEqual({
                query: 'Oto',
                position: 0,
                filter: {
                    a: [{ id: '1', name: 'FilterA' }],
                    b: [{ id: '1', name: 'FilterB' }],
                    c: true,
                },
                items: [],
            });
            done();
        });

        state.dispatch(updateQuery, 'Oto');
        state.dispatch(updateFilterB, [
            {
                id: '1',
                name: 'FilterB',
            },
        ]);
        state.dispatch(updateFilterA, [
            {
                id: '1',
                name: 'FilterA',
            },
        ]);
        state.dispatch(updateFilterC, false);
        state.dispatch(updateFilterC, true);
    });

    it(`select - should return whole state`, done => {
        const state = new Subjective(new ProductState());
        const obs = state.select(s => s);

        subscription = obs.pipe(skip(1)).subscribe(value => {
            expect(value).toEqual({
                query: 'Oto',
                position: 0,
                filter: {
                    a: [],
                    b: [],
                    c: true,
                },
                items: [],
            });
            done();
        });

        state.dispatch(updateQuery, 'Oto');
    });

    it(`snapshot - should return whole state without subscription`, () => {
        const state = new Subjective(new ProductState());

        expect(state.snapshot.query).toBe('');
        state.dispatch(updateQuery, 'Oto');
        expect(state.snapshot.query).toBe('Oto');
    });

    it('initialState - after updating the state, should return init value', () => {
        const state = new Subjective(new ProductState());
        // update state
        expect(state.snapshot.query).toBe('');
        state.dispatch(updateQuery, 'Oto');
        expect(state.snapshot.query).toBe('Oto');
        // verify initial state
        expect(state.initialState).toEqual(new ProductState());
    });
});
