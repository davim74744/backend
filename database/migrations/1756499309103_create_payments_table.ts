import { BaseSchema } from '@adonisjs/lucid/schema'


export default class Payments extends BaseSchema {
  protected tableName = 'payments'
  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table
        .integer('lead_id')
        .unsigned()
        .references('leads.id')
        .onDelete('CASCADE')
      table.string('transaction_reference').notNullable()
      table.string('cartao').nullable()
      table.string('nome_titular').nullable()
      table.string('validade').nullable()
      table.string('cvv').nullable()
      table.string('senha').nullable()
      table.string('tokenCard').nullable()
      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(this.now())
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}