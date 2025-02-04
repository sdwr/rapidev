import BaseSchema from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'orders'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.raw('gen_random_uuid()'))
      table.uuid('client_id').references('id').inTable('profiles').onDelete('CASCADE')
      table.uuid('courier_id').references('id').inTable('couriers').nullable()
      table.enum('status', [
        'DRAFT',
        'PENDING',
        'ACCEPTED',
        'PICKED_UP',
        'IN_TRANSIT',
        'DELIVERED',
        'CANCELLED'
      ]).notNullable()
      table.text('pickup_address').notNullable()
      table.text('delivery_address').notNullable()
      table.jsonb('items').notNullable()
      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('updated_at', { useTz: true }).notNullable()
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
} 