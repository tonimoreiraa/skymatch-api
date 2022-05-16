// import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import Message from "App/Models/Message";
import User from "App/Models/User";
import UserMatch from "App/Models/UserMatch";

export default class ChatsController {
    async index({auth}) {
        const userId = auth.user.id

        // find user by messages
        var messages: any = await Message.query().groupBy('id', 'from', 'to').where('from', userId).orWhere('to', userId)
        
        var usersList: number[] = []
        messages.forEach(message => usersList.push(message.from == userId ? message.to : message.from))

        // find user by matches
        var matches: any = await UserMatch.query().where('user1_id', userId).orWhere('user2_id', userId)
        matches.forEach(match => {
            const id = match.user1_id == userId ? match.user2_id : match.user1_id
            usersList.push(id)

        })

        // remove repeated chats
        usersList = usersList.filter((val, index) => usersList.indexOf(val) === index)

        // sort items by user
        messages = Object.fromEntries(messages.map(message => ([message.from == userId ? message.to : message.from, message])))
        matches = Object.fromEntries(matches.map(match => ([match.user1_id == userId ? match.user2_id : match.user1_id, match])))
        console.log(matches)

        const users = (await User.findMany(usersList)).map((user: any) => {
            user = user.serialize()
            user.lastMessage = messages[user.id] ? messages[user.id] : messages[user.id] = {
                type: 'text',
                content: `Start Love!`,
                createdAt: matches[user.id].createdAt
            }
            return user
        })
        
        return users
    }
}
