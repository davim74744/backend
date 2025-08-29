import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'leads'

  public async up() {
    // Para alterar uma tabela existente, usamos this.schema.alterTable()
    this.schema.alterTable(this.tableName, (table) => {
      // O método .dropUnique() remove a restrição 'unique' da coluna 'cpf'
      table.dropUnique(['cpf'])
    })
  }

  public async down() {
    // O método down faz o contrário
    this.schema.alterTable(this.tableName, (table) => {
      // O método .unique() adiciona a restrição de volta
      table.string('cpf').unique().alter()
    })
  }
}