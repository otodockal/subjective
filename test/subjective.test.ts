import { Subjective } from '../src/subjective';
import { Subscription } from 'rxjs';
import { skip, bufferCount } from 'rxjs/operators';

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
    updateWholeFilter(
        state: ProductState,
        filter: ProductState['filter'],
    ): ProductState {
        return {
            ...state,
            filter,
        };
    }
}

// Logger
class LoggerState {
    filter = {
        a: false,
    };
    b = false;
}

class LoggerStateFns {
    filter = {
        // 2nd level
        updateA(state: LoggerState, a: boolean): LoggerState {
            return {
                ...state,
                filter: {
                    ...state.filter,
                    a,
                },
            };
        },
    };
    // 1st level
    // snake case? yeah!
    update_b(state: LoggerState, b: boolean): LoggerState {
        return {
            ...state,
            b,
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
        state.update(f => f.increaseCount, undefined);
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

    it('update - should not call subs cb on update with emitEvent=false but should call on the third update call with defined emitEvent:true', done => {
        const state = new Subjective(new ProductState(), new ProductStateFns());
        const obs = state.select(s => s.filter.a);

        obs.pipe(bufferCount(2)).subscribe(value => {
            expect(value).toEqual([
                // 0. update === default value
                [],
                // 3. update
                [{ id: '1', name: 'emitEvent:true' }],
            ]);
            done();
        });

        // 0. update === default value
        expect(state.snapshot.filter.a).toEqual([]);

        // 1. update, but do not fire event to call subs cb
        const updatedState = state.update(
            f => f.updateFilterA,
            [{ id: '1', name: 'emitEvent:false' }],
            false,
        );
        expect(updatedState.filter.a).toEqual([
            { id: '1', name: 'emitEvent:false' },
        ]);

        // 2. update, but do not fire event to call subs cb
        const updatedState1 = state.update(
            f => f.updateFilterA,
            [{ id: '1', name: 'emitEvent:false - 2' }],
            false,
        );
        expect(updatedState1.filter.a).toEqual([
            { id: '1', name: 'emitEvent:false - 2' },
        ]);

        // 3. update, but fire event to call subs cb
        state.update(
            f => f.updateFilterA,
            [{ id: '1', name: 'emitEvent:true' }],
            true,
        );
    });

    it('update - should not call subs cb on update with emitEvent=false but should call on the second update call with missing option obj', done => {
        const state = new Subjective(new ProductState(), new ProductStateFns());
        const obs = state.select(s => s.filter.a);

        // subs -> skip initial value
        subscription = obs.pipe(skip(1)).subscribe(value => {
            expect(value).toEqual([{ id: '1', name: 'emitEvent:true' }]);
            done();
        });

        // update, but do not fire event to call subs cb
        const updatedState = state.update(
            f => f.updateFilterA,
            [{ id: '1', name: 'emitEvent:false' }],
            false,
        );

        expect(updatedState.filter.a).toEqual([
            { id: '1', name: 'emitEvent:false' },
        ]);

        // update, but fire event to call subs cb
        state.update(f => f.updateFilterA, [
            { id: '1', name: 'emitEvent:true' },
        ]);
    });

    it('update - should update whole filter', done => {
        const state = new Subjective(new ProductState(), new ProductStateFns());

        expect(state.snapshot.filter).toEqual({ a: [], b: [], c: true });

        const res = state.update(f => f.updateWholeFilter, {
            a: [{ id: '1', name: 'filterA' }],
            b: [{ id: '1', name: 'filterB' }],
            c: true,
        });

        expect(res.filter).toEqual({
            a: [{ id: '1', name: 'filterA' }],
            b: [{ id: '1', name: 'filterB' }],
            c: true,
        });

        done();
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

    // Logger
    it('should use default Logger - group + payload + updateFnRef', () => {
        const spy = spyOn(console, 'groupCollapsed').calls;
        const spy1 = spyOn(console, 'log').calls;

        const state = new Subjective(
            new LoggerState(),
            new LoggerStateFns(),
            true,
        );

        // update nested state
        state.update(f => f.filter.updateA, false);

        // console.groupCollapsed with formatting
        expect(spy.allArgs().toString()).toBe(
            '%cfilter.updateA: %cfalse,color: green; font-weight: 300;,color: gray; font-weight: 100;',
        );
        // 1. console.log
        expect(spy1.argsFor(0).toString()).toBe('false');
        // 2. console.log
        expect(
            spy1
                .argsFor(1)
                .toString()
                .includes('f.filter.updateA'),
        ).toBe(true);
    });

    it('should use custom Logger', done => {
        const state = new Subjective(
            new LoggerState(),
            new LoggerStateFns(),
            // custom Logger
            (updateFnName: string, payload: any, updateFnRef: Function) => {
                expect(updateFnName).toBe('filter.updateA');
                expect(payload).toBe(false);
                expect(
                    updateFnRef.toString().includes('f.filter.updateA'),
                ).toBe(true);
                done();
            },
        );
        // update nested state
        state.update(f => f.filter.updateA, false);
    });

    it('should NOT use default Logger', () => {
        const spy = spyOn(console, 'log');
        const state = new Subjective(
            new LoggerState(),
            new LoggerStateFns(),
            false,
        );
        // update nested state
        state.update(f => f.filter.updateA, false);
        expect(spy).not.toHaveBeenCalled();
    });

    it('should log updateFn which is using snake case naming', () => {
        const spy = spyOn(console, 'groupCollapsed').calls;
        const spy1 = spyOn(console, 'log').calls;

        const state = new Subjective(
            new LoggerState(),
            new LoggerStateFns(),
            true,
        );
        // update by using snake case update fn
        state.update(f => f.update_b, true);

        // console.groupCollapsed with formatting
        expect(spy.allArgs().toString()).toBe(
            '%cupdate_b: %ctrue,color: green; font-weight: 300;,color: gray; font-weight: 100;',
        );
        // 1. console.log
        expect(spy1.argsFor(0).toString()).toBe('true');
        // 2. console.log
        expect(
            spy1
                .argsFor(1)
                .toString()
                .includes('update_b'),
        ).toBe(true);
    });

    it('should throw error if Logger is not either boolean or function', () => {
        try {
            const state = new Subjective(
                new LoggerState(),
                new LoggerStateFns(),
                {} as any,
            );
            state.update(f => f.filter.updateA, true);
        } catch (error) {
            expect(error).toBe(
                'Logger type can be either function or boolean.',
            );
        }
    });
});
