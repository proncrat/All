/**
 * One row per (user, target, kind). Likes and dislikes are mutually exclusive
 * (enforced in server/database/index.ts); saves and reposts are independent.
 *
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function up(knex) {
  return knex.schema.createTable('reactions', (table) => {
    table.increments('id')
    table
      .integer('user_id')
      .notNullable()
      .references('id')
      .inTable('profiledata')
      .onDelete('CASCADE')
    table.string('target_type').notNullable() // video | post | photo | song
    table.integer('target_id').notNullable()
    table.string('kind').notNullable() // like | dislike | save | repost
    table.dateTime('created_at').notNullable().defaultTo(knex.fn.now())

    table.unique(['user_id', 'target_type', 'target_id', 'kind'])
    table.index(['target_type', 'target_id', 'kind'])
  })
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function down(knex) {
  return knex.schema.dropTable('reactions')
}
