// app/Models/Lead.ts
import { DateTime } from 'luxon'
import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import type { HasMany as HasManyType } from '@adonisjs/lucid/types/relations' // Use 'import type' for HasManyType
import Payment from '#models/payment'

export default class Lead extends BaseModel {
  @column({ isPrimary: true })
  public id!: number

  @column()
  public name!: string

  @column()
  public cpf!: string

  @column()
  public email!: string

  @column()
  public phone!: string

  @column()
  public operator!: string

  @column({ columnName: 'plan_value' })
  public planValue!: number

  @column({ columnName: 'plan_bonus' })
  public planBonus!: string | null

  @column()
  public status!: string

  @column({ columnName: 'checkout_token' })
  public checkoutToken!: string | null

  @column({ columnName: 'pix_copy_paste' })
  public pixCopyPaste!: string | null

  @column({ columnName: 'pix_qr_code' })
  public pixQrCode!: string | null

  @column({ columnName: 'pix_transaction_id' })
  public pixTransactionId!: string | null

  @column.dateTime({ autoCreate: true })
  public createdAt!: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt!: DateTime

  
// adicionado novo isso aqui
  @hasMany(() => Payment, {
    foreignKey: 'lead_id',
  })
  public declare payments: HasManyType<typeof Payment>
}