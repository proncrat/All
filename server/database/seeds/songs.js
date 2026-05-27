/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function seed(knex) {
  // Deletes ALL existing entries
  await knex('songs').del()
  await knex('songs').insert([
    {
      name: 'Star Shopping',
      url: '/audio/StarShopping.m4a',
      runtime: '2:22',
      author: 'Lil Peep',
      author_id: 1,
    },
    {
      name: 'Shes so nice',
      url: '/audio/shessonice.m4a',
      runtime: '2:43',
      author: 'Pink Guy',
      author_id: 1,
    },
  ])
}
