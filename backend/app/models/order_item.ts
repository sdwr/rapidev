import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'
import Order from '#models/order'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import OrderItemStatus from '#models/order_item_status'
import User from './user.js'

export default class OrderItem extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare orderId: number

  @column()
  declare courierId: number | null

  @column()
  declare pickupAddress: string
  @column()
  declare deliveryAddress: string

  @column()
  declare deliveryPhone: string

  @column()
  declare deliveryNotes: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Order, {
    foreignKey: 'orderId',
  })
  declare order: BelongsTo<typeof Order>

  @hasMany(() => OrderItemStatus)
  declare orderItemStatuses: HasMany<typeof OrderItemStatus>

  @belongsTo(() => User, {
    foreignKey: 'courierId',
  })
  declare courier: BelongsTo<typeof User>
} 