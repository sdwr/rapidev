import { OrderStatusEnum } from '../shared/enums/OrderEnums'

export const ACTIVE_ORDER_STATUSES = [
  OrderStatusEnum.DRAFT,
  OrderStatusEnum.PENDING,
  OrderStatusEnum.ACCEPTED,
  OrderStatusEnum.ASSIGNED_TO_COURIER,
  OrderStatusEnum.CONFIRMED_BY_COURIER,
  OrderStatusEnum.PICKED_UP,
  OrderStatusEnum.IN_TRANSIT
]

export const HISTORY_ORDER_STATUSES = [
  OrderStatusEnum.DELIVERED,
  OrderStatusEnum.CANCELLED_BY_CLIENT,
  OrderStatusEnum.CANCELLED_BY_COURIER,
  OrderStatusEnum.CANCELLED_BY_ADMIN
]

export const ACCEPTABLE_ORDER_STATUSES = [
  OrderStatusEnum.DRAFT,
  OrderStatusEnum.PENDING
] 

export const COURIER_ACTIVE_ORDER_STATUSES = [
  OrderStatusEnum.ASSIGNED_TO_COURIER,
  OrderStatusEnum.CONFIRMED_BY_COURIER,
  OrderStatusEnum.PICKED_UP,
  OrderStatusEnum.IN_TRANSIT
]

export const ORDER_STATUS_DESCRIPTIONS = {
  DRAFT: 'Order created and is in draft state',
  PENDING: 'Order is pending acceptance',
  ACCEPTED: 'Order has been accepted by an admin',
  ASSIGNED_TO_COURIER: 'Order has been assigned to a courier',
  CONFIRMED_BY_COURIER: 'Order has been confirmed by the courier',
  PICKED_UP: 'Order has been picked up by the courier',
  IN_TRANSIT: 'Order is in transit to delivery location',
  DELIVERED: 'Order has been delivered',
  CANCELLED_BY_CLIENT: 'Order has been cancelled by the client',
  CANCELLED_BY_COURIER: 'Order has been cancelled by the courier',
  CANCELLED_BY_ADMIN: 'Order has been cancelled by an admin'
}

