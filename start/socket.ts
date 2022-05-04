import UserSocketToken from 'App/Models/UserSocketToken'
import Ws from 'App/Services/Ws'
import Logger from '@ioc:Adonis/Core/Logger'
import Redis from '@ioc:Adonis/Addons/Redis'

Ws.boot()

/**
 * Listen for incoming socket connections
 */
Ws.io.on('connection', (socket) => {

    const token = socket.client.request.headers['x-client-token']
    Logger.info('New user with id: ' + socket.id)

    UserSocketToken.findByOrFail('token', token).then(async (socketToken) => {
        await socketToken.load('user')

        Redis.rpush('user-sessions:' + socketToken.user.id, socket.id)
        socket.data.user = socketToken.user
        socket.join('user-' + socketToken.user.id)

        console.log(`User ${socketToken.user.id} authenticated on session ${socket.id}`)
    }).catch((e) => {
        console.log(e)
        console.log(`Session ${socket.id} failed to login.`)
        socket.emit('login-fail')
        socket.disconnect()
    })
})

Ws.io.on('disconnect', async (socket) => {
    if (socket.data.user) {
        await Redis.rpop(`user-sessions:` + socket.data.user.id, socket.id)
    }
})