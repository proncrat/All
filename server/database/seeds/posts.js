/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function seed(knex) {
  // Deletes ALL existing entries
  await knex('posts').del()
  await knex('posts').insert([
    {
      id: 1,
      title: 'Post1',
      the_post:
        'YAP YAP YAP YAP YAP YAP YAP YAPYAP YAP YAP YAPvYAP YAP YAP ,YAPYAP YAP YAP YAPYAP. <br> YAP YAP YAPYAP YAP YAP YAPYAP YAP YAP YAP',
      views: 15,
      author_id: 1,
      post_date: '2026-03-23 20:52:12',
      likes: 5,
      dislikes: 5,
      shares: 5,
    },
    {
      id: 2,
      title: 'Post2',
      the_post:
        'YAP YAP YAP YAP YAP YAP YAP YAPYAP YAP YAP YAPvYAP YAP YAP ,YAPYAP YAP YAP YAPYAP. <br> YAP YAP YAPYAP YAP YAP YAPYAP YAP YAP YAP',
      views: 15,
      author_id: 1,
      post_date: '2026-03-23 20:52:12',
      likes: 5,
      dislikes: 5,
      shares: 5,
    },
    {
      id: 3,
      title: 'Post3',
      the_post:
        'YAP YAP YAP YAP YAP YAP YAP YAPYAP YAP YAP YAPvYAP YAP YAP ,YAPYAP YAP YAP YAPYAP. <br> YAP YAP YAPYAP YAP YAP YAPYAP YAP YAP YAP',
      views: 15,
      author_id: 1,
      post_date: '2026-03-23 20:52:12',
      likes: 5,
      dislikes: 5,
      shares: 5,
    },
    {
      id: 4,
      title: 'Post4',
      the_post:
        'YAP YAP YAP YAP YAP YAP YAP YAPYAP YAP YAP YAPvYAP YAP YAP ,YAPYAP YAP YAP YAPYAP. <br> YAP YAP YAPYAP YAP YAP YAPYAP YAP YAP YAP',
      views: 15,
      author_id: 1,
      post_date: '2026-03-23 20:52:12',
      likes: 5,
      dislikes: 5,
      shares: 5,
    },
  ])
}
