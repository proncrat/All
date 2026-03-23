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
      pfp: 'https://scontent.fakl5-1.fna.fbcdn.net/v/t39.30808-6/482071674_1196455441812169_3397838942900915000_n.jpg?_nc_cat=100&ccb=1-7&_nc_sid=dd6889&_nc_ohc=BBLt7gmyC9YQ7kNvwEhhbAv&_nc_oc=Adp3ROftp2PgbpQGqCjNh4t9pDk90Dy5eTz7V6feozfslqpJMs2QWLWNSHJi3PaN0iBjfU1BlGLm8hWpmJXu7NdC&_nc_zt=23&_nc_ht=scontent.fakl5-1.fna&_nc_gid=FSi4zSOQTpJJo-duLAZYjA&_nc_ss=8&oh=00_AfwDwM52f3FXStPZ8Tr_nnmVX5xec42qV6WMD6YO0rafSQ&oe=69C0EBC3',
    },
    {
      id: 2,
      name: 'Jean',
      describe: 'Jeans',
      followers: '420',
      pfp: 'https://dk2dv4ezy246u.cloudfront.net/widgets/sSoFDYe3ZbPQ_large.jpg',
    },
    {
      id: 3,
      name: 'Goth',
      describe: 'Black dress ahhh',
      followers: '52000000',
      pfp: 'https://i.pinimg.com/736x/fd/c9/5e/fdc95e24e075e75d99aea0f188152454.jpg',
    },
  ])
}
