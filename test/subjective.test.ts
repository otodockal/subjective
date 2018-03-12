import { Subjective } from '../src/subjective';
import { Observable } from 'rxjs/Observable';
import { skip } from 'rxjs/operators';
import { Subscription } from 'rxjs/Subscription';

// CounterState
class CounterState {
    count = 0;
}

class CounterStateFns {
    increaseCount(state: CounterState): CounterState {
        return {
            ...state,
            count: state.count + 1,
        };
    }
    updateCount(state: CounterState, count: number): CounterState {
        return {
            ...state,
            count,
        };
    }
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

class ProductStateFns {
    updateQuery(state: ProductState, query: string): ProductState {
        return {
            ...state,
            query,
        };
    }
    updateFilterA(state: ProductState, a: FilterA[]): ProductState {
        return {
            ...state,
            filter: {
                ...state.filter,
                a,
            },
        };
    }
    updateFilterB(state: ProductState, b: FilterB[]): ProductState {
        return {
            ...state,
            filter: {
                ...state.filter,
                b,
            },
        };
    }
    updateFilterC(state: ProductState, c: boolean): ProductState {
        return {
            ...state,
            filter: {
                ...state.filter,
                c,
            },
        };
    }
}

describe('Subjective', () => {
    let subscription: Subscription;

    afterEach(() => {
        if (subscription) {
            subscription.unsubscribe();
        }
    });

    it('update - no payload', () => {
        const state = new Subjective(new CounterState(), new CounterStateFns());
        state.update(f => f.increaseCount);
        expect(state.snapshot.count).toBe(1);
    });

    it('update - payload', () => {
        const state = new Subjective(new CounterState(), new CounterStateFns());
        state.update(f => f.updateCount, 10);
        expect(state.snapshot.count).toBe(10);
    });

    it('update - should return the last updated state', () => {
        const state = new Subjective(new CounterState(), new CounterStateFns());

        state.select(s => s.count);
        state.update(f => f.increaseCount, 'aa');

        const s1 = state.update(f => f.updateCount, 10);
        const s2 = state.update(f => f.updateCount, 11);
        const s3 = state.update(f => f.updateCount, 12);

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
        const state = new Subjective(new ProductState(), new ProductStateFns());
        const obs = state.select(s => s.query);

        subscription = obs.pipe(skip(1)).subscribe(value => {
            expect(value).toBe('Oto');
            done();
        });

        state.update(f => f.updateQuery, 'Oto');
        state.update(f => f.updateFilterA, [
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
        const state = new Subjective(new ProductState(), new ProductStateFns());
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

        state.update(f => f.updateQuery, 'Oto');
        state.update(f => f.updateFilterA, [
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
        const state = new Subjective(new ProductState(), new ProductStateFns());
        const obs = state.select(s => s.filter);

        subscription = obs.pipe(skip(1)).subscribe(value => {
            expect(value).toEqual({
                a: [{ id: '1', name: 'FilterA' }],
                b: [],
                c: true,
            });
            done();
        });

        state.update(f => f.updateQuery, 'Oto');
        state.update(f => f.updateFilterA, [
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
        const state = new Subjective(new ProductState(), new ProductStateFns());
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

        state.update(f => f.updateQuery, 'Oto');
        state.update(f => f.updateFilterA, [
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
        const state = new Subjective(new ProductState(), new ProductStateFns());
        const obs = state.select(s => s.filter.a);

        subscription = obs.pipe(skip(1)).subscribe(value => {
            expect(value).toEqual([{ id: '1', name: 'FilterA' }]);
            done();
        });

        state.update(f => f.updateQuery, 'Oto');
        state.update(f => f.updateFilterA, [
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
        const state = new Subjective(new ProductState(), new ProductStateFns());
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

        state.update(f => f.updateQuery, 'Oto');
        state.update(f => f.updateFilterB, [
            {
                id: '1',
                name: 'FilterB',
            },
        ]);
        state.update(f => f.updateFilterA, [
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
        const state = new Subjective(new ProductState(), new ProductStateFns());
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

        state.update(f => f.updateQuery, 'Oto');
        state.update(f => f.updateFilterB, [
            {
                id: '1',
                name: 'FilterB',
            },
        ]);
        state.update(f => f.updateFilterA, [
            {
                id: '1',
                name: 'FilterA',
            },
        ]);
        state.update(f => f.updateFilterC, false);
        state.update(f => f.updateFilterC, true);
    });

    it(`select - should return whole state`, done => {
        const state = new Subjective(new ProductState(), new ProductStateFns());
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

        state.update(f => f.updateQuery, 'Oto');
    });

    it(`snapshot - should return whole state without subscription`, () => {
        const state = new Subjective(new ProductState(), new ProductStateFns());

        expect(state.snapshot.query).toBe('');
        state.update(f => f.updateQuery, 'Oto');
        expect(state.snapshot.query).toBe('Oto');
    });

    it('initialState - after updating the state, should return init value', () => {
        const state = new Subjective(new ProductState(), new ProductStateFns());
        // update state
        expect(state.snapshot.query).toBe('');
        state.update(f => f.updateQuery, 'Oto');
        expect(state.snapshot.query).toBe('Oto');
        // verify initial state
        expect(state.initialState).toEqual(new ProductState());
    });
});
