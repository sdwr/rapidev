import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Order from './order.js'
import { ReceiptStatusEnum } from '#shared/enums/ReceiptEnums'

export default class Receipt extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare orderId: number

  @column()
  declare deliveryFee: number

  @column()
  declare bookingFee: number

  @column()
  declare discount: number

  @column()
  declare total: number

  @column()
  declare amountPaid: number

  @column()
  declare receiptStatus: ReceiptStatusEnum

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Order)
  declare order: BelongsTo<typeof Order>
} 