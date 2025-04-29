import OrderItemStatus from '#models/order_item_status'
import OrderItem from '#models/order_item'
import { OrderItemStatusEnum } from '#shared/enums/OrderItemEnums'

export class OrderItemStatusService {
  /**
   * Create a new status for an order item and mark it as the current status
   * All previous statuses will be marked as not current
   */
  async createStatus(
    orderItemId: number,
    status: OrderItemStatusEnum,
    notes?: string,
    updatedBy?: number
  ): Promise<OrderItemStatus> {
    // Find the order item
    const orderItem = await OrderItem.find(orderItemId)
    if (!orderItem) {
      throw new Error(`Order item with ID ${orderItemId} not found`)
    }

    // First, mark all existing statuses for this order item as not current
    await OrderItemStatus.query()
      .where('orderItemId', orderItemId)
      .update({ isCurrent: false })

    // Create the new status
    const orderItemStatus = await OrderItemStatus.create({
      orderItemId,
      status,
      notes,
      isCurrent: true,
      updatedBy
    })

    // Update the order item's status
    orderItem.status = status
    await orderItem.save()

    return orderItemStatus
  }

  /**
   * Get the current status of an order item
   */
  async getCurrentStatus(orderItemId: number): Promise<OrderItemStatus | null> {
    return await OrderItemStatus.query()
      .where('orderItemId', orderItemId)
      .where('isCurrent', true)
      .first()
  }

  /**
   * Get all statuses for an order item
   */
  async getStatusHistory(orderItemId: number): Promise<OrderItemStatus[]> {
    return await OrderItemStatus.query()
      .where('orderItemId', orderItemId)
      .orderBy('createdAt', 'asc')
  }

  /**
   * Check if an order item can transition to a new status
   */
  canTransitionTo(currentStatus: OrderItemStatusEnum, newStatus: OrderItemStatusEnum): boolean {
    // Define valid transitions
    const validTransitions: Record<OrderItemStatusEnum, OrderItemStatusEnum[]> = {
      [OrderItemStatusEnum.DRAFT]: [
        OrderItemStatusEnum.PAID,
        OrderItemStatusEnum.CANCELLED
      ],
      [OrderItemStatusEnum.PAID]: [
        OrderItemStatusEnum.ACCEPTED,
        OrderItemStatusEnum.CANCELLED
      ],
      [OrderItemStatusEnum.ACCEPTED]: [
        OrderItemStatusEnum.ASSIGNED,
        OrderItemStatusEnum.CANCELLED
      ],
      [OrderItemStatusEnum.ASSIGNED]: [
        OrderItemStatusEnum.ASSIGNED,
        OrderItemStatusEnum.CONFIRMED_BY_COURIER,
        OrderItemStatusEnum.PICKED_UP,
        OrderItemStatusEnum.CANCELLED
      ],
      [OrderItemStatusEnum.PICKED_UP]: [
        OrderItemStatusEnum.DELIVERED,
        OrderItemStatusEnum.CANCELLED
      ],
      [OrderItemStatusEnum.DELIVERED]: [],
      [OrderItemStatusEnum.CANCELLED]: []
    }

    return validTransitions[currentStatus]?.includes(newStatus) || false
  }
}

export default new OrderItemStatusService() 