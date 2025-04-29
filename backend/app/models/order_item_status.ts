import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'
import OrderItem from '#models/order_item'
import User from '#models/user'
import { OrderItemStatus as OrderItemStatusEnum } from '#shared/enums/OrderItemEnums'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

export default class OrderItemStatus extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare orderItemId: number

  @column()
  declare status: OrderItemStatusEnum

  @column()
  declare notes: string | null

  @column()
  declare isCurrent: boolean

  @column()
  declare updatedBy: number | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => OrderItem, {
    foreignKey: 'orderItemId',
  })
  declare orderItem: BelongsTo<typeof OrderItem>

  @belongsTo(() => User, {
    foreignKey: 'updatedBy',
  })
  declare updatedByUser: BelongsTo<typeof User>
} 