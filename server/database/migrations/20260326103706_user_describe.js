/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */

export function up(knex) {
  return knex.schema.alterTable('profiledata', (table) => {
    table.string('description')
  })
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */

export function down(knex) {
  return knex.schema.alterTable('profiledata', (table) => {
    table.dropColumn('description')
  })
}
