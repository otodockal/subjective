# Subjective
- type safety observable store which favors simple functions and immutable pattern for updating the state
- state as class
- immutable pattern - modern frameworks can take advantage of this (comparison by reference)
- group states in store (SubjectiveStore) or use separately (Subjective)
- subscribe to a whole state or part of it

## Examples
- [Angular](https://stackblitz.com/edit/subjective?file=app%2Fcore%2Fstores%2Fproduct%2Fproduct.state.ts)
- [Tests](test/subjective.test.ts)

## Credits
- ngrx
- redux
