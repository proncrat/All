/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function seed(knex) {
  // Deletes ALL existing entries
  await knex('photos').del()
  await knex('photos').insert([
    {
      id: 1,
      name: 'Jane',
      describe: 'Claude make me a description',
      url: 'https://images7.alphacoders.com/138/1380955.jpg',
      thumburl: 'https://images7.alphacoders.com/138/1380955.jpg',
      author_id: 1,
    },
    {
      id: 2,
      name: 'Jane',
      describe: 'Claude make me a description',
      url: 'https://upload.wikimedia.org/wikipedia/commons/3/34/Hydrochoeris_hydrochaeris_in_Brazil_in_Petr%C3%B3polis%2C_Rio_de_Janeiro%2C_Brazil_09.jpg',
      thumburl:
        'https://upload.wikimedia.org/wikipedia/commons/3/34/Hydrochoeris_hydrochaeris_in_Brazil_in_Petr%C3%B3polis%2C_Rio_de_Janeiro%2C_Brazil_09.jpg',
      author_id: 1,
    },
    {
      id: 3,
      name: 'Jane',
      describe: 'Claude make me a description',
      url: 'https://www.bigfootdigital.co.uk/wp-content/uploads/2020/07/image-optimisation-scaled.jpg',
      thumburl:
        'https://www.bigfootdigital.co.uk/wp-content/uploads/2020/07/image-optimisation-scaled.jpg',
      author_id: 1,
    },
    {
      id: 4,
      name: 'Jane',
      describe: 'Claude make me a description',
      url: 'http://localhost:3000/images/heres-a-2k-jane-doe-wallpaper-for-you-guys-v0-l0cux9p736md1.webp',
      thumburl:
        'http://localhost:3000/images/heres-a-2k-jane-doe-wallpaper-for-you-guys-v0-l0cux9p736md1.webp',
      author_id: 1,
    },
    {
      id: 5,
      name: 'Jane',
      describe: 'Claude make me a description',
      url: 'https://upload-os-bbs.hoyolab.com/upload/2024/08/16/369285726/77b9ccb657ebb10143e7cace873b4a3a_5603297584631518023.jpg',
      thumburl:
        'https://upload-os-bbs.hoyolab.com/upload/2024/08/16/369285726/77b9ccb657ebb10143e7cace873b4a3a_5603297584631518023.jpg',
      author_id: 1,
    },
    {
      id: 6,
      name: 'Jane',
      describe: 'Claude make me a description',
      url: 'https://storage.waifuwall.com/image/264.png',
      thumburl: 'https://storage.waifuwall.com/image/264.png',
      author_id: 1,
    },
    {
      id: 7,
      name: 'Jane',
      describe: 'Claude make me a description',
      url: 'https://blueoceancdn143.blob.core.windows.net/cache/c/b/d/4/1/f/cbd41f897abe97cdb746634d06a9c95e24803996.jpg',
      thumburl:
        'https://blueoceancdn143.blob.core.windows.net/cache/c/b/d/4/1/f/cbd41f897abe97cdb746634d06a9c95e24803996.jpg',
      author_id: 1,
    },
  ])
}
