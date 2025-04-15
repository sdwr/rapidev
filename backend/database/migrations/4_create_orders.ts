import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'orders'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()
      table.uuid('client_id').references('id').inTable('users').onDelete('SET NULL')
      table.uuid('courier_id').references('id').inTable('users').nullable()
      table.uuid('client_profile_id').references('id').inTable('profiles').onDelete('SET NULL')
      table.text('delivery_address').notNullable()
      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('updated_at', { useTz: true }).notNullable()
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
} 