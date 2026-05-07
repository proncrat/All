/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function up(knex) {
  return knex.schema.createTable('comments', (table) => {
    table.increments('id')
    table.string('link_type')
    table.integer('link_id')
    table.integer('author_id')
    table.string('body_text')
    table.date('post_date')
  })
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function down(knex) {
  return knex.schema.dropTable('comments')
}
