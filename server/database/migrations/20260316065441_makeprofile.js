/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function up(knex) {
  return knex.schema.createTable('profiledata', (table) => {
    table.increments('id')
    table.string('link_id')
    table.string('name')
    table.string('describe')
    table.integer('followers').defaultTo(0)
    table.string('peer_id')
    table.string('pfp')
    table.string('banner')
    table.string('bg')
    table.string('description').defaultTo('Bro make a description.')
  })
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function down(knex) {
  return knex.schema.dropTable('profiledata')
}
