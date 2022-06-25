const {
  createCurrencyService,
  CurrencyAlreadyExistsError,
  CurrencyNotFoundError,
} = require('../services/currencyService')

function createCurrencyController() {
  const currencyService = createCurrencyService()
  return {
    async find(ctx) {
      const currencies = await currencyService.find()
      ctx.body = { data: currencies }
      ctx.status = 200
    },

    async findOne(ctx) {
      try {
        const { code } = ctx.params
        const currency = await currencyService.findOne(code)
        ctx.body = { data: currency }
        ctx.status = 200
      } catch (err) {
        if (err instanceof CurrencyNotFoundError) {
          ctx.body = {
            data: null,
            error: err.message,
          }
          ctx.status = 404
        }
      }
    },

    async create(ctx) {
      try {
        const data = ctx.request.body
        const currency = await currencyService.create(data)
        ctx.body = { data: currency }
        ctx.status = 201
      } catch (err) {
        if (err instanceof CurrencyAlreadyExistsError) {
          ctx.body = {
            data: null,
            error: err.message,
          }
          ctx.status = 422
        }
      }
    },

    async update(ctx) {
      try {
        const { code } = ctx.params
        const data = ctx.request.body
        const currency = await currencyService.update(data, code)
        ctx.body = { data: currency }
        ctx.status = 200
      } catch (err) {
        if (err instanceof CurrencyNotFoundError) {
          ctx.body = {
            data: null,
            error: err.message,
          }
          ctx.status = 404
        }
      }
    },

    async delete(ctx) {
      try {
        const { code } = ctx.params
        await currencyService.delete(code)
        ctx.status = 200
      } catch (err) {
        if (err instanceof CurrencyNotFoundError) {
          ctx.body = {
            data: null,
            error: err.message,
          }
          ctx.status = 404
        }
      }
    },
  }
}

module.exports = { createCurrencyController }
