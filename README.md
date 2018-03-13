# Subjective

*   Opinionated state management
*   Type safety by design
*   Selector functions
*   Update functions
*   Composition

## Concepts

### State

```typescript
// define new state
const state = new Subjective(
    new ProductState(), 
    new ProductStateFns(),
);
```

### Selector function

```typescript
// subscribe to state.filter.type
state.select(s => s.filter.type).subscribe(type => {
    console.log(type);
});
```

### Update function

```typescript
// change value of state.filter.type
state.update(f => f.updateFilterType, type);
```

## Usage

*   [Observable Service in Angular](#observable-service-in-angular)
*   Observable Store

## Examples

*   [Angular](https://stackblitz.com/edit/subjective?file=app%2Fcore%2Fstores%2Fproduct%2Fproduct.state.ts)
*   [Tests](test/subjective.test.ts)

![](./assets/v4.png)

## Observable Service in Angular

### Service & State

Service is @Injectable and contains a reference to the state and async methods (for communication with backend).
The state is instantiated as state property in Angular Service, but the whole state is defined together with **update functions** in xy.state.ts file.

*   core
    *   stores
        *   cart
            *   cart.service.ts
            *   cart.state.ts
        *   product
            *   product.service.ts
            *   product.state.ts

### Update state

Update state by using **update functions** inside update method of state instance.
Payload type is inferred from the update function.

```typescript
@Component({})
export class ProductDetailComponent {

    constructor(private _productService: ProductService) {}

    addLike(item: ProductItem) {
        this._productService.state.update(
            f => f.addLike,
            item
        );
    }
}
```

### Update state & return Last updated state

Sometimes it's handy to have a snapshot of last updated state.
Update method returns a snapshot of last updated state.

```typescript
@Component({})
export class FilterTypeComponent {
    
    @Output() search = new EventEmitter<Filter>();

    constructor(private _productService: ProductService) {}

    filter(type: FilterType) {
        // update filter type & get last updated state
        const lastUpdatedState = this._productService.state.update(
            f => f.replaceFilterType,
            type,
        );
        // search by filter
        this.search.emit(lastUpdatedState.filter);
    }
}
```

### Subscribe to a state

Subscribe to a particular key of the state defined by **selector function** in select method and return value of the key.

```typescript
@Component({
    selector: 'app-list',
    template: `
        <ul>
            <li *ngFor="let item of items | async">
                {{item.name}}
            </li>
        </ul>
    `,
})
export class ListComponent {
    
    items = this._productService.state.select(
        s => s.items
    );

    constructor(private _productService: ProductService) {}
}
```

### Subscribe to a state & return whole state

Sometimes you need to react to changes of a particular key of the state and get the whole state.
By using the second argument in the select method, you can get the whole state in subscribe callback.

```typescript
@Component({
    selector: 'app-list',
    template: `
        <ng-container *ngIf="state | async as state">
            <ng-container *ngIf="state.isLoading; else items">
                loading...
            </ng-container>
            <ng-template #items>
                <h2>{{state.type}}</h2>
                <ul>
                    <li *ngFor="let item of state.items">
                        {{item.name}}
                    </li>
                </ul>
            </ng-template>
        </ng-container>
    `,
})
export class ListComponent {

    state = merge(
        this._productService.state
            .select(s => s.items, true),
        this._productService.state
            .select(s => s.isLoading, true);
    )

    constructor(private _productService: ProductService) {}
}
```

### Snapshot

Get a snapshot of the last changed state. You can't be subscribed to it.
Should be used rarely.

### Initial State

Get the initial state of the state.
It gets handy when you need to reset particular part of the state.

## NOTES

### Immutable pattern

Always use [immutable pattern](https://glimmerjs.com/guides/tracked-properties) otherwise it will not work. We can't rely on mutations since object reference is always the same.

### Type-safety

Types are always inferred either from state class or payload parameter of the update function.

## Credits

*   [RxJS](https://github.com/ReactiveX/rxjs)
*   [ngrx](https://github.com/ngrx/platform)
*   [Redux](https://github.com/reactjs/redux)
