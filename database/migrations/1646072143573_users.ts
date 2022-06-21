import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class UsersSchema extends BaseSchema {
  protected tableName = 'users'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.string('name', 255).notNullable()
      table.string('email', 255).notNullable()
      table.string('biography', 255)
      table.string('profile_photo', 64).notNullable()
      table.string('gender', 16).notNullable()
      table.integer('birth_city_id').notNullable().references('cities.id')
      table.datetime('birth_time').notNullable()
      table.decimal('sun', 17, 14)
      table.string('sun_name')
      table.decimal('moon', 17, 14)
      table.string('moon_name')
      table.decimal('ascendant', 17, 14)
      table.string('ascendant_name')
      table.string('password', 180).notNullable()
      table.string('remember_me_token').nullable()
      table.string('preffered_genders').notNullable()
      table.integer('preffered_age_diff').notNullable()
      table.integer('max_distance_diff').notNullable()
      table.decimal('latitude', 17, 14)
      table.decimal('longitude', 17, 14)

      /**
       * Uses timestampz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('updated_at', { useTz: true }).notNullable()
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
