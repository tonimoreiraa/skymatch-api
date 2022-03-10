import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class UserMatches extends BaseSchema {
  protected tableName = 'user_matches'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('user1_id').notNullable().references('users.id')
      table.integer('user2_id').notNullable().references('users.id')

      /**
       * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
