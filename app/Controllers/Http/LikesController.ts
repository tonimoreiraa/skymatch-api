// import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import UserLike from "App/Models/UserLike";
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import Database from "@ioc:Adonis/Lucid/Database";
import User from "App/Models/User";

export default class LikesController {
    async index({auth}) {
        const userId = auth.user.id
        const user = auth.user
        if (typeof(user.preffered_genders) == 'string') user.preffered_genders = JSON.parse(user.preffered_genders)

        const likes = await Database.rawQuery(`SELECT (sun + moon + ascendant)/3 as compatibility, user_id, distance, * FROM (SELECT
            CASE WHEN c_sun < 1 THEN 100
                WHEN c_sun < 2 THEN 70
                WHEN c_sun < 3 THEN 100
                WHEN c_sun < 4 THEN 70
                WHEN c_sun < 5 THEN 100
                WHEN c_sun < 6 THEN 40
                WHEN c_sun < 7 THEN 80
                WHEN c_sun < 8 THEN 40
                WHEN c_sun < 9 THEN 100
                WHEN c_sun < 10 THEN 70
                WHEN c_sun < 11 THEN 100
                WHEN c_sun < 12 THEN 70
            END as sun,
            CASE WHEN c_moon < 1 THEN 100
                WHEN c_moon < 2 THEN 70
                WHEN c_moon < 3 THEN 100
                WHEN c_moon < 4 THEN 70
                WHEN c_moon < 5 THEN 100
                WHEN c_moon < 6 THEN 40
                WHEN c_moon < 7 THEN 80
                WHEN c_moon < 8 THEN 40
                WHEN c_moon < 9 THEN 100
                WHEN c_moon < 10 THEN 70
                WHEN c_moon < 11 THEN 100
                WHEN c_moon < 12 THEN 70
            END as moon,
            CASE WHEN c_ascendant < 1 THEN 100
                WHEN c_ascendant < 2 THEN 70
                WHEN c_ascendant < 3 THEN 100
                WHEN c_ascendant < 4 THEN 70
                WHEN c_ascendant < 5 THEN 100
                WHEN c_ascendant < 6 THEN 40
                WHEN c_ascendant < 7 THEN 80
                WHEN c_ascendant < 8 THEN 40
                WHEN c_ascendant < 9 THEN 100
                WHEN c_ascendant < 10 THEN 70
                WHEN c_ascendant < 11 THEN 100
                WHEN c_ascendant < 12 THEN 70
            END as ascendant,
            user_id,
            distance,
            max_distance_radar
            FROM (SELECT
                    ABS(${user.sun/30} - sun/30) as c_sun,
                    ABS(${user.moon/30} - moon/30) as c_moon,
                    ABS(${user.ascendant/30} - ascendant/30) as c_ascendant,
                    (|/ ABS((${user.latitude} - latitude) - (${user.longitude} - longitude)))*111.11 as distance,
                    id as user_id,
                    *
                FROM users WHERE id IN (SELECT target_id FROM user_likes)) as user_compatibility)
            as data
            ORDER BY compatibility
            LIMIT 1`)
        // const likes = await UserLike.query().where('user_id', userId).preload('target')
        return Promise.all(likes.rows.map(async (like: any) => ({...(await User.findOrFail(like.user_id)).serialize(), ...like})))
    }

    async show({request}) {
        const likeId = request.param('id')
        const like = await UserLike.findOrFail(likeId)

        return like.serialize()
    }

    async destroy({request}) {
        const likeId = request.param('id')
        const like = await UserLike.findOrFail(likeId)
        await like.delete()
    }

    async store({request, auth, response}) {
        const target_id = request.input('target_id')
        const user_id = auth.user.id
        const liked = request.input('like')

        await request.validate({
            schema: schema.create({
                target_id: schema.number([rules.exists({table: 'users', column: 'id'})]),
            }),
            data: {target_id, user_id},
            messages: {
                'target_id.exists': 'Este usuário não existe.'
            }
        })

        if (target_id == user_id) return response.badRequest({message: 'Você não pode avaliar a si mesmo.'})

        const like = await UserLike.create({target_id, user_id, like: liked})
        
        return like.serialize()
    }
}
