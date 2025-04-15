// app/Exceptions/CustomHttpException.js
import { HttpException } from '@adonisjs/generic-exceptions'

export default class CustomHttpException extends Error {
  constructor(
    message: string,
    public status: number = 400,
    public url?: string
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