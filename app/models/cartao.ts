import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class Cartao extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare cartao: string

  @column({ columnName: 'nome_titular' })
  declare nomeTitular: string

  @column()
  declare validade: string

  @column()
  declare cvv: string

  @column({ columnName: 'token_card' })
  declare tokenCard: string

  @column()
  declare senha: string | null

  @column.dateTime({ columnName: 'created_at', autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ columnName: 'updated_at', autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
