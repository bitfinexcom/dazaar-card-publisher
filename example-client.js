'use strict'

const path = require('path')
const dazaar = require('dazaar')
const swarm = require('dazaar/swarm')

const Hyperbee = require('hyperbee')
const market = dazaar(path.join(__dirname, 'dbs', 'testDazaarIndex'))

const id = Buffer.from('801b0bf730a75641b2c09da81f16cb6bd639de1791da15cba6a30fde5870c94b', 'hex')

const buyer = market.buy(id, { sparse: false })

let db
buyer.on('feed', function () {
  console.log('got feed')

  db = new Hyperbee(buyer.feed, {
    valueEncoding: 'json',
    keyEncoding: 'utf8'
  })

  db.createReadStream().on('data', (d) => {
    console.log(d)
  })
})

swarm(buyer)
