// import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import Database from "@ioc:Adonis/Lucid/Database";
import City from "App/Models/City";

export default class CitiesController {
    async getCountries() {
        const countries = await Database.rawQuery('SELECT country FROM cities GROUP BY country;')
        return countries.rows.map(row => row.country)
    }

    async getStates({request}) {
        const country = request.input('country')
        const countries = await Database.rawQuery(`SELECT state FROM cities WHERE country = '${country}' GROUP BY state;`)
        return countries.rows.map(row => row.state)
    }

    async getCities({request}) {
        const country = request.input('country')
        const state = request.input('state')
        const cities = await City.query().where('country', country).where('state', state)
        return cities.map(city => city.serialize({
            fields: {
                pick: ['id', 'name', 'state', 'country']
            }
        }))
    }
}
