'use strict'

const path = require('path')

const Publisher = require('./')
const conf = {
  masterKey: '0eafdb010975518a5b5bb12daeb8ac78d08646fa77023b5673d895c36c27d24c'
}

const publisher = new Publisher({
  directory: path.join(__dirname, 'cards'),
  db: path.join(__dirname, 'dbs'),
  name: 'dazaar-bfx-market-data-index',
  title: 'Bitfinex Terminal Candles/Trades Data Index',
  masterKey: conf.masterKey
})

publisher.start()
