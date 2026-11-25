/**
 * Replies: a comment with parent_id set is a reply to that (top-level) comment.
 * Comment likes/dislikes live in `reactions` with target_type = 'comment'.
 *
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function up(knex) {
  return knex.schema.alterTable('comments', (table) => {
    table.integer('parent_id').nullable()
    table.index(['link_type', 'link_id'])
    table.index(['parent_id'])
  })
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function down(knex) {
  return knex.schema.alterTable('comments', (table) => {
    table.dropIndex(['parent_id'])
    table.dropIndex(['link_type', 'link_id'])
    table.dropColumn('parent_id')
  })
}
