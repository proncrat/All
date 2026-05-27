/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */

export async function seed(knex) {
  // Deletes ALL existing entries
  await knex('chats').del()
  await knex('chats').insert([
    {
      chatid: 1,
      ownerid: 1,
      recieverid: 2,
    },
    {
      chatid: 1,
      ownerid: 2,
      recieverid: 1,
    },
    {
      chatid: 2,
      ownerid: 2,
      recieverid: 3,
    },
    {
      chatid: 2,
      ownerid: 3,
      recieverid: 2,
    },
  ])
}
