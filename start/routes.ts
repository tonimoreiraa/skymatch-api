/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/cart.ts
| ├── start/routes/customer.ts
|
| and then import them inside `start/routes.ts` as follows
|
| import './routes/cart'
| import './routes/customer'
|
*/

import Route from '@ioc:Adonis/Core/Route'

// Auth routes
Route.post('/users/validate-email', 'AuthController.createEmailValidation')
Route.post('/auth/register', 'AuthController.register')
Route.post('/auth/login', 'AuthController.login')

Route.group(() => {
    Route.get('/feed/random', 'FeedsController.randomUser')
    Route.post('/feed/:target_id/mark-viewed', 'FeedsController.markViewed')
    Route.post('/users/:id/avaliate', 'FeedsController.avaliate')
    Route.get('/matches', 'FeedsController.getMatches')
    Route.resource('/likes', 'LikesController').only(['index', 'store', 'show', 'update', 'destroy'])
    Route.get('/chats', 'ChatsController.index')
    Route.resource('/messages', 'MessagesController').only(['store'])
    Route.get('/chats/:id/messages', 'MessagesController.listMessages')
}).middleware('auth')