import type { HttpContext } from '@adonisjs/core/http'
import Courier from '#models/courier'

export class CourierController {
  async getAllCouriers({ response }: HttpContext) {
    // TODO: Implement database query
    return response.json([])
  }

  async acceptOrder({ request, response }: HttpContext) {
    const id = request.param('id')
    const { courierId } = request.body()
    // TODO: Implement order acceptance
    return response.json({})
  }
} 