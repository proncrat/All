/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function seed(knex) {
  // Deletes ALL existing entries
  await knex('profiledata').del()
  await knex('profiledata').insert([
    {
      id: 1,
      name: 'Bob',
      describe: 'UH that litty fresh yo',
      followers: '69',
      pfp: 'http://localhost:3000/images/janedoe.jpg',
      description: 'This is a description1',
    },
    {
      id: 2,
      name: 'Jean',
      describe: 'Jeans',
      followers: '420',
      pfp: 'https://dk2dv4ezy246u.cloudfront.net/widgets/sSoFDYe3ZbPQ_large.jpg',
      description: 'This is a description2',
    },
    {
      id: 3,
      name: 'Goth',
      describe: 'Black dress ahhh',
      followers: '52000000',
      pfp: 'https://i.pinimg.com/736x/fd/c9/5e/fdc95e24e075e75d99aea0f188152454.jpg',
      description: 'This is a description3',
    },
  ])
}
