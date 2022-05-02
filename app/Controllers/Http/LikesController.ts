// import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import UserLike from "App/Models/UserLike";
import { schema, rules } from '@ioc:Adonis/Core/Validator'

export default class LikesController {
    async index({auth}) {
        const userId = auth.user.id
        const likes = await UserLike.query().where('user_id', userId).preload('target')
        return likes.map(like => like.serialize({
            relations: {
                target: {
                    fields: {
                        pick: ['id', 'profile_photo', 'name', 'email', 'biography', 'gender', 'sun_name', 'moon_name', 'ascendant_name']
                    }
                }
            }
        }))
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
