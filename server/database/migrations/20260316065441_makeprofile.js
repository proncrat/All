/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function up(knex) {
  return knex.schema.createTable('profiledata', (table) => {
    table.increments('id')
    table.integer('link_id')
    table.string('name')
    table.string('describe')
    table.integer('followers')
    table.string('peerid')
  })
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function down(knex) {
  return knex.schema.dropTable('profiledata')
}
