import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class UserSocketTokens extends BaseSchema {
  protected tableName = 'user_socket_tokens'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      table.integer('user_id').notNullable().references('users.id')
      table.string('token', 64).notNullable()

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
