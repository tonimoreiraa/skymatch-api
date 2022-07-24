// import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import User from "App/Models/User"
import UserEmailValidationSecretKey from "App/Models/UserEmailValidationSecretKey"
import CreateEmailValidationValidator from "App/Validators/CreateEmailValidationValidator"
import CreateUserValidator from "App/Validators/CreateUserValidator"
import { v4 as uuid } from 'uuid'
import Application from '@ioc:Adonis/Core/Application'
import UserSocketToken from "App/Models/UserSocketToken"
import AstrologicoApi from "App/Api/AstrologicoApi"
import City from "App/Models/City"
import Env from '@ioc:Adonis/Core/Env';
import { google } from "googleapis";
import Mail from "@ioc:Adonis/Addons/Mail"
export default class AuthController {

    async calculate(cityId: number, birthTime: Date|string): Promise<{sun: number, moon: number, ascendant: number, sunName: string, moonName: string, ascendantName: string}> {
        const city = await City.findOrFail(cityId)
        const { data: dateConversion } = await AstrologicoApi.post('/dateconversion', {
            timestamp: new Date(birthTime).getTime(),
            location: [city.latitude, city.longitude]
        })
        if (dateConversion.status != 'OK') {
            throw new Error('O limite diário de usuários foi atingido, tente novamente mais tarde.')
        }
        const zodiac = ['aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo', 'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces']
        return {
            sun: dateConversion.date.sun,
            moon: dateConversion.date.moon,
            ascendant: dateConversion.date.ascendant,
            sunName: zodiac[Math.floor(dateConversion.date.sun / 30)],
            moonName: zodiac[Math.floor(dateConversion.date.moon / 30)],
            ascendantName: zodiac[Math.floor(dateConversion.date.ascendant / 30)]
        }
    }

    async createEmailValidation({request}) {
        await request.validate(CreateEmailValidationValidator)
        const email = request.input('email')
        const key = await UserEmailValidationSecretKey.create({email})

        await Mail.send((message) => {
            message
            .from(Env.get('SMTP_USERNAME'))
            .to(email)
            .subject('Seu código de verificação SkyMatch')
            .htmlView('verification_code', { code: key.secret_key })
            .watch('Bem vindo ao SkyMatch, seu código é ' + key.secret_key)
        })
    }

    async editProfile({request, auth}) {
        const data = request.only(['name', 'gender', 'birth_city_id', 'birth_time', 'biography', 'latitude', 'longitude', 'max_distance_diff', 'preffered_genders'])
        
        // upload photo
        const profilePhoto = request.file('profile_photo', {size: '2mb', extnames: ['jpg', 'png']})
        if (profilePhoto) {
            const profilePhotoPath = uuid() + '.' + profilePhoto.extname
            profilePhoto.clientName = profilePhotoPath
            await profilePhoto.move(Application.tmpPath('uploads'))
            data.profile_photo = profilePhotoPath
        }

        // calculate
        if ((data.birth_city_id && auth.user.birth_city_id != data.birth_city_id) || (data.birth_time && auth.user.birth_time != data.birth_time)) {
            const planets = await this.calculate(data.birth_city_id, data.birth_time)
            data.sun = planets.sun
            data.sun_name = planets.sunName
            data.moon = planets.moon
            data.moon_name = planets.moonName
            data.ascendant = planets.ascendant
            data.ascendant_name = planets.ascendantName
        }

        // update user
        const user = await User.updateOrCreate({id: auth.user.id}, data)

        return user.serialize()
    }

    async register({request, response, auth}) {
        await request.validate(CreateUserValidator)
        const data = request.only(['name', 'email', 'gender', 'birth_city_id', 'birth_time', 'password', 'biography', 'preffered_genders', 'max_distance_radar'])
        
        // preffered age
        const prefferedAge = JSON.parse(request.input('preffered_age_interval'))
        data.preffered_min_age = prefferedAge[0]
        data.preffered_max_age = prefferedAge[1]

        // upload photo
        const profilePhoto = request.file('profile_photo')
        if (profilePhoto) {
            const profilePhotoPath = uuid() + '.' + profilePhoto.extname
            profilePhoto.clientName = profilePhotoPath
            await profilePhoto.move(Application.tmpPath('uploads'))
            data.profile_photo = profilePhotoPath
        } else {
            data.profile_photo = 'default-profilephoto.svg'
        }

        // validate verification code
        const verification_code = request.input('code')
        const validator = await UserEmailValidationSecretKey.query().where('email', data.email).where('secret_key', verification_code)
        if (!validator.length) return response.badRequest({message: 'Código de verificação inválido.'})

        // get planets positions at birth
        const planets = await this.calculate(data.birth_city_id, data.birth_time)
        data.sun = planets.sun
        data.sun_name = planets.sunName
        data.moon = planets.moon
        data.moon_name = planets.moonName
        data.ascendant = planets.ascendant
        data.ascendant_name = planets.ascendantName

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

    async googleLogin({request, auth}) {
        const code = request.input('code')

        // get auth token
        const Oauth2Client = new google.auth.OAuth2(Env.get('GOOGLE_CLIENT_ID'), Env.get('GOOGLE_CLIENT_SECRET'))
        const { tokens } = await Oauth2Client.getToken(code)

        // create auth client
        const authClient = new google.auth.OAuth2()
        authClient.setCredentials({access_token: tokens.access_token})

        // get user data
        const oauth2 = google.oauth2({version: 'v2', auth: authClient})
        const {data: userData} = await oauth2.userinfo.get()

        const user = await User.findBy('email', userData.email)
    
        if (user) {
            const {token} = await auth.use('api').generate(user)
            return { type: 'signin', user: user.serialize(), token }
        }

        // get birthdays and genders
        const people = google.people({ version: 'v1', auth: authClient })
        const {data: data} = await people.people.get({resourceName: 'people/me', personFields: 'birthdays,genders'})

        const birthday = data.birthdays ? data.birthdays[0].date : undefined
        return {
            type: 'continue-signup',
            email: userData.email,
            name: userData.name,
            profilePhoto: userData.picture,
            birthTime: birthday ? new Date(`${birthday.year}-${birthday.month}-${birthday.day}`).getTime() : undefined,
            gender: data.genders ? data.genders[0].value : undefined,
        }
    }
}
