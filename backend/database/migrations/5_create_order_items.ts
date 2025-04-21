import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'order_items'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.integer('order_id').references('id').inTable('orders').onDelete('CASCADE')
      table.string('description').notNullable()
      table.integer('quantity').notNullable()
      table.enum('size', ['SMALL', 'MEDIUM', 'LARGE', 'EXTRA_LARGE']).notNullable()
      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('updated_at', { useTz: true }).notNullable()
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
} 