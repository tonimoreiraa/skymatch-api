import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import City from 'App/Models/City'

export default class CitySeeder extends BaseSeeder {
  public async run () {
    // Write your database queries inside the run method
    const data = {
      name: 'Arapiraca',
      state: 'AL',
      country: 'Brasil',
    }
    await City.updateOrCreate(data, {...data, latitude: -9.75164, longitude: -36.6604})
  }
}
