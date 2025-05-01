import Order from '#models/order'
import OrderStatus from '#models/order_status'
import { OrderStatusEnum } from '#shared/enums/OrderEnums'

export class OrderStatusService {
  /**
   * Create a new status for an order and mark it as the current status
   * All previous statuses will be marked as not current
   */
  async createStatus(
    orderId: number,
    status: OrderStatusEnum
  ): Promise<OrderStatus> {
    // Find the order
    const order = await Order.find(orderId)
    if (!order) {
      throw new Error(`Order with ID ${orderId} not found`)
    }

    // First, mark all existing statuses for this order as not current
    await OrderStatus.query()
      .where('orderId', orderId)
      .update({ isCurrent: false })

    // Create the new status
    const orderStatus = await OrderStatus.create({
      orderId,
      status,
      isCurrent: true
    })

    return orderStatus
  }

  /**
   * Get the current status of an order
   */
  async getCurrentStatus(orderId: number): Promise<OrderStatus | null> {
    return await OrderStatus.query()
      .where('orderId', orderId)
      .where('isCurrent', true)
      .first()
  }

  /**
   * Get all statuses for an order
   */
  async getStatusHistory(orderId: number): Promise<OrderStatus[]> {
    return await OrderStatus.query()
      .where('orderId', orderId)
      .orderBy('createdAt', 'asc')
  }
}

export default new OrderStatusService() 