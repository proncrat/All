/**
 * Albums are releases by one author. A song belongs to at most one album
 * (songs.album_id, ordered by songs.track_number); songs without an album are
 * singles. Deleting an album keeps its songs as singles.
 *
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.createTable('albums', (table) => {
    table.increments('id')
    table
      .integer('author_id')
      .notNullable()
      .references('id')
      .inTable('profiledata')
      .onDelete('CASCADE')
    table.string('title').notNullable()
    table.text('description')
    table.text('cover') // /images/xxx.webp, like songs.cover
    table.string('release_date', 10) // YYYY-MM-DD, kept as text so it doesn't shift timezones
    table.dateTime('created_at').notNullable().defaultTo(knex.fn.now())

    table.index(['author_id'])
  })

  await knex.schema.alterTable('songs', (table) => {
    table
      .integer('album_id')
      .nullable()
      .references('id')
      .inTable('albums')
      .onDelete('SET NULL')
    table.integer('track_number').nullable()
    table.index(['album_id', 'track_number'])
  })
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.alterTable('songs', (table) => {
    table.dropIndex(['album_id', 'track_number'])
    table.dropForeign(['album_id'])
    table.dropColumn('track_number')
    table.dropColumn('album_id')
  })
  await knex.schema.dropTableIfExists('albums')
}
