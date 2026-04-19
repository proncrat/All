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
      link_id: null,
      name: 'Bob',
      describe: 'UH that litty fresh yo',
      followers: '69',
      pfp: 'http://localhost:3000/images/janedoe.jpg',
      description: 'This is a description1',
      peerid: 'a86e7ef6-1818-49d4-9377-2c0c07902c09',
    },
    {
      id: 2,
      link_id: null,
      name: 'Jean',
      describe: 'Jeans',
      followers: '420',
      pfp: 'https://dk2dv4ezy246u.cloudfront.net/widgets/sSoFDYe3ZbPQ_large.jpg',
      description: 'This is a description2',
      peerid: '447ebcf1-3e0f-4738-9b64-c1804a2d21c1',
    },
    {
      id: 3,
      link_id: null,
      name: 'Goth',
      describe: 'Black dress ahhh',
      followers: '52000000',
      pfp: 'https://i.pinimg.com/736x/fd/c9/5e/fdc95e24e075e75d99aea0f188152454.jpg',
      description: 'This is a description3',
      peerid: '386c2df7-1959-4b56-bba7-956fcd1b2986',
    },
  ])
}
