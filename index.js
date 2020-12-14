'use strict'

const fs = require('fs')
const path = require('path')
const { promisify } = require('util')

const CreateCore = require('@bitfinex/create-free-dazaar-core')

const readFile = promisify(fs.readFile).bind(fs.readFile)
const readdir = promisify(fs.readdir).bind(fs.readdir)

class Publisher {
  constructor (opts) {
    const { db } = opts

    this.basePath = path.join(db, 'cards')

    this.db = null
    this.feed = null
    this.replication = null
    this.watcher = null
    this.conf = opts
  }

  async start () {
    const { masterKey, name, title } = this.conf

    const {
      card, db,
      replication, feed
    } = await CreateCore.createFreeCore(name, {
      masterKey,
      title,

      storageDir: this.basePath,
      hbeeOpts: {
        valueEncoding: 'json',
        keyEncoding: 'utf8'
      }
    })

    this.feed = feed
    this.db = db
    this.replication = replication

    await this.initCards()
    this.watch()

    this.printCard(card)

    return { card, db, feed, replication }
  }

  async stop () {
    const fclose = promisify(this.feed.close).bind(this.feed)
    const destroy = promisify(this.replication.destroy).bind(this.replication)

    await fclose()
    await destroy()

    this.watcher.close()
  }

  async initCards () {
    const { directory } = this.conf

    const batch = this.db.batch({ overwrite: false })

    const allFiles = await readdir(directory)
    for (const fname of allFiles) {
      if (path.extname(fname) !== '.json') {
        continue
      }

      const f = path.join(directory, fname)
      const c = await readFile(f, 'utf8')

      let cj
      try {
        cj = JSON.parse(c)
      } catch (e) {
        continue
      }

      await batch.put(fname, cj)
    }

    await batch.flush()
  }

  watch () {
    const { directory } = this.conf

    this.watcher = fs.watch(directory, async (type, fname) => {
      if (type !== 'rename') return

      const f = path.join(directory, fname)

      if (path.extname(f) !== '.json') {
        return
      }

      let c, cj
      try {
        c = await readFile(f, 'utf8')
        cj = JSON.parse(c)
      } catch (e) {
        if (e.code === 'ENOENT') {
          return
        }

        console.error(e)
        return
      }

      await this.db.put(fname, cj, { overwrite: false })
    })

    console.log('watching', directory, 'for changes')
  }

  printCard (card) {
    console.log(JSON.stringify(card, null, 2))
  }
}

module.exports = Publisher
