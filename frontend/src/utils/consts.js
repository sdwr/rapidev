export const ACTIVE_ORDER_STATUSES = [
  'DRAFT',
  'PENDING',
  'ACCEPTED',
  'ASSIGNED',
  'CONFIRMED',
  'PICKED_UP',
  'IN_TRANSIT'
]

export const HISTORY_ORDER_STATUSES = [
  'DELIVERED',
  'CANCELLED'
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

