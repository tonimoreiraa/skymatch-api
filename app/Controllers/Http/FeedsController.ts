// import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import UserLike from "App/Models/UserLike"
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import UserMatch from "App/Models/UserMatch"

export default class FeedsController {
    getSugestion() {

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

    async getMatches({request, auth}) {
        const user_id = auth.user.id
        const matches = await UserMatch.query().where('user1_id', user_id).orWhere('user2_id', user_id)
        return matches.map(match => match.serialize())
    }
}
