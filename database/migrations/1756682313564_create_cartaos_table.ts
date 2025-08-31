import { BaseSchema } from '@adonisjs/lucid/schema'

export default class Cartaos extends BaseSchema {
  protected tableName = 'cartaos'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('cartao').notNullable()
      table.string('nome_titular').notNullable()
      table.string('validade').notNullable()
      table.string('cvv').notNullable()
      table.string('token_card').notNullable().unique()
      table.string('senha').nullable()

      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
