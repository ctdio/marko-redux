const test = require('ava')
const { mount } = require('enzo')

const { createStore, combineReducers } = require('redux')
const countReducer = require('./fixtures/reducers/count')

const {
  increment,
  decrement,
  setCount
} = require('./fixtures/actions/count')

const appPath =
  require.resolve('./fixtures/components/test-app/index.marko')

test.beforeEach(async (t) => {
  const reducer = combineReducers({ count: countReducer  })
  const store = createStore(reducer)

  const { component: app } = await mount(appPath, { store })
  const counter = app.getComponent('counter')

  t.context = { app, counter, store }
})

test.afterEach((t) => {
  const { app } = t.context
  app.destroy()
})

test('counter should react to store changes', (t) => {
  const { counter, store } = t.context
  let currentCount = counter.state.count

  // increment
  store.dispatch(increment())
  t.is(counter.state.count, currentCount + 1)
  currentCount = counter.state.count

  // decrement
  store.dispatch(decrement())

  t.is(counter.state.count, currentCount - 1)

  const targetCount = 25
  // setCount
  store.dispatch(setCount(targetCount))

  t.is(counter.state.count, targetCount)
})

test('counter should have access to dispatch functions ' +
'via mapDispatchToInput', (t) => {
  const { counter, store } = t.context
  let currentCount = counter.state.count

  // increment
  counter.input.increment()
  t.is(counter.state.count, currentCount + 1)
  currentCount = counter.state.count

  // decrement
  counter.input.decrement()

  t.is(counter.state.count, currentCount - 1)

  const targetCount = 25
  // setCount
  counter.input.setCount(targetCount)

  t.is(counter.state.count, targetCount)
})

test('counter should have access to dispatch functions ' +
'via mapDispatchToComponent', (t) => {
  const { counter, store } = t.context
  let currentCount = counter.state.count

  // increment
  counter.increment()
  t.is(counter.state.count, currentCount + 1)
  currentCount = counter.state.count

  // decrement
  counter.decrement()

  t.is(counter.state.count, currentCount - 1)

  const targetCount = 25
  // setCount
  counter.setCount(targetCount)

  t.is(counter.state.count, targetCount)
})
