// import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import UserLike from "App/Models/UserLike"
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import UserMatch from "App/Models/UserMatch"
import UserFeedView from "App/Models/UserFeedView"
import Database from "@ioc:Adonis/Lucid/Database"
import User from "App/Models/User"

export default class FeedsController {

    async markViewed({request, auth}) {
        const userId = auth.user.id
        const targetId = request.param('target_id')
        const view = await UserFeedView.create({user_id: userId, target_id: targetId})

        return view.serialize()
    }

    async randomUser({auth, response}) {
        const user = auth.user
        const users = await Database.rawQuery(`SELECT (sun + moon + ascendant)/3 as compatibility, user_id FROM (SELECT
            CASE WHEN sun < 1 THEN 100
                WHEN sun < 2 THEN 70
                WHEN sun < 3 THEN 100
                WHEN sun < 4 THEN 70
                WHEN sun < 5 THEN 100
                WHEN sun < 6 THEN 40
                WHEN sun < 7 THEN 80
                WHEN sun < 8 THEN 40
                WHEN sun < 9 THEN 100
                WHEN sun < 10 THEN 70
                WHEN sun < 11 THEN 100
                WHEN sun < 12 THEN 70
            END as sun,
            CASE WHEN moon < 1 THEN 100
                WHEN moon < 2 THEN 70
                WHEN moon < 3 THEN 100
                WHEN moon < 4 THEN 70
                WHEN moon < 5 THEN 100
                WHEN moon < 6 THEN 40
                WHEN moon < 7 THEN 80
                WHEN moon < 8 THEN 40
                WHEN moon < 9 THEN 100
                WHEN moon < 10 THEN 70
                WHEN moon < 11 THEN 100
                WHEN moon < 12 THEN 70
            END as moon,
            CASE WHEN ascendant < 1 THEN 100
                WHEN ascendant < 2 THEN 70
                WHEN ascendant < 3 THEN 100
                WHEN ascendant < 4 THEN 70
                WHEN ascendant < 5 THEN 100
                WHEN ascendant < 6 THEN 40
                WHEN ascendant < 7 THEN 80
                WHEN ascendant < 8 THEN 40
                WHEN ascendant < 9 THEN 100
                WHEN ascendant < 10 THEN 70
                WHEN ascendant < 11 THEN 100
                WHEN ascendant < 12 THEN 70
            END as ascendant,
            user_id
            FROM (SELECT
                ABS(${user.sun/30} - sun/30) as sun,
                ABS(${user.moon/30} - moon/30) as moon,
                ABS(${user.ascendant/30} - ascendant/30) as ascendant,
                id as user_id
            FROM users WHERE id != ${user.id} AND id NOT IN (SELECT target_id FROM user_feed_views WHERE user_id = ${user.id})) as user_compatibility) as data ORDER BY compatibility LIMIT 1`)

        if (!users.rows.length) {
            return response.noContent()
        }
        const randomUser = await User.findOrFail(users.rows[0].user_id)
        return {...randomUser.serialize(), compatibility: users.rows[0].compatibility}
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
