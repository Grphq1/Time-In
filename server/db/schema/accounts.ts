import { sqliteTable, integer, text, uniqueIndex } from 'drizzle-orm/sqlite-core'
import { users } from './users'

export const accounts = sqliteTable(
  'accounts',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    provider: text('provider').notNull(),
    providerAccountId: text('provider_account_id').notNull(),
    createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
  },
  table => [
    uniqueIndex('accounts_provider_provider_account_id_index').on(
      table.provider,
      table.providerAccountId,
    ),
  ],
)
