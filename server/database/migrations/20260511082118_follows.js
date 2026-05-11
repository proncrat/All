/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function up(knex) {
  return knex.schema.createTable('follows', (table) => {
    table.increments('id')
    table.integer('following_user_id')
    table.integer('followed_user_id')
    table.date('created_at')
  })
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function down(knex) {
  return knex.schema.dropTable('follows')
}
