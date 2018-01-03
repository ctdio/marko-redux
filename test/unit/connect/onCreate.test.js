const test = require('ava')
const sinon = require('sinon')

const { createStore } = require('redux')
const connect = require('../../../src/connect')

const STORE_ID = '___marko_redux_store___'

const defaultState = { count: 25 }

function reducer (state = defaultState) {
  return state
}

test.beforeEach((t) => {
  const store = createStore(reducer)

  t.context = { store }
})

test('should apply mapStateToInput upon onCreate', (t) => {
  const { store } = t.context

  const onCreateStub = sinon.stub()

  const newComponentDef = connect({
    mapStateToInput: (state) => state
  })({ onCreate: onCreateStub })

  newComponentDef.onCreate({ store })

  t.notThrows(() => {
    sinon.assert.calledOnce(onCreateStub)
    sinon.assert.calledWith(onCreateStub, {
      store,
      ...defaultState
    })
  })
})

test('should apply mapDispatchToComponent upon onCreate', (t) => {
  const { store } = t.context

  const newComponentDef = connect({
    mapDispatchToComponent: (dispatch) => ({ dispatch })
  })({})

  newComponentDef.onCreate({ store })
  t.is(newComponentDef.dispatch, store.dispatch)
})

test('should subscribe store upon create', (t) => {
  const { store } = t.context

  const storeSpy = sinon.spy(store, 'subscribe')

  const newComponentDef = connect({})({})
  newComponentDef.onCreate({ store })

  t.notThrows(() => {
    sinon.assert.calledOnce(storeSpy)
  })
})

test('should add the store to the component', (t) => {
  const { store } = t.context

  const storeSpy = sinon.spy(store, 'subscribe')

  const newComponentDef = connect({})({})
  newComponentDef.onCreate({ store })

  t.is(newComponentDef.__store, store)
})
