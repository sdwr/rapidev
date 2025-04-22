import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'
import Order from '#models/order'
import { Size } from '#shared/enums/OrderEnums'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import OrderStatus from '#models/order_status'

export default class OrderItem extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare orderId: number

  @column()
  declare courierId: number | null
  
  @column()
  declare deliveryAddress: string

  @column()
  declare deliveryPhone: string

  @column()
  declare deliveryNotes: string

  @hasMany(() => OrderStatus)
  declare statuses: HasMany<typeof OrderStatus>
  
  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Order)
  declare order: BelongsTo<typeof Order>
} 