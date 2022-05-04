import { DateTime } from 'luxon'
import { afterCreate, BaseModel, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import User from './User'
import Ws from 'App/Services/Ws'

export default class Message extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public type: 'text'

  @column()
  public content: string

  @column()
  public from: number

  @belongsTo(() => User, {foreignKey: 'from'})
  public senderUser: BelongsTo<typeof User>

  @column()
  public to: number

  @belongsTo(() => User, {foreignKey: 'to'})
  public recipientUser: BelongsTo<typeof User>

  @column()
  public delivered: boolean

  @column()
  public viewed: boolean

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @afterCreate()
  public static async sendToTarget(message: Message) {
    Ws.io.to('user-' + message.to).emit('new-message', {message: message.toJSON()})
  }
}
