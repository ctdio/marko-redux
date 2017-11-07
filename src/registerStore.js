const { setStore } = require('./storeRegistry')

const DEFAULT_STORE_ID = '___default_store____'

function registerStore (store, id = DEFAULT_STORE_ID) {
  if (!store) {
    throw new Error('Store must be an object')
  }
  setStore(id, store)
}

module.exports = registerStore
