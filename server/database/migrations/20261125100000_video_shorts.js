/**
 * Shorts are vertical videos, kept in the same table with is_short = true.
 *
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function up(knex) {
  return knex.schema.alterTable('videos', (table) => {
    table.boolean('is_short').notNullable().defaultTo(false)
  })
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function down(knex) {
  return knex.schema.alterTable('videos', (table) => {
    table.dropColumn('is_short')
  })
}
