import UserSocketToken from 'App/Models/UserSocketToken'
import Ws from 'App/Services/Ws'
import Logger from '@ioc:Adonis/Core/Logger'

Ws.boot()

/**
 * Listen for incoming socket connections
 */
var socketsPerUser = {}
var usersPerSocket = {}

var pendingMessages = {}

Ws.io.on('connection', (socket) => {

    const token = socket.client.request.headers['x-client-token']
    Logger.info('New user with id: ' + socket.id)

    UserSocketToken.findByOrFail('token', token).then(socketToken => {
        const userId = socketToken.user_id
        socketsPerUser[userId] = socketsPerUser[userId] ? [...socketsPerUser[userId], socket] : [socket]
        usersPerSocket[socket.id] = userId
        console.log(`User ${userId} authenticated on session ${socket.id}`)
        
        // methods
        socket.on('sendMessage', (message) => {
            const userId = message.userId
            if (socketsPerUser[userId]) {
                socketsPerUser[userId].forEach(s => s.emit('newMessage', {from: usersPerSocket[socket.id], content: message.content}))
            } else {
                pendingMessages[userId] = pendingMessages[userId] ? [...pendingMessages[userId], message] : [message]
            }
        })

    }).catch(() => {
        console.log(`Session ${socket.id} failed to login.`)
        socket.disconnect()
    })
})