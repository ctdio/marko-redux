const storeRegistry = require('./storeRegistry')

const DEFAULT_STORE_ID = '___default_store____'

function _wrapOnCreate (options, onCreate) {
  const {
    storeId,
    mapStateToInput,
    mapDispatchToInput,
    mapDispatchToComponent
  } = options

  return function wrappedOnCreate (input) {
    const store = storeRegistry.getStore(storeId)

    const { dispatch } = store

    this.__unsubscribeToStore = store.subscribe(() => {
      const input = this.input
      // handle updates
      if (mapStateToInput) {
        Object.assign(input, mapStateToInput(store.getState()))
      }

      // apply dispatch functions to input
      if (mapDispatchToInput) {
        Object.assign(input, mapDispatchToInput(dispatch))
      }

      this.onInput(input)
    })

    // apply current state to the input of onCreate
    if (mapStateToInput) {
      Object.assign(input, mapStateToInput(store.getState()))
    }

    if (mapDispatchToComponent) {
      // apply dispatch functions to the component for use
      Object.assign(this, mapDispatchToComponent(dispatch))
    }

    if (onCreate) {
      onCreate.call(this, input)
    }
  }
}

function _wrapOnInput (options, onInput) {
  const {
    storeId,
    mapStateToInput,
    mapDispatchToInput
  } = options

  return function wrappedOnInput (input) {
    const store = storeRegistry.getStore(storeId)
    const { dispatch } = store

    // apply current state to input
    if (mapStateToInput) {
      Object.assign(input, mapStateToInput(store.getState()))
    }

    // apply dispatch functions to input
    if (mapDispatchToInput) {
      Object.assign(input, mapDispatchToInput(dispatch))
    }

    if (onInput) {
      onInput.call(this, input)
    }
  }
}

/**
 * Higher order function for creating a function
 * for wrapping a marko component
 */
function connect (connectOptions) {
  const {
    mapStateToInput,
    mapDispatchToInput,
    mapDispatchToComponent,
    options = {}
  } = connectOptions

  const storeId = options.storeId || DEFAULT_STORE_ID

  const wrapCreateFunction = _wrapOnCreate.bind(null, {
    storeId,
    mapStateToInput,
    mapDispatchToInput,
    mapDispatchToComponent
  })

  const wrapInputFunction = _wrapOnInput.bind(null, {
    storeId,
    mapStateToInput,
    mapDispatchToInput
  })

  return function wrapComponentDefinition (componentDef) {
    const definition = typeof componentDef === 'function' ?
      componentDef.prototype :
      componentDef

    const { onCreate, onInput, onDestroy } = definition

    definition.onCreate = wrapCreateFunction(onCreate)
    definition.onInput = wrapInputFunction(onInput)

    definition.onDestroy = function () {
      this.__unsubscribeStore()
      onDestroy.call(this)
    }

    return componentDef
  }
}

module.exports = connect
