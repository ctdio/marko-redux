# marko-redux

Simple [redux](https://redux.js.org/) bindings for [marko](https://github.com/markojs/marko),
inspired by [react-redux](https://github.com/reactjs/react-redux). You check out an example
project [here](https://github.com/charlieduong94/marko-redux-example).

**NOTE:** This module is still under development, the API is _not_ stable yet and
is subject to change.

### Installation

```bash
npm i marko-redux
```

### API

`marko-redux` exposes a few functions to facilitate the use of `redux` in your project.
At the moment, there are only two functions exposed by the module, `registerStore` and `connect`.

##### `registerStore(store [, storeId])`

The `registerStore` function is what is used to link your `redux` store to your _container components_.
If you are not familiar the concept of container components and presentational components,
check out [this article](https://medium.com/@dan_abramov/smart-and-dumb-components-7ca2f9a7c7d0)
(many concepts from `react` carry over to `marko` nicely 😄).

Your `redux` store is the first argument that is passed to the function. Additionally, you can pass in a
`storeId` as the second argument if needed. The `storeId` can be used when calling the `connect` function
to specify _which_ data store to use (if your application has multiple stores). If not specified,
a default `storeId` will be used to register the store.

Example usage:

```js
// application entry point
const { createStore } = require('redux')
const { registerStore } = require('marko-redux')
const App = require('./containers/app')

const reducers = require('./reducers')

const store = createStore(reducers)

// register the store before rendering
registerStore(store)

// render the app here
const containerEl = document.getElementById('app')

App.renderSync()
  .appendTo(containerEl)
```

##### `connect(connectOptions)`

`connect` is a higher order function for binding your store to your components.
The function only accepts a single argument, an object containing
information about how you want the store to interact with the container.

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
      count: input.count
    }
  }

  // map input to container state
  // NOTE: this is needed to ensure that
  // the template defined by this container
  // is updated based on changes to the redux store
  onInput (input) {
    this.state.count = input.count
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

### How it works

The _store_ that is created by `redux` is placed in a simple registry managed
under the hood by `marko-redux` via the `registerStore` function.

`connect` wraps the component's `onCreate`, `onInput`, and `onDestroy` methods,
to allow for the redux store to be bound to the component.
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

### Differences from `react-redux`

- No `Provider` component for automatically passing down your store to all child components.
    - `marko` currently does not have the concept of _context_ that can be passed downwards.
    At the moment, this is handled by using `registerStore`.
- No support for server side rendering (yet).
    - Since there's no support for context that trickles to all child components,
      there's no good way to allow for stores to be passed downwards without
      using `registerStore`, which has side effects that are not ideal
      for server side rendering. This can be circumvented by just manually
      passing down the store to all of the components that need it (with some tweaks
      to `marko-redux`)
