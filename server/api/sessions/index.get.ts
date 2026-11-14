export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)

  serverLogger(event).info('Listing sessions', { userId: session.user.id })

  // shortcut: session CRUD ships in v0.2.0; keep the contract stable for the UI.
  return { sessions: [] }
})
