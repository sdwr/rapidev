import { BaseSchema } from '@adonisjs/lucid/schema'
import { OrderItemStatusEnum } from '#shared/enums/OrderItemEnums'

export default class extends BaseSchema {
  protected tableName = 'order_item_statuses'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.integer('order_item_id').unsigned().references('id').inTable('order_items').onDelete('CASCADE')
      table.enum('status', Object.values(OrderItemStatusEnum)).notNullable()
      table.boolean('is_current').defaultTo(true)
      table.text('notes').nullable()
      table.integer('updated_by').unsigned().references('id').inTable('users').nullable()

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').notNullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
} 