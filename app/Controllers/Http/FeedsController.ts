// import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import UserLike from "App/Models/UserLike"
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import UserMatch from "App/Models/UserMatch"
import UserFeedView from "App/Models/UserFeedView"
import Database from "@ioc:Adonis/Lucid/Database"
import User from "App/Models/User"

function getDistanceFromCoordsInKm(position1, position2) {
    "use strict";
    var deg2rad = function (deg) { return deg * (Math.PI/180); },
        R = 6371,
        dLat = deg2rad(position2.lat - position1.lat),
        dLng = deg2rad(position2.lng - position1.lng),
        a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
            + Math.cos(deg2rad(position1.lat))
            * Math.cos(deg2rad(position1.lat))
            * Math.sin(dLng / 2) * Math.sin(dLng / 2),
        c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return ((R * c *1000));
}

export default class FeedsController {

    async markViewed({request, auth}) {
        const userId = auth.user.id
        const targetId = request.param('target_id')
        const view = await UserFeedView.create({user_id: userId, target_id: targetId})

        return view.serialize()
    }

    async randomUser({auth, response}) {
        const user = await User.findOrFail(auth.user.id)
        if (typeof(user.preffered_genders) == 'string') user.preffered_genders = JSON.parse(user.preffered_genders)
        const userAge = new Date(new Date() - new Date(user.birth_time)).getUTCFullYear() - 1970
        var users: any = await Database.rawQuery(`SELECT (sun + moon + ascendant)/3 as compatibility, user_id, latitude, longitude, max_distance_radar FROM (SELECT
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
            user_id,
            max_distance_radar,
            latitude, longitude
            FROM (SELECT
                    ABS(${user.sun/30} - sun/30) as sun,
                    ABS(${user.moon/30} - moon/30) as moon,
                    ABS(${user.ascendant/30} - ascendant/30) as ascendant,
                    max_distance_radar,
                    id as user_id, latitude, longitude
                FROM users WHERE
                (birth_time <= (current_date - '${user.preffered_min_age} years'::interval))
                AND (birth_time >= (current_date - '${user.preffered_max_age} years'::interval))
                AND (${userAge} >= preffered_min_age)
                AND (${userAge} <= preffered_max_age)
                AND gender IN (${user.preffered_genders.map(gender => '\'' + gender + '\'').join(', ')})
                AND preffered_genders LIKE '%"${user.gender}"%'
                AND id != ${user.id}
                AND id NOT IN (SELECT target_id FROM user_feed_views WHERE user_id = ${user.id})) as user_compatibility)
            as data
            ORDER BY compatibility`)

        users = users.rows.map(u => {
            const distance = getDistanceFromCoordsInKm({lat: u.latitude, lng: u.longitude}, {lat: user.latitude, lng: user.longitude})
            return {...u, distance}
        }).filter(u => u.distance <= u.max_distance_radar && u.distance <= user.max_distance_radar)

        if (!users.length) {
            return response.noContent()
        }

        const randomUser = await User.findOrFail(users[0].user_id)
        return {...randomUser.serialize(), compatibility: users[0].compatibility, distance: users[0].distance}
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

        const match = !!(await UserLike.query().where('user_id', target_id).where('target_id', target_id).where('like', true)).length

        return {...like.serialize(), match}
    }

    async getMatches({auth}) {
        const user_id = auth.user.id
        const matches = await UserMatch.query().where('user1_id', user_id).orWhere('user2_id', user_id)
        return matches.map(match => match.serialize())
    }
}
