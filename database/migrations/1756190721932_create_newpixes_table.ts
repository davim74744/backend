import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'leads'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('pix_copy_paste').nullable()
      table.string('pix_qr_code').nullable()
      table.string('pix_transaction_id').nullable()
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('pix_copy_paste')
      table.dropColumn('pix_qr_code')
      table.dropColumn('pix_transaction_id')
    })
  }
}