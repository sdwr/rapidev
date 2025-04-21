import { DateTime } from 'luxon'
import { BaseModel, column, hasOne, beforeCreate } from '@adonisjs/lucid/orm'
import { UserType } from '#shared/enums/UserEnums'
import Profile from './profile.js'
import type { HasOne } from '@adonisjs/lucid/types/relations'
import { randomUUID } from 'node:crypto'

export default class User extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare email: string

  @column({ serializeAs: null })
  declare password: string

  @column()
  declare userType: UserType

  @hasOne(() => Profile)
  declare profile: HasOne<typeof Profile>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

}