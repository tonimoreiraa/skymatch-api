// import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import Message from "App/Models/Message";
import User from "App/Models/User";

export default class ChatsController {
    async index({auth}) {
        const userId = auth.user.id
        var messages: any = await Message.query().groupBy('id', 'from', 'to').where('from', userId).orWhere('to', userId)
        
        var usersList: number[] = messages.map(message => message.from == userId ? message.to : message.from)
        usersList = usersList.filter((val, index) => usersList.indexOf(val) === index)

        messages = Object.fromEntries(messages.map(message => ([message.from == userId ? message.to : message.from, message])))

        const users = (await User.findMany(usersList)).map((user: any) => {
            user = user.serialize()
            user.lastMessage = messages[user.id]
            return user
        })
        
        return users
    }
}
