/**
 * Images attached to a post, in display order. Deleting a post removes its
 * image rows (the files in public/images are left alone).
 *
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.createTable('post_images', (table) => {
    table.increments('id')
    table
      .integer('post_id')
      .notNullable()
      .references('id')
      .inTable('posts')
      .onDelete('CASCADE')
    table.text('url').notNullable() // /images/xxx.webp
    table.integer('position').notNullable().defaultTo(0)

    table.index(['post_id', 'position'])
  })

  // posts.the_post was varchar(255); Postgres enforces that length, SQLite
  // doesn't (and altering a column there means rebuilding the table)
  const client = String(knex.client.config.client)
  if (client === 'pg' || client === 'postgres' || client === 'postgresql') {
    await knex.schema.alterTable('posts', (table) => {
      table.text('the_post').alter()
    })
  }
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.dropTable('post_images')
}
