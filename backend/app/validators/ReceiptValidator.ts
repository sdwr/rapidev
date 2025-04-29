import vine from '@vinejs/vine'
import { ReceiptStatusEnum } from '#shared/enums/ReceiptEnums'

export const createReceiptValidator = vine.compile(
  vine.object({
    orderId: vine.number(),
    deliveryFee: vine.number().optional(),
    bookingFee: vine.number().optional(),
    discount: vine.number().optional(),
    total: vine.number(),
    amountPaid: vine.number().optional(),
    receiptStatus: vine.enum(Object.values(ReceiptStatusEnum)).optional()
  })
)

export const updateReceiptValidator = vine.compile(
  vine.object({
    deliveryFee: vine.number().optional(),
    bookingFee: vine.number().optional(),
    discount: vine.number().optional(),
    total: vine.number().optional(),
    amountPaid: vine.number().optional(),
    receiptStatus: vine.enum(Object.values(ReceiptStatusEnum)).optional()
  })
) 