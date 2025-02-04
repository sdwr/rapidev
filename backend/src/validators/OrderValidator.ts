import vine from '@vinejs/vine'
import { OrderStatus, Size } from '../../../shared/enums/OrderEnums'

const orderItemSchema = vine.object({
  description: vine.string().trim().minLength(3),
  quantity: vine.number().min(1),
  size: vine.enum(Object.values(Size))
})

export const createOrderValidator = vine.compile(
  vine.object({
    clientId: vine.string().trim(),
    pickupAddress: vine.string().trim().minLength(5),
    deliveryAddress: vine.string().trim().minLength(5),
    items: vine.array(orderItemSchema).minLength(1)
  })
)

export const updateOrderStatusValidator = vine.compile(
  vine.object({
    status: vine.enum(Object.values(OrderStatus))
  })
) 