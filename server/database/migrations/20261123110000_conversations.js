/**
 * Group chats. A conversation has any number of members; messages.chatid
 * points at conversations.id. Leaving a chat deletes only that person's
 * conversation_members row — the conversation and its messages are kept.
 *
 * Existing chats are copied over keeping their chatid, so old messages still
 * line up. The old `chats` table (two mirrored rows per 1:1 chat) is left in
 * place but is no longer used.
 *
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.createTable('conversations', (table) => {
    table.increments('id')
    table.string('name', 100).nullable() // null = show member names
    table
      .integer('created_by')
      .nullable()
      .references('id')
      .inTable('profiledata')
      .onDelete('SET NULL')
    table.dateTime('created_at').notNullable().defaultTo(knex.fn.now())
  })

  await knex.schema.createTable('conversation_members', (table) => {
    table.increments('id')
    table
      .integer('conversation_id')
      .notNullable()
      .references('id')
      .inTable('conversations')
      .onDelete('CASCADE')
    table
      .integer('profile_id')
      .notNullable()
      .references('id')
      .inTable('profiledata')
      .onDelete('CASCADE')
    table.dateTime('joined_at').notNullable().defaultTo(knex.fn.now())

    table.unique(['conversation_id', 'profile_id'])
    table.index(['profile_id'])
  })

  // ---- copy existing chats ----
  const old = await knex('chats').select('chatid', 'ownerid', 'start_date')
  const byChat = new Map()
  for (const row of old) {
    if (row.chatid == null || row.ownerid == null) continue
    const entry = byChat.get(row.chatid) ?? { members: new Set(), start: null }
    entry.members.add(row.ownerid)
    if (row.start_date != null) entry.start = row.start_date
    byChat.set(row.chatid, entry)
  }

  const profileIds = new Set(
    (await knex('profiledata').select('id')).map((r) => r.id),
  )

  for (const [chatid, { members, start }] of byChat) {
    const valid = [...members].filter((id) => profileIds.has(id))
    await knex('conversations').insert({
      id: chatid,
      name: null,
      created_by: valid[0] ?? null,
      created_at: start ? new Date(start) : new Date(),
    })
    if (valid.length) {
      await knex('conversation_members').insert(
        valid.map((profile_id) => ({ conversation_id: chatid, profile_id })),
      )
    }
  }

  // Postgres: explicit ids don't advance the serial, so move it past them
  const client = String(knex.client.config.client)
  if (client === 'pg' || client === 'postgres' || client === 'postgresql') {
    await knex.raw(
      `SELECT setval(pg_get_serial_sequence('conversations', 'id'),
        GREATEST((SELECT COALESCE(MAX(id), 0) FROM conversations), 1))`,
    )
  }
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.dropTable('conversation_members')
  await knex.schema.dropTable('conversations')
}
