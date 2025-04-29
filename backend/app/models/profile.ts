import { BaseModel, column } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'
import { ProfileTypeEnum } from '#shared/enums/ProfileEnums'

export default class Profile extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column()
  declare address: string

  @column()
  declare profileType: ProfileTypeEnum

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
} 