import BaseSchema from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'couriers'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.raw('gen_random_uuid()'))
      table.string('name').notNullable()
      table.enum('status', ['AVAILABLE', 'BUSY', 'OFFLINE']).notNullable()
      table.uuid('current_order_id').references('id').inTable('orders').nullable()
      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('updated_at', { useTz: true }).notNullable()
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
} 