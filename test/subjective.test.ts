import { Subjective, SubjectiveStore } from '../src/subjective';
import { Observable, Subscription } from 'rxjs';

// Example #1
class MySimpleState {
    one = 1;
    two = 2;
}
function updateOne(state: MySimpleState) {
    return {
        ...state,
        one: state.one + 1,
    };
}

// Example #2
type FilterStateType = 'red' | 'blue' | 'green';

class FilterState {
    query = '';
    types: FilterStateType[] = [];
}

function setQuery(state: FilterState, query: string) {
    return {
        ...state,
        query,
    };
}

function addType(state: FilterState, type: FilterStateType) {
    return {
        ...state,
        types: [...state.types, type],
    };
}

function setType(state: FilterState, type: FilterStateType) {
    return {
        ...state,
        types: [type],
    };
}

function deleteType(state: FilterState, type: FilterStateType) {
    return {
        ...state,
        types: state.types.filter(item => item !== type),
    };
}

// declare list of stores for your subjectiveStore
export const listOfStates = [MySimpleState, FilterState];

describe('subjectiveStore test', () => {
    it('should select MyStore', () => {
        const subjectiveStore = new SubjectiveStore(listOfStates);
        const state = subjectiveStore.select(MySimpleState);
        expect(state.snapshot).toEqual({ one: 1, two: 2 });
    });

    it('should select FilterStore', () => {
        const subjectiveStore = new SubjectiveStore(listOfStates);
        const state = subjectiveStore.select(FilterState);
        expect(state.snapshot).toEqual({
            query: '',
            types: [],
        });
    });

    it('should update MyStore without action value', () => {
        const subjectiveStore = new SubjectiveStore(listOfStates);
        const state = subjectiveStore.select(MySimpleState);

        expect(state.snapshot).toEqual({ one: 1, two: 2 });

        state.dispatch(updateOne);

        expect(state.snapshot).toEqual({ one: 2, two: 2 });
    });

    it('should return key of the state', done => {
        const subjectiveStore = new SubjectiveStore(listOfStates);
        const state = subjectiveStore.select(MySimpleState);

        expect(state.snapshot).toEqual({ one: 1, two: 2 });

        state.key$('one').subscribe(res => {
            expect(res).toBe(1);
            done();
        });
    });

    it('should listen key of the state and return whole state', done => {
        const subjectiveStore = new SubjectiveStore(listOfStates);
        const state = subjectiveStore.select(MySimpleState);

        expect(state.snapshot).toEqual({ one: 1, two: 2 });

        state.key$('one', true).subscribe(res => {
            expect(res).toEqual({ one: 1, two: 2 });
            done();
        });
    });

    it('should return initial state after update', () => {
        const subjectiveStore = new SubjectiveStore(listOfStates);
        const state = subjectiveStore.select(MySimpleState);
        expect(state.snapshot).toEqual({ one: 1, two: 2 });

        state.dispatch(updateOne);

        expect(state.snapshot).toEqual({ one: 2, two: 2 });

        expect(state.initialState).toEqual({ one: 1, two: 2 });
    });

    it('should combine stores', () => {
        const subjectiveStore = new SubjectiveStore(listOfStates);
        const state = subjectiveStore.select(FilterState);
        const state1 = subjectiveStore.select(MySimpleState);

        const obs = Observable.combineLatest(
            state.$.skip(1),
            state1.$.skip(1),
        ).subscribe(([val1, val2]) => {
            expect(val1).toEqual({
                query: 'oto',
                types: [],
            });
            expect(val2).toEqual({ one: 2, two: 2 });
            obs.unsubscribe();
        });

        state.dispatch(setQuery, 'oto');
        state1.dispatch(updateOne);
    });

    it('should combine stores and pick only particular part of a store', done => {
        const subjectiveStore = new SubjectiveStore(listOfStates);
        const state = subjectiveStore.select(FilterState);
        const state1 = subjectiveStore.select(MySimpleState);

        const obs = Observable.combineLatest(
            state.$.skip(1).map(item => item.query),
            state1.$.skip(1).map(item => item.one),
        ).subscribe(res => {
            expect(res).toEqual(['oto', 2]);
            obs.unsubscribe();
            done();
        });

        state.dispatch(setQuery, 'oto');
        state1.dispatch(updateOne);
    });

    it('should add / delete type', () => {
        const subjectiveStore = new SubjectiveStore(listOfStates);
        const state = subjectiveStore.select(FilterState);

        state.dispatch(addType, 'red');
        state.dispatch(addType, 'green');

        expect(state.snapshot.types).toEqual(['red', 'green']);

        state.dispatch(deleteType, 'red');

        expect(state.snapshot.types).toEqual(['green']);
    });

    it('should only use Subjective', () => {
        const state = new Subjective(new MySimpleState());

        state.dispatch(updateOne);

        expect(state.snapshot.one).toBe(2);
    });
});
