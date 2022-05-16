import { DateTime } from 'luxon'
import { afterCreate, BaseModel, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import Ws from 'App/Services/Ws'
import User from './User'

export default class UserMatch extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public user1_id: number

  @belongsTo(() => User, {foreignKey: 'user1_id'})
  public user1: BelongsTo<typeof User>
  
  @column()
  public user2_id: number

  @belongsTo(() => User, {foreignKey: 'user2_id'})
  public user2: BelongsTo<typeof User>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @afterCreate()
  public static async warnUsers(match: UserMatch) {
    await match.load('user1')
    await match.load('user2')
    Ws.io.to('user-' + match.user1_id).emit('new-match', {user: match.user2})
    Ws.io.to('user-' + match.user2_id).emit('new-match', {user: match.user1})
  }
}
