'use strict';

var STORE_ID = '___marko_redux_store___';

function _wrapOnCreate(options, onCreate) {
  var mapStateToInput = options.mapStateToInput,
      mapDispatchToInput = options.mapDispatchToInput,
      mapDispatchToComponent = options.mapDispatchToComponent;


  return function wrappedOnCreate(input, out) {
    var _this = this;

    // pull store from provider component
    var store = input.store || out.global[STORE_ID];

    if (!store) {
      throw new Error('Unable to retrieve store. Make sure ' + 'that connected components are being wrapped by a <provider> ' + 'and that the store is being properly passed in. ' + 'Ex: <provider store=input.store> CONTENTS HERE </provider>');
    }

    var dispatch = store.dispatch;

    // add store to component for later usage

    this.__store = store;

    this.__unsubscribeStore = store.subscribe(function () {
      var input = _this.input;

      // handle updates
      if (mapStateToInput) {
        Object.assign(input, mapStateToInput(store.getState()));
      }

      // apply dispatch functions to input
      if (mapDispatchToInput) {
        Object.assign(input, mapDispatchToInput(dispatch));
      }

      if (_this.onInput) {
        _this.onInput(input);
      }
    });

    // apply current state to the input of onCreate
    if (mapStateToInput) {
      Object.assign(input, mapStateToInput(store.getState()));
    }

    if (mapDispatchToComponent) {
      // apply dispatch functions to the component for use
      Object.assign(this, mapDispatchToComponent(dispatch));
    }

    if (onCreate) {
      onCreate.call(this, input, out);
    }
  };
}

function _wrapOnInput(options, onInput) {
  var mapStateToInput = options.mapStateToInput,
      mapDispatchToInput = options.mapDispatchToInput;


  return function wrappedOnInput(input, out) {
    var store = this.__store;
    var dispatch = store.dispatch;


    input.store = store;

    // apply current state to input
    if (mapStateToInput) {
      Object.assign(input, mapStateToInput(store.getState()));
    }

    // apply dispatch functions to input
    if (mapDispatchToInput) {
      Object.assign(input, mapDispatchToInput(dispatch));
    }

    if (onInput) {
      onInput.call(this, input, out);
    }
  };
}

/**
 * Higher order function for creating a function
 * for wrapping a marko component
 */
function connect(connectOptions) {
  var mapStateToInput = connectOptions.mapStateToInput,
      mapDispatchToInput = connectOptions.mapDispatchToInput,
      mapDispatchToComponent = connectOptions.mapDispatchToComponent,
      _connectOptions$optio = connectOptions.options,
      options = _connectOptions$optio === undefined ? {} : _connectOptions$optio;


  var wrapCreateFunction = _wrapOnCreate.bind(null, {
    mapStateToInput: mapStateToInput,
    mapDispatchToInput: mapDispatchToInput,
    mapDispatchToComponent: mapDispatchToComponent
  });

  var wrapInputFunction = _wrapOnInput.bind(null, {
    mapStateToInput: mapStateToInput,
    mapDispatchToInput: mapDispatchToInput
  });

  return function wrapComponentDefinition(componentDef) {
    var definition = typeof componentDef === 'function' ? componentDef.prototype : componentDef;

    var onCreate = definition.onCreate,
        onInput = definition.onInput,
        onDestroy = definition.onDestroy;


    definition.onCreate = wrapCreateFunction(onCreate);
    definition.onInput = wrapInputFunction(onInput);

    definition.onDestroy = function () {
      this.__unsubscribeStore();
      if (onDestroy) {
        onDestroy.call(this);
      }
    };

    return componentDef;
  };
}

module.exports = connect;