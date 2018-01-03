function countReducer (state = 0, action) {
  switch (action.type) {
    case 'SET_COUNT':
      return action.data
    case 'INCREMENT':
      return state + 1
    case 'DECREMENT':
      return state - 1
    default:
      return state
  }
}

module.exports = countReducer
