/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */

export function up(knex) {
  return knex.schema.createTable('posts', (table) => {
    table.increments('id')
    table.string('title')
    table.string('the_post')
    table.integer('views')
    table.integer('author_id')
    table.dateTime('post_date')
    table.integer('likes')
    table.integer('dislikes')
    table.integer('shares')
  })
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */

export function down(knex) {
  return knex.schema.dropTable('posts')
}
