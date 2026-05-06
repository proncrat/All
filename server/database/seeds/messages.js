/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */

export async function seed(knex) {
  // Deletes ALL existing entries
  await knex('messages').del()
  await knex('messages').insert([
    {
      id: 1,
      chatid: 1,
      senderid: 2,
      send_date: '2026-05-04T01:01:24.336Z',
      type: 'text',
      text: 'Bro what are you even on about cuh',
    },
    {
      id: 2,
      chatid: 1,
      senderid: 1,
      send_date: '2026-05-04T01:01:24.336Z',
      type: 'text',
      text: 'Lowkey the fault of some external force wallahi',
    },
    {
      id: 3,
      chatid: 1,
      senderid: 2,
      send_date: '2026-05-04T01:01:24.336Z',
      type: 'img',
      text: 'images/grace.jpg',
    },
  ])
}
