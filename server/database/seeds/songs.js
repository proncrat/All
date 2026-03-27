/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function seed(knex) {
  // Deletes ALL existing entries
  await knex('songs').del()
  await knex('songs').insert([
    {
      id: 1,
      name: 'Star Shopping',
      url: 'http://localhost:3000/audio/StarShopping.m4a',
      runtime: '2:22',
      author: 'Lil Peep',
      author_id: 1,
    },
    {
      id: 2,
      name: 'Shes so nice',
      url: 'http://localhost:3000/audio/shessonice.m4a',
      runtime: '2:43',
      author: 'Pink Guy',
      author_id: 1,
    },
  ])
}
