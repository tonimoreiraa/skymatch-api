import { DateTime } from 'luxon'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class City extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public name: string
  
  @column()
  public state: string

  @column()
  public country: string

  @column({ serializeAs: null })
  public latitude: number

  @column({ serializeAs: null })
  public longitude: number

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
