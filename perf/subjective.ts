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
let subs = null;

// BehaviorSubject
const productStateBS = new ProductState();
const stateBehaviorSubject = new BehaviorSubject(productStateBS);

// add tests
const suite = new Benchmark.Suite();
suite
    .add(
        'Subjective',
        function(d) {
            // if (subs) subs.unsubscribe();

            // subs = stateSubjective
            //     .select(s => s.filter.a)
            //     .pipe(skip(1), observeOn(async))
            //     .subscribe(res => {
            //         d.resolve();
            //     });

            stateSubjective.update(f => f.updateFilterA, [
                { id: '1', name: 'test' + Math.random() },
                { id: '2', name: 'test2' + Math.random() },
            ]);
        },
        { defer: false },
    )

    .add(
        'BehaviorSubject',
        function(d) {
            // if (subs) subs.unsubscribe();

            // subs = stateBehaviorSubject
            //     .pipe(
            //         map(s => s.filter.a),
            //         distinctUntilChanged(),
            //         skip(1),
            //         observeOn(async),
            //     )
            //     .subscribe(() => {
            //         d.resolve();
            //     });

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
            // if (subs) subs.unsubscribe();
            // subs = stateBehaviorSubject
            //     .pipe(
            //         map(i => i.filter.a),
            //         // distinctUntilChanged(),     // NOTE: we can't because of mutations
            //         skip(1),
            //         observeOn(async),
            //     )
            //     .subscribe(() => {
            //         d.resolve();
            //     });

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
