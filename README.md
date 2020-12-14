# dazaar-card-publisher

Watches a directory for Dazaar Cards and publishes them on a Dazaar Hyperbee stream

## Usage

You can see server usage in [example-server.js](example-server.js) and [example-client.js](example-client.js)

```js
const Publisher = require('@bitfinex/dazaar-card-publisher')

const publisher = new Publisher({
  directory: path.join(__dirname, 'cards'),
  db: path.join(__dirname, 'dbs'),
  name: 'dazaar-bfx-market-data-index',
  title: 'Bitfinex Terminal Candles/Trades Data Index',
  masterKey: 'deadbeef'
})

await publisher.start()
```

To create JSON cards from a stream, take a look at [create-cards-from-db.js](create-cards-from-db.js)

## API

### new Publisher(opts)

  - `opts <Object>`
    - `directory <String>` Directory to watch for new JSON cards
    - `db <String>` Dazaar/Hyperbee database directory, will create a `cards` directory in it
    - `name <String>` Unique name, used for key generation
    - `title <String>` Title used for the created Dazaar card
    - `masterKey <String>` The masterkey used for key derivation


### start() => `<Promise>` => `<undefined>`

Starts the server

### stop() => `<Promise>` => `<undefined>`

Stops the server
