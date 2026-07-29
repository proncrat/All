/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function seed(knex) {
  // Deletes ALL existing entries
  await knex('status').del()
  await knex('status').insert([
    {
      userid: 'oiZ6VbOZbNaN1zbtNqk0pubBRyvkq2hS',
      status: 'online',
    },
  ])
}
