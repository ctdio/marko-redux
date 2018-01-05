const test = require('ava')
const sinon = require('sinon')

const { createStore } = require('redux')
const connect = require('../../../src/connect')

const DEFAULT_STATE = 25

test.beforeEach((t) => {
  const store = createStore((state = DEFAULT_STATE) => state)

  t.context = { store }
})

test('should call mapStateToInput on dispatch', (t) => {
  const { store } = t.context

  const mapStateToInputStub = sinon.stub()
    .callsFake((state) => ({ count: state }))

  const newComponentDef = connect({
    mapStateToInput: mapStateToInputStub
  })({})

  newComponentDef.onCreate({ store })
  newComponentDef.input = {}

  t.notThrows(() => {
    sinon.assert.calledOnce(mapStateToInputStub)
  })

  store.dispatch({ type: 'some-type' })

  // this is called three times because onInput is called
  // on every dispatch
  t.notThrows(() => {
    sinon.assert.calledThrice(mapStateToInputStub)
  })
})

test('should apply mapDispatchToInput on dispatch', (t) => {
  const { store } = t.context

  const mapDispatchToInputStub = sinon.stub()
    .callsFake((dispatch) => ({ dispatch }))

  const newComponentDef = connect({
    mapDispatchToInput: mapDispatchToInputStub
  })({})

  newComponentDef.onCreate({ store })
  newComponentDef.input = {}

  t.notThrows(() => {
    sinon.assert.calledOnce(mapDispatchToInputStub)
  })

  store.dispatch({ type: 'some-type' })

  // this is called three times because onInput is called
  // on every dispatch
  t.notThrows(() => {
    sinon.assert.calledThrice(mapDispatchToInputStub)
  })
})
