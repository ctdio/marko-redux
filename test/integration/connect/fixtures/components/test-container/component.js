const connect = require('../../../../../../src/connect')

const {
  increment,
  decrement,
  setCount
} = require('../../actions/count')

class CounterContainer {
  onCreate (input, out) {
    this.state = {
      count: input.count
    }
  }

  onInput (input, out) {
    this.state.count = input.count
  }
}

function mapStateToInput (state) {
  return {
    count: state.count
  }
}

function mapDispatchToComponent (dispatch) {
  return {
    increment: () => dispatch(increment()),
    decrement: () => dispatch(decrement()),
    setCount: (input) => dispatch(setCount(input))
  }
}

function mapDispatchToInput (dispatch) {
  return {
    increment: () => dispatch(increment()),
    decrement: () => dispatch(decrement()),
    setCount: (input) => dispatch(setCount(input))
  }
}

module.exports = connect({
  mapStateToInput,
  mapDispatchToComponent,
  mapDispatchToInput
})(CounterContainer)
