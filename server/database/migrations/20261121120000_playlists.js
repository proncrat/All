/**
 * A playlist holds one kind of content (video | song | post | photo), the same
 * target types used by `reactions`. Items are ordered by `position`.
 *
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.createTable('playlists', (table) => {
    table.increments('id')
    table
      .integer('owner_id')
      .notNullable()
      .references('id')
      .inTable('profiledata')
      .onDelete('CASCADE')
    table.string('title').notNullable()
    table.text('description')
    table.string('type').notNullable() // video | song | post | photo
    table.boolean('is_private').notNullable().defaultTo(false)
    table.dateTime('created_at').notNullable().defaultTo(knex.fn.now())
    table.dateTime('updated_at').notNullable().defaultTo(knex.fn.now())

    table.index(['owner_id'])
  })

  await knex.schema.createTable('playlist_items', (table) => {
    table.increments('id')
    table
      .integer('playlist_id')
      .notNullable()
      .references('id')
      .inTable('playlists')
      .onDelete('CASCADE')
    table.integer('target_id').notNullable()
    table.integer('position').notNullable().defaultTo(0)
    table.dateTime('added_at').notNullable().defaultTo(knex.fn.now())

    table.unique(['playlist_id', 'target_id'])
    table.index(['playlist_id', 'position'])
  })
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.dropTableIfExists('playlist_items')
  await knex.schema.dropTableIfExists('playlists')
}
