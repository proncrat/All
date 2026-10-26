/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.alterTable('photos', (table) => {
    table.timestamp('uploaded_at').nullable()
  })

  // Backfill existing rows
  await knex('photos').update({ uploaded_at: knex.fn.now() })
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.alterTable('photos', (table) => {
    table.dropColumn('uploaded_at')
  })
}
