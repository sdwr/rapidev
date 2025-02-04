import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'
import type { OrderItem } from '#shared/models/Order'
import Profile from '#models/profile'
import OrderStatus from '#models/order_status'
import Courier from '#models/courier'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'

export default class Order extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare clientId: string

  @column()
  declare courierId: string | null

  @column()
  declare pickupAddress: string

  @column()
  declare deliveryAddress: string

  @column()
  declare items: OrderItem[]

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Profile, {
    foreignKey: 'clientId',
  })
  declare client: BelongsTo<typeof Profile>

  @belongsTo(() => Courier, {
    foreignKey: 'courierId',
  })
  declare courier: BelongsTo<typeof Courier>

  @hasMany(() => OrderStatus)
  declare orderStatuses: HasMany<typeof OrderStatus>
} 