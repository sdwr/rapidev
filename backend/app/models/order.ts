import { BaseModel, column, belongsTo, hasMany, hasOne } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'
import User from '#models/user'
import OrderStatus from '#models/order_status'
import OrderItem from '#models/order_item'
import Receipt from '#models/receipt'
import type { BelongsTo, HasMany, HasOne } from '@adonisjs/lucid/types/relations'

export default class Order extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare clientId: number

  @column()
  declare pickupAddress: string

  @hasMany(() => OrderItem)
  declare items: HasMany<typeof OrderItem>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => User, {
    foreignKey: 'clientId',
  })
  declare client: BelongsTo<typeof User>

  @hasMany(() => OrderStatus)
  declare orderStatuses: HasMany<typeof OrderStatus>

  @hasOne(() => Receipt)
  declare receipt: HasOne<typeof Receipt>
} 