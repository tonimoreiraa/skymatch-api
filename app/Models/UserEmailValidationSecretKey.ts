import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, column } from '@ioc:Adonis/Lucid/Orm'
import Logger from '@ioc:Adonis/Core/Logger'

export default class UserEmailValidationSecretKey extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public email: string

  @column()
  public secret_key: number

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @beforeCreate()
  public static async sendNotification(validation: UserEmailValidationSecretKey) {
    validation.secret_key = Math.floor(Math.random() * 900000) + 100000
    Logger.info(`O código de validação ${validation.secret_key} foi gerado para o e-mail ${validation.email}`)
  }
}
