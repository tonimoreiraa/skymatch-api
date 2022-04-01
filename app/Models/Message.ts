import { DateTime } from 'luxon'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class Message extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public type: 'text'

  @column()
  public content: string

  @column()
  public from: number

  @column()
  public to: number

  @column()
  public delivered: boolean

  @column()
  public viewed: boolean

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
