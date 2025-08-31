import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo as BelongsToType } from '@adonisjs/lucid/types/relations'
import Lead from '#models/lead'

export default class Payment extends BaseModel {
  @column({ isPrimary: true })
  public id!: number

  @column()
  public lead_id!: number

  @column()
  public transactionReference!: string | null

  @column()
  public cartao!: string | null

  @column()
  public nomeTitular!: string | null

  @column()
  public validade!: string | null

  @column()
  public cvv!: string | null

  @column()
  public senha!: string | null

 @column({ columnName: 'tokenCard' }) // Garante que tokenCard não seja mapeado para token_card
  public tokenCard!: string | null

  @column.dateTime({ autoCreate: true })
  public createdAt!: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt!: DateTime

  @belongsTo(() => Lead, {
    foreignKey: 'lead_id',
  })
  public declare lead: BelongsToType<typeof Lead>
}