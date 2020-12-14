/* eslint-env mocha */

'use strict'

const assert = require('assert')
const path = require('path')
const fs = require('fs')

const rimraf = require('rimraf')

const Publisher = require('../')

const wait = (t) => {
  return new Promise((resolve) => {
    setTimeout(resolve, t)
  })
}

const conf = {
  masterKey: '0eafdb010975518a5b5bb12daeb8ac78d08646fa77023b5673d895c36c27d24c'
}

const dbDir = path.join(__dirname, 'tmp')
const cards = path.join(__dirname, 'cards')

const opts = {
  directory: cards,
  db: dbDir,
  name: 'dazaar-test-index',
  title: 'Test Data Index',
  masterKey: conf.masterKey
}

describe('publishing cards', () => {
  beforeEach(() => {
    rimraf.sync(dbDir)
    rimraf.sync(cards)

    fs.mkdirSync(cards, { recursive: true })
    fs.writeFileSync(path.join(cards, 'foo.aaa_bbb.json'), '{ "id": "deadbeef" }')
  })

  afterEach(() => {
    rimraf.sync(dbDir)
    rimraf.sync(cards)
  })

  it('adds directory content to db', async () => {
    const publisher = new Publisher(opts)

    const { db } = await publisher.start()

    const { value } = await db.get('foo.aaa_bbb.json')
    assert.strictEqual(value.id, 'deadbeef')

    fs.writeFileSync(path.join(cards, 'invalid2.json'), '{ "id" }')
    await wait(3)

    fs.writeFileSync(path.join(cards, 'blerg.test.json'), '{ "id": "f00" }')
    await wait(50)

    const entry2 = await db.get('blerg.test.json')
    assert.strictEqual(entry2.value.id, 'f00')

    await publisher.stop()
  }).timeout(20000)
})
