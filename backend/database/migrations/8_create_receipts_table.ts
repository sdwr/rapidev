import { BaseSchema } from '@adonisjs/lucid/schema'
import { ReceiptStatus } from '#shared/enums/ReceiptEnums'

export default class extends BaseSchema {
  protected tableName = 'receipts'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.integer('order_id').unsigned().references('id').inTable('orders').onDelete('CASCADE')
      table.decimal('delivery_fee', 10, 2).notNullable().defaultTo(0)
      table.decimal('booking_fee', 10, 2).notNullable().defaultTo(0)
      table.decimal('discount', 10, 2).notNullable().defaultTo(0)
      table.decimal('total', 10, 2).notNullable()
      table.decimal('amount_paid', 10, 2).notNullable().defaultTo(0)
      table.enum('receipt_status', Object.values(ReceiptStatus)).notNullable().defaultTo(ReceiptStatus.PENDING)

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
} 