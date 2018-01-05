const test = require('ava')
const sinon = require('sinon')

const { createStore } = require('redux')
const connect = require('../../../src/connect')

test.beforeEach((t) => {
  const store = createStore((state) => state)

  t.context = { store }
})

test('should accept a class', (t) => {
  const { store } = t.context

  const onCreateStub = sinon.stub()
  const onInputStub = sinon.stub()
  const onDestroyStub = sinon.stub()

  const input = { store }
  const out = {}

  class SomeClass {
    onCreate (input, out) {
      onCreateStub(input, out)
    }

    onInput (input, out) {
      onInputStub(input, out)
    }

    onDestroy (input, out) {
      onDestroyStub(input, out)
    }
  }
  const newComponentDef = connect({})(SomeClass)
  const { prototype: proto } = newComponentDef

  proto.onCreate(input, out)
  proto.onInput(input, out)
  proto.onDestroy()

  t.notThrows(() => {
    sinon.assert.calledOnce(onCreateStub)
    sinon.assert.calledWith(onCreateStub, input, out)

    sinon.assert.calledOnce(onInputStub)
    sinon.assert.calledWith(onInputStub, input, out)

    sinon.assert.calledOnce(onDestroyStub)
  })
})
