import { BaseSchema } from '@adonisjs/lucid/schema'
import { UserTypeEnum } from '#shared/enums/UserEnums'
export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.string('email').notNullable().unique()
      table.string('password').notNullable()
      table.string('name')
      table.string('phone')
      table.enum('user_type', Object.values(UserTypeEnum)).notNullable()
      
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
} 