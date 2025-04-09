// app/Exceptions/CustomHttpException.js
const { HttpException } = require('@adonisjs/generic-exceptions')

export default class CustomHttpException extends Error {
  constructor(
    message: string,
    public status: number,
    public url: string
  ) {
    super(message)
    this.name = 'CustomHttpException'
  }

  async handle(error, { response, request }) {
    response.status(error.status).json({
      error: error.message,
      url: request.url(), // Include URL here
      code: error.code // Optional
    })
  }
}

module.exports = CustomHttpException