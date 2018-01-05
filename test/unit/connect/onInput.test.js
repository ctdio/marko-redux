const test = require('ava')
const sinon = require('sinon')

const { createStore } = require('redux')
const connect = require('../../../src/connect')

const DEFAULT_STATE = 25

test.beforeEach((t) => {
  const store = createStore((state = DEFAULT_STATE) => state)

  t.context = { store }
})

test('should create call original onInput if it exists', (t) => {
  const { store } = t.context
  const onInputStub = sinon.stub()

  const input = {}
  const out = {}

  const newComponentDef = connect({})({
    onInput: onInputStub
  })

  newComponentDef.onCreate({ store })
  newComponentDef.onInput(input, out)

  t.notThrows(() => {
    sinon.assert.calledOnce(onInputStub)
    sinon.assert.calledWith(onInputStub, input, out)
  })
})

test('should apply mapStateToInput if provided', (t) => {
  const { store } = t.context

  const mapStateToInputStub = sinon.stub()
    .callsFake((state) => ({ count: state }))

  const newComponentDef = connect({
    mapStateToInput: mapStateToInputStub
  })({})

  newComponentDef.onCreate({ store })

  t.notThrows(() => {
    sinon.assert.calledOnce(mapStateToInputStub)
  })

  const input = {}
  newComponentDef.onInput(input)

  t.notThrows(() => {
    sinon.assert.calledTwice(mapStateToInputStub)
  })

  t.is(input.count, DEFAULT_STATE)
})

test('should apply mapDispatchToInput if provided', (t) => {
  const { store } = t.context

  const mapDispatchToInputStub = sinon.stub()
    .callsFake((dispatch) => ({ dispatch }))

  const newComponentDef = connect({
    mapDispatchToInput: mapDispatchToInputStub
  })({})

  newComponentDef.onCreate({ store })
  t.notThrows(() => {
    sinon.assert.calledOnce(mapDispatchToInputStub)
  })

  const input = {}
  newComponentDef.onInput(input)

  t.notThrows(() => {
    sinon.assert.calledTwice(mapDispatchToInputStub)
  })

  t.is(input.dispatch, store.dispatch)
})
