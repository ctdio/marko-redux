# marko-redux

Simple [redux](https://redux.js.org/) bindings for [marko](https://github.com/markojs/marko),
inspired by [react-redux](https://github.com/reactjs/react-redux). You check out an example
project [here](https://github.com/charlieduong94/marko-redux-example).

### Installation

```bash
npm i marko-redux
```

### Why `marko-redux`?

Because I like `marko` and I like `redux`. `redux` is view layer agnostic,
well supported, easy to learn, and easy to test. `react-redux` makes
using `redux` easy, it removes the boilerplate and pain of having to pass down your store
to all components to that care about it. This module aims to do the same for `marko`.

### Why not `marko-redux`?

Depending on the scope of your application, you might not even need `marko-redux`.
Apps with relatively simple state will do fine using only a root component's local state.
The `SAV Architecture` described
[here](https://github.com/marko-js-samples/todomvc-marko-lasso-express#the-sav-architecture)
will also manage state just fine for small apps that require a little more structure.
[This blog post](https://medium.com/@dan_abramov/you-might-not-need-redux-be46360cf367)
should help explain things.

### The API

This module exposes a `<provider>` component and a
`connect` function for integrating with `redux`.

##### `<provider>`

The `<provider>` component is a wrapper component that should used at
the root of an application. It is used to pass down the input `redux store`
to all components defined using the `connect` function.
A `store` can be passed to it via the `store` attribute.

Example Usage:
```marko
provider store=input.store
  // other components go here
```

Much like how `redux` recommends only having a single
`store` in your application, you should only have a single `<provider>`
(_beware:_ using more than one can end up causing unexpected behavior).

##### `connect(connectOptions)`

`connect` is a higher order function for binding your `store` to your container components.
A `store` can be passed down to connected components via the `provider` component
(as explained above).
The function accepts a single argument, an object containing
information about how you want the `store` to interact with the container.

Here are the available fields you can specify for `connectOptions`:
- `mapStateToInput(state)` - a function expecting the store's `state` to be passed in as the first argument.
An object mapping how the `state` should be mapped to the component's input should be returned.
- `mapDispatchToInput(dispatch)` - a function expecting the store's `dispatch` function to be passed in.
An object mapping how action dispatch functions should be mapped to the component's input should be returned.
- `mapDispatchToComponent(dispatch)` - an alternative to the above `mapDispatchToInput` function.
This function instead exposes action dispatch functons to the component itself.
- `options` - an additional configuration object that can contain the following fields
    - `storeId` - the id of the store to use (registered via the `registerStore` function defined above.
    If not specified, the default `storeId` will be used.

All of the above fields are _optional_, however it is recommended that `mapInputToState`
and either `mapDispatchToInput` or `mapDispatchToComponent` are specified. This allows
for `redux` to be used in full effect.

`connect` will return a function that can be used for binding the configuration
to a component's definition.

That function accepts the component definition as the only argument.

It is recommended that `connected` components

Example usage:
```js
const { connect } = require('marko-redux')

// pull in actions
const {
  increment,
  decrement,
  setCount
} = require('../../actions/counterActions')

// define marko component
class CounterContainer {
  onCreate (input) {
    // initialize container's state
    this.state = {
      count: input.count // derived from store's state
    }
  }

  // map input to container state
  // NOTE: this is needed to ensure that
  // the template defined by this container
  // is updated based on changes to the redux store
  onInput (input) {
    this.state.count = input.count // derived from store state
  }
}

// maps redux store state to the component's input
function mapStateToInput (state) {
  return {
    // component.input.count will equal redux.getState().count
    count: state.count
  }
}

// maps actions dispatch functions to
// methods that will be defined on the component
function mapDispatchToComponent (dispatch) {
  return {
    increment: () => dispatch(increment()),
    decrement: () => dispatch(decrement())
  }
}

// connects the marko-redux configuration to
// the component definition. The result is exported
// to be used by marko
module.exports = connect({
  mapStateToInput,
  mapDispatchToComponent
})(CounterContainer)
```

The container's template:
```marko
label -- count: ${state.count}

// clicking these buttons will call
// the dispatch functions exposed by
// `mapDispatchToComponent`
button onClick('increment') -- increment
button onClick('decrement') -- decrement
```

The root component using the container:

```marko
// provider will pass down store to counter-container
provider store=input.store
  counter-container
```

### How it works

The `<provider>` attaches the input `store` to the async `out` object that is used
by `marko` to render components for the first time. Components defined with
the `connect` function will pull the store from `out`.

`connect` wraps the component's `onCreate`, `onInput`, and `onDestroy` methods,
to allow for the `redux store` to be bound to the component (via the `<provider>` component).
If `mapDispatchToComponent` is provided, then the functions exposed by it will be
mapped to the component's definition.

When the component is created, it is automatically registered to the store via
`store.subscribe`. As changes happen, either from new input being passed to the component
or events coming from the store, the component's `onInput` will be invoked.
The `mapStateToInput` and `mapDispatchToInput` functions will then be applied to the input.

Those values that are mapped to the input can be passed down to child components like normal.

When a dispatch function sends out an action and the store's state changes, the component will
react to the change.

When the component is destroyed, it is subsequently unsubscribed from the `redux` store.
