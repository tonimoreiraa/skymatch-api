import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Messages extends BaseSchema {
  protected tableName = 'messages'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      table.string('type').notNullable()
      table.string('content', 255).notNullable()
      table.integer('from').notNullable().references('users.id')
      table.integer('to').notNullable().references('users.id')
      table.boolean('delivered').defaultTo(false).notNullable()
      table.boolean('viewed').defaultTo(false).notNullable()

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
