import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'
import Order from '#models/order'
import { OrderStatusEnum } from '#shared/enums/OrderEnums'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

export default class OrderStatus extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare orderId: number

  @column()
  declare status: OrderStatusEnum

  @column()
  declare description: string

  @column()
  declare isCurrent: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Order)
  declare order: BelongsTo<typeof Order>
} 