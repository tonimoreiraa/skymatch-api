import { DateTime } from 'luxon'
import { afterCreate, BaseModel, beforeCreate, column } from '@ioc:Adonis/Lucid/Orm'
import UserMatch from './UserMatch'

export default class UserLike extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public user_id: number

  @column()
  public target_id: number

  @column()
  public like: boolean

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @beforeCreate()
  public static async verifyAlreadyExists(like: UserLike) { 
    if ((await UserLike.query().where('user_id', like.user_id).where('target_id', like.target_id)).length) {
      throw Error('Você já avaliou este usuário.')
    }
  }

  @afterCreate()
  public static async verifyMatch(like: UserLike) {
    if (like.like) {
      const match = await UserLike
      .query()
      .where('user_id', like.target_id)
      .where('target_id', like.user_id)
      .where('like', true)
      if (match.length) {
        await UserMatch.create({user1_id: like.user_id, user2_id: like.target_id})
      }
    }
  }
}
