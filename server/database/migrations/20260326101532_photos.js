/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */

export function up(knex) {
  return knex.schema.createTable('photos', (table) => {
    table.increments('id')
    table.string('name')
    table.string('describe')
    table.string('url')
    table.string('thumburl')
    table.integer('author_id')
  })
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */

export function down(knex) {
  return knex.schema.dropTable('photos')
}
