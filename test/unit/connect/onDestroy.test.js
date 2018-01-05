const test = require('ava')
const sinon = require('sinon')

const { createStore } = require('redux')
const connect = require('../../../src/connect')

test.beforeEach((t) => {
  const store = createStore((state) => state)

  t.context = { store }
})

test('should unsubscribe store upon destroy', (t) => {
  const { store } = t.context
  const unsubscribeStub = sinon.stub()
  const subscribeStub = sinon.stub(store, 'subscribe')
    .returns(unsubscribeStub);

  const newComponentDef = connect({})({})

  newComponentDef.onCreate({ store })
  newComponentDef.onDestroy()

  t.notThrows(() => {
    sinon.assert.calledOnce(unsubscribeStub)
  })
})

test('should call original onDestroy if exists', (t) => {
  const { store } = t.context
  const onDestroyStub = sinon.stub();

  const newComponentDef = connect({})({ onDestroy: onDestroyStub })

  newComponentDef.onCreate({ store })
  newComponentDef.onDestroy()

  t.notThrows(() => {
    sinon.assert.calledOnce(onDestroyStub)
  })
})
