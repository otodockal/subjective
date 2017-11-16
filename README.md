# Subjective
- type safety observable store which favors simple functions and immutable pattern for updating the state
- classes as a state storage since classes have a type
- immutable pattern - modern frameworks can take advantage of this (comparison by reference)
- group your stores (SubjectiveStore) or use separately (Subjective)
- type inference works!
- subscribe to a whole state or part of it

## Examples
- [Angular 5](https://stackblitz.com/edit/subjective?file=app%2Fproduct.state.ts)
- [Tests](test/termix.test.ts)

## Credits
- ngrx
- redux
