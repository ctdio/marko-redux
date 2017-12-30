const STORE_ID = '___marko_redux_store___'

module.exports = {
  onCreate: function (input, out) {
    out.global[STORE_ID] = input.store
  }
}
