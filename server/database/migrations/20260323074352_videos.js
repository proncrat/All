/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */

export function up(knex) {
  return knex.schema.createTable('videos', (table) => {
    table.increments('id')
    table.string('name')
    table.string('description')
    table.integer('views')
    table.integer('author_id')
    table.dateTime('post_date')
    table.integer('likes')
    table.integer('dislikes')
    table.integer('shares')
    table.string('video_link')
    table.string('thumbnail_link')
  })
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */

export function down(knex) {
  return knex.schema.dropTable('videos')
}
