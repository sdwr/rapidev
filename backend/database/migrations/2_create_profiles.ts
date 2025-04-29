import { BaseSchema } from '@adonisjs/lucid/schema'
import { ProfileTypeEnum } from '#shared/enums/ProfileEnums'
export default class extends BaseSchema {
  protected tableName = 'profiles'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.text('address').notNullable()
      table.enum('profile_type', Object.values(ProfileTypeEnum)).notNullable()
      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('updated_at', { useTz: true }).notNullable()

      table.integer('user_id').references('id').inTable('users').onDelete('CASCADE')
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
} 