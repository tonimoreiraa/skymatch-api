// import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import Message from "App/Models/Message"

export default class MessagesController {
    async store({request, auth}) {
        const data = request.only(['to', 'type', 'content'])
        data.from = auth.user.id
        
        const message = await Message.create(data)
        return message.serialize()
    }

    async listMessages({request, auth}) {
        const userId = auth.user.id
        const chatId = request.param('id')
        const messages = await Message.query()
            .where('from', chatId)
            .where('to', userId)
            .orWhere('from', userId)
            .where('to', chatId)
            .orderBy('created_at')
        
        return messages.map(message => message.serialize())
    }
}
