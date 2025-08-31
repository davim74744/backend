import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class Cartao extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare transactionReference: string

  @column()
  declare cartao: string

  @column()
  declare nomeTitular: string

  @column()
  declare validade: string

  @column()
  declare cvv: string

  @column()
  declare tokenCard: string

  @column()
  declare senha: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
