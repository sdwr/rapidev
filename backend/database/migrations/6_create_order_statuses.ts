import { BaseSchema } from '@adonisjs/lucid/schema'
import { OrderStatusEnum } from '#shared/enums/OrderEnums'


export default class extends BaseSchema {
  protected tableName = 'order_statuses'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.integer('order_id').references('id').inTable('orders').onDelete('CASCADE')
      table.enum('status', Object.values(OrderStatusEnum)).notNullable()
      table.boolean('is_current').defaultTo(true)
      table.text('description').nullable()
      table.integer('updated_by').unsigned().references('id').inTable('users').nullable()
      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('updated_at', { useTz: true }).notNullable()
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
} 