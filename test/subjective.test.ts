import { Subjective, SubjectiveStore } from '../src/subjective';
import { Observable } from 'rxjs/Observable';
import { skip } from 'rxjs/operators';
import { Subscription } from 'rxjs/Subscription';

export interface FilterA {
    id: string;
    name: string;
}

export interface FilterB {
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

    it(`key$ - should
        1. update prop query, 
        2. call subscribe callback on query prop change
        3. return value of query
    `, done => {
        const state = new Subjective(new ProductState());
        const obs = state.key$('query');

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

    it(`key$ - should
        1. update prop query, 
        2. call subscribe callback on query prop change
        3. return whole state
    `, done => {
        const state = new Subjective(new ProductState());
        const obs = state.key$('query', true);

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

    it(`key$ - should
        1. update prop filter,
        2. call subscribe callback on filter prop change
        3. return value of filter
    `, done => {
        const state = new Subjective(new ProductState());
        const obs = state.key$('filter');

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

    it(`key$ - should
        1. update prop filter,
        2. call subscribe callback on filter prop change
        3. return whole state
    `, done => {
        const state = new Subjective(new ProductState());
        const obs = state.key$('filter', true);

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

    it(`key$ - should
        1. update prop filter.a,
        2. call subscribe callback on filter prop change
        3. return value of filter.a
    `, done => {
        const state = new Subjective(new ProductState());
        const obs = state.key$('filter', 'a');

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

    it(`key$ - should
        1. update prop filter.a,
        2. call subscribe callback on filter prop change
        3. return whole state
    `, done => {
        const state = new Subjective(new ProductState());
        const obs = state.key$('filter', 'a', true);

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

    it(`key$ - should
        1. update prop filter.c,
        2. call subscribe callback on filter prop change
        3. return whole state
        - NOTE: filter.c is changed 3x
            1. init
            2. false
            3. true
    `, done => {
        const state = new Subjective(new ProductState());
        const obs = state.key$('filter', 'c', true);

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

    it(`$ - should return whole state`, done => {
        const state = new Subjective(new ProductState());

        subscription = state.$.pipe(skip(1)).subscribe(value => {
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
});

describe('SubjectiveStore', () => {
    it('should select ProductState', () => {
        const subjectiveStore = new SubjectiveStore([ProductState]);
        const state = subjectiveStore.select(ProductState);

        expect(state.snapshot).toEqual({
            query: '',
            position: 0,
            filter: {
                a: [],
                b: [],
                c: true,
            },
            items: [],
        });
    });
});
