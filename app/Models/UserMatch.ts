import { DateTime } from 'luxon'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class UserMatch extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public user1_id: number
  
  @column()
  public user2_id: number

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
