import { Subscription } from 'rxjs/Subscription';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { distinctUntilKeyChanged } from 'rxjs/operators/distinctUntilKeyChanged';
import { Subjective } from '../src/subjective';
import { bufferCount } from 'rxjs/operators';
import { map } from 'rxjs/operators/map';
const { performance } = require('perf_hooks');

interface FilterA {
    id: string;
    name: string;
}

class ProductState {
    query = '';
    position = 0;
    filter = {
        a: [] as FilterA[],
        b: [],
        c: true,
    };
    items = [];
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

describe('Performance', () => {
    let subscription: Subscription;
    const iterations = 10000;

    afterEach(() => {
        if (subscription) {
            subscription.unsubscribe();
        }
    });

    fit(`performance test - Subjective`, done => {
        const state = new Subjective(new ProductState());
        const t0 = performance.now();

        subscription = state
            .key$('filter', 'a')
            .pipe(bufferCount(iterations))
            .subscribe(res => {
                console.log('Subjective: ' + (performance.now() - t0) + ' ms.');
                done();
            });

        for (let index = 0; index < iterations; index++) {
            state.dispatch(updateFilterA, [
                { id: '1', name: 'test' + index },
                { id: '2', name: 'test2' },
            ]);
        }
    });

    fit('performance test - BehaviorSubject', done => {
        const productState = new ProductState();
        const state = new BehaviorSubject(productState);
        const t0 = performance.now();

        subscription = state
            .pipe(
                distinctUntilKeyChanged('filter'),
                map(i => i.filter),
                distinctUntilKeyChanged('a'),
                map(i => i.a),
                bufferCount(iterations),
            )
            .subscribe(res => {
                console.log(
                    'BehaviorSubject: ' + (performance.now() - t0) + ' ms.',
                );
                done();
            });

        for (let index = 0; index < iterations; index++) {
            const newState = {
                ...productState,
                filter: {
                    ...productState.filter,
                    a: [{ id: '1', name: 'test' }, { id: '2', name: 'test2' }],
                },
            } as ProductState;
            state.next(newState);
        }
    });

    fit('performance test - BehaviorSubject - mutations', done => {
        const productState = new ProductState();
        const state = new BehaviorSubject(productState);
        const t0 = performance.now();

        subscription = state
            .pipe(
                // distinctUntilKeyChanged('filter'),   // NOTE: we can't, mutations
                map(i => i.filter),
                // distinctUntilKeyChanged('a'),        // NOTE: we can't, mutations
                map(i => i.a),
                bufferCount(iterations),
            )
            .subscribe(res => {
                console.log(
                    'BehaviorSubject - mutations: ' +
                        (performance.now() - t0) +
                        ' ms.',
                );
                done();
            });

        for (let index = 0; index < iterations; index++) {
            productState.filter.a = [
                { id: '1', name: 'test' },
                { id: '2', name: 'test2' },
            ];
            state.next(productState);
        }
    });
});
