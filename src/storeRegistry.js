const stores = {}

function getStore (id) {
  return stores[id]
}

function setStore (id, store) {
  stores[id] = store
}

module.exports = {
  getStore,
  setStore
}
