import { DateTime } from 'luxon'
import Hash from '@ioc:Adonis/Core/Hash'
import { column, beforeSave, BaseModel, afterCreate, belongsTo, BelongsTo } from '@ioc:Adonis/Lucid/Orm'
import UserEmailValidationSecretKey from './UserEmailValidationSecretKey'
import City from './City'
export default class User extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public name: string

  @column()
  public email: string

  @column()
  public biography: string

  @column()
  public profile_photo: string

  @column({ serializeAs: null })
  public password: string

  @column()
  public gender: 'male'|'female'

  @column()
  public birth_city_id: number

  @belongsTo(() => City, {foreignKey: 'birth_city_id'})
  public city: BelongsTo<typeof City>

  @column()
  public birth_time: Date

  @column()
  public sun: number

  @column()
  public sun_name: number

  @column()
  public moon: number

  @column()
  public moon_name: string
    
  @column()
  public ascendant: number

  @column()
  public ascendant_name: string

  @column()
  public rememberMeToken?: string

  @column({
    prepare: (value: string) => typeof(value) == 'string' ? value : JSON.stringify(value),
    consume: (value: string) => JSON.parse(value),
  })
  public preffered_genders: string[]

  @column()
  public preffered_min_age: number

  @column()
  public preffered_max_age: number

  @column()
  public max_distance_radar: number

  @column()
  public latitude: number
  
  @column()
  public longitude: number

  @column.dateTime({ autoCreate: true })
  public created_at: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updated_at: DateTime

  @beforeSave()
  public static async parse(user: User) {
    if (user.$dirty.password) {
      user.password = await Hash.make(user.password)
    }
  }

  @afterCreate()
  public static async deleteEmailValidation(user: User) {
    const validators = await UserEmailValidationSecretKey.query().where('email', user.email)
    return Promise.all(validators.map(validator => validator.delete()))
  }

  public async getSocketSessionsIDs() {
    const sockets = await Redis.lrange('user-sessions:' + this.id)
    return sockets
  }
}
