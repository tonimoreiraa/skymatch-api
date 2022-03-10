import { DateTime } from 'luxon'
import Hash from '@ioc:Adonis/Core/Hash'
import { column, beforeSave, BaseModel, beforeCreate } from '@ioc:Adonis/Lucid/Orm'
import UserEmailValidationSecretKey from './UserEmailValidationSecretKey'

export default class User extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public name: string

  @column()
  public email: string

  @column({ serializeAs: null })
  public password: string

  @column()
  public gender: 'male'|'female'

  @column()
  public birth_city_id: number

  @column()
  public birth_time: Date

  @column()
  public rememberMeToken?: string

  @column.dateTime({ autoCreate: true })
  public created_at: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updated_at: DateTime

  @beforeSave()
  public static async hashPassword (user: User) {
    if (user.$dirty.password) {
      user.password = await Hash.make(user.password)
    }
  }

  @beforeCreate()
  public static async deleteEmailValidation(user: User) {
    const validators = await UserEmailValidationSecretKey.query().where('email', user.email)
    return Promise.all(validators.map(validator => validator.delete()))
  }
}
