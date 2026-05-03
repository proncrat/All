/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function up(knex) {
  return knex.schema.createTable('messages', (table) => {
    table.increments('id')
    table.integer('chatid')
    table.integer('senderid')
    table.string('type')
    table.string('text')
    table.date('send_date')
  })
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function down(knex) {
  return knex.schema.dropTable('messages')
}
