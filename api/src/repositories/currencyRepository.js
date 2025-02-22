const { createClient } = require('redis')

const env = process.env.NODE_ENV || 'development'
const host = process.env.REDIS_HOST
const port = process.env.REDIS_PORT
const databaseNumber = {
  development: 0,
  production: 1,
  test: 2,
}
const database = databaseNumber[env]
const client = createClient({ socket: { host, port }, database })
client.connect()

function createCurrencyRepository() {
  const prefix = 'currency'
  return {
    async add(data) {
      await client.set(`${prefix}:${data.code}`, JSON.stringify(data))
      const { code } = data
      const currency = await this.get(code)

      return currency
    },

    async get(code) {
      const data = await client.get(`${prefix}:${code}`)
      const currency = JSON.parse(data)

      return currency
    },

    async getAll() {
      const getAllCurrenciesKeys = async () => {
        const keys = []
        for await (const key of client.scanIterator({
          MATCH: `${prefix}:*`,
          COUNT: 500,
        })) {
          keys.push(key)
        }

        return keys
      }

      const keys = await getAllCurrenciesKeys()
      if (keys.length === 0) {
        return []
      }
      const data = await client.sendCommand(['MGET', ...keys])
      const currencies = data.map((d) => JSON.parse(d))

      return currencies
    },

    async update(data) {
      const { code } = data
      const oldCurrency = await this.get(code)
      const currency = await this.add({ ...oldCurrency, ...data })

      return currency
    },

    async remove(code) {
      return client.del(`${prefix}:${code}`)
    },

    async removeAll() {
      const allCurrencies = await this.getAll()
      const removals = allCurrencies.map((currency) =>
        this.remove(currency.code)
      )

      return Promise.all(removals)
    },
  }
}

module.exports = { createCurrencyRepository }
