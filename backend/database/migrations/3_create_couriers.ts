import { BaseSchema } from '@adonisjs/lucid/schema'
import { CourierStatusEnum } from '#shared/enums/CourierEnums'
export default class extends BaseSchema {
  protected tableName = 'couriers'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.string('name').notNullable()
      table.enum('status', Object.values(CourierStatusEnum)).notNullable()
      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('updated_at', { useTz: true }).notNullable()

      table.integer('user_id').references('id').inTable('users').onDelete('CASCADE')
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
} 