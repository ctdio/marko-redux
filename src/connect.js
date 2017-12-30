const STORE_ID = '___marko_redux_store___'

function _wrapOnCreate (options, onCreate) {
  const {
    mapStateToInput,
    mapDispatchToInput,
    mapDispatchToComponent
  } = options

  return function wrappedOnCreate (input, out) {
    // pull store from provider component
    const store = input.store || out.global[STORE_ID]

    if (!store) {
      throw new Error('Unable to retrieve store. Make sure ' +
        'that connected components are being wrapped by a <provider> ' +
        'and that the store is being properly passed in. ' +
        'Ex: <provider store=input.store> CONTENTS HERE </provider>')
    }

    const { dispatch } = store

    // add store to component for later usage
    this.__store = store

    this.__unsubscribeStore = store.subscribe(() => {
      const input = this.input

      // handle updates
      if (mapStateToInput) {
        Object.assign(input, mapStateToInput(store.getState()))
      }

      // apply dispatch functions to input
      if (mapDispatchToInput) {
        Object.assign(input, mapDispatchToInput(dispatch))
      }

      if (this.onInput) {
        this.onInput(input)
      }
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
      onCreate.call(this, input, out)
    }
  }
}

function _wrapOnInput (options, onInput) {
  const {
    mapStateToInput,
    mapDispatchToInput
  } = options

  return function wrappedOnInput (input, out) {
    const store = this.__store
    const { dispatch } = store

    input.store = store

    // apply current state to input
    if (mapStateToInput) {
      Object.assign(input, mapStateToInput(store.getState()))
    }

    // apply dispatch functions to input
    if (mapDispatchToInput) {
      Object.assign(input, mapDispatchToInput(dispatch))
    }

    if (onInput) {
      onInput.call(this, input, out)
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

  const wrapCreateFunction = _wrapOnCreate.bind(null, {
    mapStateToInput,
    mapDispatchToInput,
    mapDispatchToComponent
  })

  const wrapInputFunction = _wrapOnInput.bind(null, {
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
      if (onDestroy) {
        onDestroy.call(this)
      }
    }

    return componentDef
  }
}

module.exports = connect
