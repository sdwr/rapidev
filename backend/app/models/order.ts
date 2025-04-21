import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'
import User from '#models/user'
import Profile from '#models/profile'
import OrderStatus from '#models/order_status'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import OrderItem from '#models/order_item'

export default class Order extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare clientId: number

  @column()
  declare courierId: number | null

  @column()
  declare clientProfileId: number

  @column()
  declare deliveryAddress: string

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

  @belongsTo(() => User, {
    foreignKey: 'courierId',
  })
  declare courier: BelongsTo<typeof User>

  @belongsTo(() => Profile, {
    foreignKey: 'clientProfileId',
  })
  declare clientProfile: BelongsTo<typeof Profile>

  @hasMany(() => OrderStatus)
  declare orderStatuses: HasMany<typeof OrderStatus>
} 