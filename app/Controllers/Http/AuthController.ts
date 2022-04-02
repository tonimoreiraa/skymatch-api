// import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import User from "App/Models/User"
import UserEmailValidationSecretKey from "App/Models/UserEmailValidationSecretKey"
import CreateEmailValidationValidator from "App/Validators/CreateEmailValidationValidator"
import CreateUserValidator from "App/Validators/CreateUserValidator"
import { v4 as uuid } from 'uuid'
import Application from '@ioc:Adonis/Core/Application'
import UserSocketToken from "App/Models/UserSocketToken"
export default class AuthController {
    async createEmailValidation({request}) {
        await request.validate(CreateEmailValidationValidator)
        const email = request.input('email')
        await UserEmailValidationSecretKey.create({email})
    }

    async register({request, response, auth}) {
        await request.validate(CreateUserValidator)
        const data = request.only(['name', 'email', 'gender', 'birth_city_id', 'birth_time', 'password', 'biography'])
        
        // upload photo
        const profilePhoto = request.file('profile_photo')
        const profilePhotoPath = uuid() + '.' + profilePhoto.extname
        profilePhoto.clientName = profilePhotoPath
        await profilePhoto.move(Application.tmpPath('uploads'))
        data.profile_photo = profilePhotoPath

        // validate verification code
        const verification_code = request.input('verification_code')
        const validator = await UserEmailValidationSecretKey.query().where('email', data.email).where('secret_key', verification_code)
        if (!validator.length) return response.badRequest({message: 'Código de verificação inválido.'})

        // create user
        const user = await User.create(data)

        const {token} = await auth.use('api').generate(user)
        
        return {user: user.serialize(), token}
    }

    async login({request, response, auth}) {
        const email = request.input('email')
        const password = request.input('password')

        try {
            const {token} = await auth.use('api').attempt(email, password)
            const user = await User.findByOrFail('email', email)
            return {user: user.serialize(), token}
        } catch {
            return response.badRequest({message: 'Credenciais inválidas.'})
        }
    }

    async genSocketToken({auth}) {
        const token = await UserSocketToken.create({user_id: auth.user.id})
        return token.serialize()
    }
}
