import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class UserLikes extends BaseSchema {
  protected tableName = 'user_likes'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('user_id').notNullable().references('users.id')
      table.integer('target_id').notNullable().references('users.id')
      table.boolean('like').notNullable()

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
