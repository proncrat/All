/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */

export async function seed(knex) {
  // Deletes ALL existing entries
  await knex('comments').del()
  await knex('comments').insert([
    {
      id: 1,
      link_type: 'profile',
      link_id: 1,
      author_id: 1,
      body_text: 'I dont like this man',
      post_date: '2026-03-25 20:52:12',
    },
    {
      id: 2,
      link_type: 'profile',
      link_id: 1,
      author_id: 2,
      body_text: 'I dont like this man',
      post_date: '2026-03-25 20:52:12',
    },
  ])
}
