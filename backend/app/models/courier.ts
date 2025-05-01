import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Order from '#models/order'
import { CourierStatusEnum } from '#shared/enums/CourierEnums'

export default class Courier extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column()
  declare name: string

  @column()
  declare status: CourierStatusEnum

  @column()
  declare currentOrderId: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Order, {
    foreignKey: 'currentOrderId',
  })
  declare currentOrder: BelongsTo<typeof Order>

  @hasMany(() => Order)
  declare orders: HasMany<typeof Order>
} 