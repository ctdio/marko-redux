const test = require('ava')

const { createStore } = require('redux')
const connect = require('../../../src/connect')

const STORE_ID = '___marko_redux_store___'

test.beforeEach((t) => {
  const store = createStore((input) => input)

  t.context = { store }
})

test('should throw error if store is not ' +
'passed to connected component via input or out.global', (t) => {
  const componentDef = connect({})({})
  const error = t.throws(() => componentDef.onCreate({}, { global: {} }))

  t.true(error.message.includes('Unable to retrieve store'))
})

test('should be able to fetch store from input', (t) => {
  const { store } = t.context
  const componentDef = connect({})({})
  t.notThrows(() => componentDef.onCreate({ store }))
})

test('should be able to fetch store from out.global', (t) => {
  const { store } = t.context
  const componentDef = connect({})({})
  t.notThrows(() => componentDef.onCreate({}, {
    global: {
      [ STORE_ID ]: store
    }
  }))
})
