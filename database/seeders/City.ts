import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import City from 'App/Models/City'
import { City as CityDb, Country, State }  from 'country-state-city';
import Logger from '@ioc:Adonis/Core/Logger'

export default class CitySeeder extends BaseSeeder {
  public async run () {
    console.log('Carregando regiões...')
    const totalRegions = CityDb.getAllCities().length
    var totalLoadedRegions = 0

    function logNewRegion(i: number = 1) {
      totalLoadedRegions = totalLoadedRegions + i
      process.stdout.moveCursor(0, -1)
      process.stdout.clearLine(1)
      Logger.info(`${(Math.round((totalLoadedRegions/totalRegions)*100))}% (total: ${totalRegions}) cidades carregadas.`)
    }

    const countries = Country.getAllCountries()
    // create countries
    for (const countryData of countries) {
      const states = State.getStatesOfCountry(countryData.isoCode)
      for (const stateData of states) {
        const cities = CityDb.getCitiesOfState(countryData.isoCode, stateData.isoCode)
        await City.updateOrCreateMany(['name', 'state', 'country'], cities.map(cityData => ({
          name: cityData.name,
          state: stateData.name,
          country: countryData.name,
          latitude: Number(Number(cityData.latitude).toFixed(4)),
          longitude: Number(Number(cityData.longitude).toFixed(4))
        })))
        logNewRegion(cities.length)
      }
    }
  }
}
