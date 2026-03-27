/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */

export function up(knex) {
  return knex.schema.createTable('songs', (table) => {
    table.increments('id')
    table.string('name')
    table.string('url')
    table.string('runtime')
    table.string('author')
    table.integer('author_id')
  })
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */

export function down(knex) {
  return knex.schema.dropTable('songs')
}
