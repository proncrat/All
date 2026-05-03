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
      send_date: '21/04/2026 10:16 pm',
      type: 'text',
      text: 'Bro what are you even on about cuh',
    },
    {
      id: 2,
      chatid: 1,
      senderid: 1,
      send_date: '21/04/2026 10:17 pm',
      type: 'text',
      text: 'Lowkey the fault of some external force wallahi',
    },
    {
      id: 3,
      chatid: 1,
      senderid: 2,
      send_date: '21/04/2026 10:16 pm',
      type: 'img',
      text: 'http://localhost:3000/images/grace.jpg',
    },
  ])
}
