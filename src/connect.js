const storeRegistry = require('./storeRegistry')

const DEFAULT_STORE_ID = '___default_store____'

function _wrapOnCreate (storeId, mapStateToInput, mapDispatchToComponent, onCreate) {
  return function wrappedOnCreate (input) {
    const store = storeRegistry.getStore(storeId)

    const { dispatch } = store

    this.__unsubscribeToStore = store.subscribe(() => {
      const input = this.input
      // handle updates
      Object.assign(input, mapStateToInput(store.getState()))
      this.onInput(input)
    })

    // apply current state to the input of onCreate
    Object.assign(input, mapStateToInput(store.getState()))

    // apply dispatch functions to the component for use
    Object.assign(this, mapDispatchToComponent(dispatch))

    if (onCreate) {
      onCreate.call(this, input)
    }
  }
}

function _wrapOnInput (storeId, mapStateToInput, onInput) {
  return function wrappedOnInput (input) {
    const store = storeRegistry.getStore(storeId)

    // apply current state to input
    Object.assign(input, mapStateToInput(store.getState()))

    if (onInput) {
      onInput.call(this, input)
    }
  }
}

/**
 * Higher order function for creating a function
 * for wrapping a marko component
 */
function connect (mapStateToInput, mapDispatchToComponent, options = {}) {
  const storeId = options.storeId || DEFAULT_STORE_ID

  const wrapCreateFunction = _wrapOnCreate.bind(
    null,
    storeId,
    mapStateToInput,
    mapDispatchToComponent
  )

  const wrapInputFunction = _wrapOnInput.bind(
    null,
    storeId,
    mapStateToInput
  )

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
