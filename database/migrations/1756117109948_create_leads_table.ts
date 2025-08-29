import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'leads'

 async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id') // Chave primária auto-incremento

      // Colunas para os dados do formulário
      table.string('name').notNullable()
      table.string('cpf', 11).notNullable()
      table.string('email').notNullable()
      table.string('phone', 11).notNullable()
      table.string('operator').notNullable()
      table.decimal('plan_value', 8, 2).notNullable() // Ótimo para valores monetários
      table.string('plan_bonus').nullable() // Pode ser nulo se um plano não tiver bônus

      // Colunas para nosso controle de checkout
      table.string('status').notNullable().defaultTo('pending') // Status inicial
      table.string('checkout_token').nullable().unique() // Nosso token seguro

      table.timestamps(true, true) // created_at e updated_at com timezone
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}