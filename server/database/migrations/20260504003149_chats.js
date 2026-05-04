/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function up(knex) {
  return knex.schema.createTable('chats', (table) => {
    table.increments('id')
    table.integer('chatid')
    table.integer('ownerid')
    table.integer('recieverid')
    table.date('start_date')
  })
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function down(knex) {
  return knex.schema.dropTable('chats')
}
