const { Subjective } = require('../dist/subjective.cjs');
const {
    map,
    distinctUntilChanged,
    skip,
    observeOn,
} = require('rxjs/operators');
const { BehaviorSubject, asyncScheduler: async } = require('rxjs');
const Benchmark = require('benchmark');

// define state
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

class ProductStateFns {
    updateFilterA(state: ProductState, a: FilterA[]): ProductState {
        return {
            ...state,
            filter: {
                ...state.filter,
                a,
            },
        };
    }
}

// Subjective
const stateSubjective = new Subjective(
    new ProductState(),
    new ProductStateFns(),
);

// Subjective with Logger
const stateSubjectiveLoger = new Subjective(
    new ProductState(),
    new ProductStateFns(),
    // custom logger
    (updateFnName: string, payload: any) => {
        // log!
    },
);

// BehaviorSubject
const productStateBS = new ProductState();
const stateBehaviorSubject = new BehaviorSubject(productStateBS);

// add tests
const suite = new Benchmark.Suite();
suite
    .add(
        'Subjective',
        function(d) {
            stateSubjective.update(f => f.updateFilterA, [
                { id: '1', name: 'test' + Math.random() },
                { id: '2', name: 'test2' + Math.random() },
            ]);
        },
        { defer: false },
    )
    .add(
        'Subjective with Logger',
        function(d) {
            stateSubjectiveLoger.update(f => f.updateFilterA, [
                { id: '1', name: 'test' + Math.random() },
                { id: '2', name: 'test2' + Math.random() },
            ]);
        },
        { defer: false },
    )
    .add(
        'BehaviorSubject',
        function(d) {
            const newState = {
                ...productStateBS,
                filter: {
                    ...productStateBS.filter,
                    a: [
                        { id: '1', name: 'test' + Math.random() },
                        { id: '2', name: 'test2' + Math.random() },
                    ],
                },
            };

            stateBehaviorSubject.next(newState);
        },
        { defer: false },
    )

    .add(
        'BehaviorSubject - mutations',
        function(d) {
            productStateBS.filter.a = [
                { id: '1', name: 'test' + Math.random() },
                { id: '2', name: 'test2' + Math.random() },
            ];

            stateBehaviorSubject.next(productStateBS);
        },
        { defer: false },
    )
    // add listeners
    .on('cycle', function(event) {
        console.log(String(event.target));
    })
    .on('complete', function() {
        console.log('Fastest is ' + this.filter('fastest').map('name'));
    })
    // run async
    .run();
