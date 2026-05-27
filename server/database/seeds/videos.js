/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function seed(knex) {
  // Deletes ALL existing entries
  await knex('videos').del()
  await knex('videos').insert([
    {
      name: 'WOrld explodes',
      description: 'Claude make me a description',
      views: 67,
      author_id: 1,
      post_date: '2026-03-23 20:52:12',
      likes: 5,
      dislikes: 5,
      shares: 5,
      video_link:
        'https://ia601209.us.archive.org/17/items/ElephantsDream/ed_1024_512kb.mp4',
      thumbnail_link: 'https://i.ytimg.com/vi/bIsp1K8eJG0/maxresdefault.jpg',
    },
    {
      name: 'Cant think of name',
      description: 'Gok make me a descrioption',
      views: 67,
      author_id: 1,
      post_date: '2026-03-23 20:52:12',
      likes: 0,
      dislikes: 0,
      shares: 0,
      video_link:
        'https://ia601209.us.archive.org/17/items/ElephantsDream/ed_1024_512kb.mp4',
      thumbnail_link: 'https://i.ytimg.com/vi/bIsp1K8eJG0/maxresdefault.jpg',
    },
    {
      name: 'Uh mmhmm',
      description: 'Insert description here',
      views: 67,
      author_id: 1,
      post_date: '2026-03-23 20:52:12',
      likes: 0,
      dislikes: 0,
      shares: 0,
      video_link:
        'https://ia601209.us.archive.org/17/items/ElephantsDream/ed_1024_512kb.mp4',
      thumbnail_link: 'https://i.ytimg.com/vi/bIsp1K8eJG0/maxresdefault.jpg',
    },
    {
      name: 'Lorim ipsum dim sum?',
      description: 'Insert description here',
      views: 67,
      author_id: 1,
      post_date: '2026-03-23 20:52:12',
      likes: 0,
      dislikes: 0,
      shares: 0,
      video_link:
        'https://ia601209.us.archive.org/17/items/ElephantsDream/ed_1024_512kb.mp4',
      thumbnail_link: 'https://i.ytimg.com/vi/bIsp1K8eJG0/maxresdefault.jpg',
    },
    {
      name: 'War bad',
      description: 'Insert description here',
      views: 67,
      author_id: 1,
      post_date: '2026-03-23 20:52:12',
      likes: 0,
      dislikes: 0,
      shares: 0,
      video_link:
        'https://ia601209.us.archive.org/17/items/ElephantsDream/ed_1024_512kb.mp4',
      thumbnail_link: 'https://i.ytimg.com/vi/bIsp1K8eJG0/maxresdefault.jpg',
    },
  ])
}
