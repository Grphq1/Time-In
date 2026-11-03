**Current version:** `v0.0.0` (pre-release — nothing shipped yet)

> Semver-driven roadmap. Every item below is **planned**, tagged with its
> **target** version. Check items off as they ship.

---

## Status Legend

| Symbol | Status      |
|--------|-------------|
| `[ ]`  | Planned     |
| `[~]`  | In progress |
| `[x]`  | Shipped     |

## Release Plan

| Target    | Theme                                    | Status  |
|-----------|------------------------------------------|---------|
| `v0.1.0`  | Auth & Profile foundation & index page                | Planned |
| `v0.2.0`  | Core session management                  | Planned |
| `v0.3.0`  | Realtime foundation (WebSocket, presence)| Planned |
| `v0.4.0`  | Commands & voting                        | Planned |
| `v0.5.0`  | Chat, signals & activity log             | Planned |
| `v0.6.0`  | Social (friends & users)                 | Planned |
| `v0.7.0`  | Invitations & join requests              | Planned |
| `v0.8.0`  | Analytics                                | Planned |
| `v0.9.0`  | Radio sync                               | Planned |
| `v0.10.0` | UI/UX polish                             | Planned |
| `v0.11.0` | Testing & hardening                      | Planned |
| `v1.0.0`  | Stabilization & API freeze               | Planned |

---

## Features

### User Profile & Auth — `v0.1.0`
- [ ] OAuth login (Google & GitHub)
- [ ] Landing page
- [ ] Profile management (name, avatar, visibility)
- [ ] Avatar upload
- [ ] Session-based auth with protected routes

### Core Session Management — `v0.2.0`
- [ ] Session CRUD
- [ ] Three focus methods — Pomodoro, Fixed-interval, Flowtime
- [ ] Session phases — focus, break, long-break with auto transitions
- [ ] Timer states — idle, running, paused
- [ ] Session privacy (public vs private)

### Realtime Collaboration
- [ ] **Live timer sync** (server-authoritative) — `v0.3.0`
- [ ] **Presence system** (online users, join/leave) — `v0.3.0`
- [ ] **Voting system** (propose commands, majority, timeout) — `v0.4.0`
- [ ] **Session commands** (start, pause, resume, skip, reset) — `v0.4.0`
- [ ] **Chat & signals** (ephemeral, slow-mode during focus) — `v0.5.0`
- [ ] **Activity log** — `v0.5.0`
- [ ] **Radio sync** (shared playback + station voting) — `v0.9.0`

### Social — `v0.6.0`
- [ ] Friend requests (send, accept, decline, cancel, remove)
- [ ] User search
- [ ] Invite by user ID

### Session Invitations — `v0.7.0`
- [ ] Create invitations
- [ ] Accept / decline
- [ ] List & cancel invitations
- [ ] Join-request flow

### Analytics — `v0.8.0`
- [ ] Daily activity tracking
- [ ] Timezone-aware queries
- [ ] Session phase history

### UI/UX — `v0.10.0`
- [ ] Keyboard shortcuts
- [ ] Focus mode (full-screen timer)
- [ ] Motion animations
- [ ] Skeleton loading
