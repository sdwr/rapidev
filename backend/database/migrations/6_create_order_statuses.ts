import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'order_statuses'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()
      table.uuid('order_id').references('id').inTable('orders').onDelete('CASCADE')
      table.enum('status', [
        'DRAFT',
        'PENDING',
        'ACCEPTED',
        'ASSIGNED_TO_COURIER',
        'CONFIRMED_BY_COURIER',
        'PICKED_UP',
        'IN_TRANSIT',
        'DELIVERED',
        'CANCELLED_BY_CLIENT',
        'CANCELLED_BY_COURIER',
        'CANCELLED_BY_ADMIN'
      ]).notNullable()
      table.string('description').nullable()
      table.boolean('is_current').defaultTo(true)
      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('updated_at', { useTz: true }).notNullable()
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
} 