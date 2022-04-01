// import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import UserLike from "App/Models/UserLike"
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import UserMatch from "App/Models/UserMatch"
import UserFeedView from "App/Models/UserFeedView"
import Database from "@ioc:Adonis/Lucid/Database"

export default class FeedsController {

    async markViewed({request, auth}) {
        const userId = auth.user.id
        const targetId = request.param('target_id')
        const view = await UserFeedView.create({user_id: userId, target_id: targetId})

        return view.serialize()
    }

    async randomUser({auth, response}) {
        const userId = auth.user.id
        const randomUser = (await Database.rawQuery(`SELECT * FROM users WHERE id != ${userId} AND id NOT IN (SELECT target_id FROM user_feed_views WHERE user_id = ${userId}) LIMIT 1`))

        if (!randomUser.rows.length) {
            return response.noContent()
        }
        return randomUser.rows[0]
    }

    async avaliate({request, auth, response}) {
        const target_id = request.param('id')
        const user_id = auth.user.id
        const liked = request.input('like')

        await request.validate({schema: schema.create({
            user_id: schema.number([rules.exists({table: 'users', column: 'id'})]),
            target_id: schema.number([rules.exists({table: 'users', column: 'id'})]),
          }), data: {target_id, user_id}})

        if (target_id == user_id) return response.badRequest({message: 'Você não pode avaliar a si mesmo.'})

        const like = await UserLike.create({target_id, user_id, like: liked})
        return like.serialize()
    }

    async getMatches({auth}) {
        const user_id = auth.user.id
        const matches = await UserMatch.query().where('user1_id', user_id).orWhere('user2_id', user_id)
        return matches.map(match => match.serialize())
    }
}
