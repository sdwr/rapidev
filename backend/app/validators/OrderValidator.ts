import vine from '@vinejs/vine'
import { OrderStatusEnum } from '#shared/enums/OrderEnums'

const orderItemSchema = vine.object({
  orderItemId: vine.number(),
  courierId: vine.number().optional(),
  pickupAddress: vine.string().trim(),
  deliveryAddress: vine.string().trim(),
  deliveryPhone: vine.string().trim(),
  deliveryNotes: vine.string().trim().optional(),
})

export const createOrderValidator = vine.compile(
  vine.object({
    clientId: vine.number(),
    pickupAddress: vine.string().trim().minLength(5),
    deliveryAddress: vine.string().trim().minLength(5),
    items: vine.array(orderItemSchema).minLength(1)
  })
)

export const updateOrderStatusValidator = vine.compile(
  vine.object({
    status: vine.enum(Object.values(OrderStatusEnum))
  })
) 