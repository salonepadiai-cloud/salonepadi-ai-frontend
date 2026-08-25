# SalonePadi AI — Chat Module README

## Purpose

This folder is the **modular chat system** for SalonePadi AI.

The main goal is simple:

> **Do not keep putting every new feature inside the huge `chat.js` file.**

`chat.js` is the master controller. Feature-specific work should live in its own file inside:

```text
js/
└── pages/
    ├── chat.js
    └── chat/
        ├── attachments.js
        ├── audio.js
        ├── chat-state.js
        ├── composer.js
        ├── conversations.js
        ├── feature-loader.js
        ├── message-actions.js
        ├── messages.js
        ├── profile.js
        ├── project-mode.js
        ├── search.js
        ├── settings.js
        ├── sidebar.js
        └── voice.js
```

---

# 1. `chat.js` — MASTER CONTROLLER

**Location:** `js/pages/chat.js`

This is the main chat page and the central coordinator.

It is responsible for:

- Rendering the main chat interface.
- Rendering the left recent-chat sidebar.
- Rendering the right profile/sidebar panel.
- Checking authentication.
- Connecting to the existing `api.js`.
- Creating/loading/switching conversations.
- Sending messages to the backend.
- Loading saved messages.
- Calling the message renderer.
- Managing the composer and send state.
- Updating recent-chat titles.
- Loading optional chat feature modules.
- Keeping optional feature failures from blanking the entire UI.

### Important rule

**Do not add a large new feature directly to `chat.js` unless it is genuinely core chat orchestration.**

If we want a new feature, first ask:

> "Can this live in its own file under `js/pages/chat/`?"

Usually the answer should be **yes**.

---

# 2. `audio.js` — PLAY / LISTEN BUTTON

**Location:** `js/pages/chat/audio.js`

This file controls the **▶ Listen** button for AI responses.

Current implementation uses the browser's:

```text
window.speechSynthesis
```

It handles:

- Creating the ▶ button.
- Starting speech.
- Changing ▶ to ■ while playing.
- Stopping the current speech.
- Resetting the button when speech ends.
- Cleaning AI text before reading it aloud.
- Making sure only one response plays at a time.

### Current limitation

This is browser text-to-speech.

It does **not** use the backend or an AI voice API.

### Future upgrades belong here

Examples:

- Better voice selection.
- Voice speed control.
- Sierra Leone voice/persona options.
- Pause/resume.
- Read from a specific message.
- AI-generated audio.
- Download/share audio.
- Automatic read-aloud mode.

Do not move audio logic back into `chat.js`.

---

# 3. `messages.js` — MESSAGE RENDERER

**Location:** `js/pages/chat/messages.js`

This file controls how individual messages appear in the chat.

It handles:

- User message rendering.
- AI message rendering.
- User/avatar display.
- `SalonePadi AI` message name.
- AI text formatting.
- Code block rendering.
- Code copy buttons.
- AI response action area.
- The audio ▶ button.
- Scrolling to the newest message.

### Future upgrades belong here

Examples:

- Regenerate button.
- Copy response.
- Like/dislike.
- Edit message.
- Delete message.
- Message timestamps.
- Markdown improvements.
- Better code blocks.
- Image messages.
- File messages.

---

# 4. `conversations.js` — RECENT CHATS

**Location:** `js/pages/chat/conversations.js`

This file handles conversation data helpers.

It connects to:

```text
GET  /api/chat/conversations
POST /api/chat/conversations
GET  /api/chat/conversations/:id/messages
```

It handles:

- Loading conversations.
- Sorting recent conversations.
- Creating conversations.
- Loading a selected conversation's messages.
- Creating a useful display title from the first user message.
- Remembering titles locally for the signed-in user.

### Important

This is the module to update when we improve:

- Recent chats.
- Chat names.
- Chat ordering.
- Conversation switching.
- Conversation title generation.
- Local title caching.

The backend remains the source of conversation data.

---

# 5. `chat-state.js` — SHARED CHAT STATE

**Location:** `js/pages/chat/chat-state.js`

This keeps small pieces of frontend state together.

Current state includes:

- `conversationId`
- `conversationTitle`
- `isSending`
- `isPlaying`
- `isListening`
- `selectedMessageId`
- `destroyed`

It also provides:

```text
setConversation()
destroy()
```

### Important

This is **frontend UI state**.

It is NOT the SalonePadi AI memory/brain.

Do not confuse this with backend AI memory.

Future UI state can be added here when it is shared by multiple chat modules.

---

# 6. `feature-loader.js` — FEATURE CONNECTOR

**Location:** `js/pages/chat/feature-loader.js`

This is one of the most important files in the modular system.

It tells the master chat which feature modules exist.

Current modules include:

```text
sidebar.js
composer.js
settings.js
profile.js
voice.js
attachments.js
message-actions.js
search.js
project-mode.js
```

Each feature can expose:

```js
export function init(context) {
  // feature setup

  return () => {
    // cleanup
  };
}
```

### Why this exists

If one optional feature has a problem, the loader isolates that error instead of allowing the whole chat UI to go dark.

### When adding a new feature

Example:

```text
js/pages/chat/theme.js
```

Then add it to the module list in `feature-loader.js`.

The new feature can then initialize independently.

---

# 7. `sidebar.js` — SIDEBAR FEATURES

**Location:** `js/pages/chat/sidebar.js`

This is the home for sidebar-specific upgrades.

Current purpose:

- Provides a modular place for sidebar behaviour.
- Receives the master chat context.
- Keeps future sidebar logic outside `chat.js`.

### Future features

Examples:

- Better recent-chat animations.
- Pin chat.
- Rename chat.
- Delete chat.
- Archive chat.
- Chat folders.
- Search recent chats.
- Mobile sidebar improvements.

---

# 8. `composer.js` — MESSAGE INPUT

**Location:** `js/pages/chat/composer.js`

This is the future home for composer/input upgrades.

Current file is a feature hook.

### Future features

Examples:

- Slash commands.
- Draft saving.
- Attachments.
- Voice controls.
- Character counter.
- Better auto-resize.
- Stop generating button.
- Prompt suggestions.
- Quick actions.
- Emoji picker.

The basic message sending flow remains coordinated by `chat.js`.

---

# 9. `settings.js` — SETTINGS

**Location:** `js/pages/chat/settings.js`

This is the dedicated module for chat settings.

Current file is a feature hook.

### Future settings

Examples:

- Theme.
- Dark/light mode.
- AI personality.
- Voice settings.
- Auto-play responses.
- Language.
- Message density.
- Chat behavior.
- Project Mode toggle.
- Live conversation toggle.

Do not put a large settings system directly into `chat.js`.

---

# 10. `profile.js` — PROFILE

**Location:** `js/pages/chat/profile.js`

This is the dedicated module for profile-related chat UI.

Current file is a feature hook.

### Future features

Examples:

- Profile information.
- Avatar.
- Display name.
- Email.
- Account preferences.
- Profile editing.
- Account actions.

---

# 11. `voice.js` — LIVE CONVERSATION

**Location:** `js/pages/chat/voice.js`

This is reserved for the **live conversation** system.

Current file is intentionally isolated and does not control normal text chat.

### Planned responsibilities

- Microphone permission.
- Speech recognition.
- Listening state.
- Voice turn-taking.
- Live conversation UI.
- Automatic speech output.
- Start/stop live conversation.
- Error handling.

### Important

Normal text chat must continue working if voice is unsupported.

That is why voice is isolated here.

---

# 12. `attachments.js` — FILE / IMAGE ATTACHMENTS

**Location:** `js/pages/chat/attachments.js`

This is the future home for attachments.

Current file is a feature hook.

### Future features

Examples:

- Upload image.
- Upload PDF.
- Upload document.
- Preview attachments.
- Remove attachment.
- Send attachment metadata to backend.
- File size validation.
- Upload progress.

Do not mix upload logic into the core message renderer unless necessary.

---

# 13. `message-actions.js` — MESSAGE TOOLS

**Location:** `js/pages/chat/message-actions.js`

This is reserved for actions performed on individual messages.

Planned features:

- Copy full AI response.
- Regenerate response.
- Edit user message.
- Delete message.
- Like/dislike.
- Report response.
- Share response.

These actions should stay separate from the basic rendering logic.

---

# 14. `search.js` — CHAT SEARCH

**Location:** `js/pages/chat/search.js`

This is reserved for searching conversations/messages.

Future features:

- Search recent chats.
- Search message text.
- Search by date.
- Search by conversation.
- Highlight matches.
- Open the matching conversation.

If backend search is eventually required, this module can call new API endpoints without redesigning the entire chat page.

---

# 15. `project-mode.js` — PROJECT ASSISTANT MODE

**Location:** `js/pages/chat/project-mode.js`

This is reserved for the lightweight **Project Mode** idea.

Possible project state:

```text
Files
Tech stack
Current task
Recent decisions
Next step
Project summary
```

Example commands we discussed:

```text
!add-file src/app.js
!set-stack node+react
!summary
```

### Important

Project Mode is not the permanent AI memory system.

It is a lightweight project-context layer.

The real long-term AI memory should remain a backend/database feature.

---

# HOW THE FILES CONNECT

The basic architecture is:

```text
                    chat.js
                       |
        +--------------+--------------+
        |              |              |
   chat-state     conversations   messages
        |                              |
        |                         audio.js
        |
        +--------- feature-loader
                         |
        +--------+-------+-------+-------+
        |        |       |       |       |
     sidebar composer settings profile voice
        |
        +--------+---------+---------+----------+
                 |         |         |
            attachments  search  project-mode
                           |
                    message-actions
```

`chat.js` is the coordinator.

The feature files are specialists.

---

# WHAT TO EDIT WHEN ADDING A NEW FEATURE

Use this rule:

### ▶ Play button / AI reading aloud

Edit:

```text
audio.js
```

### 🎙️ Live conversation

Edit:

```text
voice.js
```

### 📎 File/image upload

Edit:

```text
attachments.js
```

### 💬 Message appearance

Edit:

```text
messages.js
```

### 🔄 Regenerate / copy / delete / feedback

Edit:

```text
message-actions.js
```

### 🔎 Chat search

Edit:

```text
search.js
```

### ⚙️ Settings

Edit:

```text
settings.js
```

### 👤 Profile

Edit:

```text
profile.js
```

### ☰ Recent chats/sidebar

Edit:

```text
sidebar.js
conversations.js
```

### 🧠 Lightweight project context

Edit:

```text
project-mode.js
```

### 📝 Input box / composer

Edit:

```text
composer.js
```

### 🔗 Shared temporary UI state

Edit:

```text
chat-state.js
```

### 🧩 Connecting a completely new feature module

Edit:

```text
feature-loader.js
```

Only touch `chat.js` when the new feature genuinely needs core chat orchestration or a new shared element.

---

# IMPORTANT RULES FOR FUTURE UPDATES

## Rule 1 — Do not rewrite the 1500+ line master file unnecessarily

Before touching `chat.js`, check whether the feature has an appropriate sub-file.

---

## Rule 2 — One feature = one responsible file

For example:

```text
voice.js
```

should own voice logic.

Do not create:

```text
voice-code-1.js
voice-code-final.js
voice-new.js
voice-fixed.js
```

unless there is a real architectural reason.

---

## Rule 3 — Keep normal text chat independent

Voice, attachments, search and other optional features must not be allowed to break normal AI chat.

---

## Rule 4 — Preserve existing API routes

The current chat backend uses:

```text
GET  /api/chat/conversations
POST /api/chat/conversations
GET  /api/chat/conversations/:id/messages
POST /api/chat/conversations/:id/messages
```

Do not change these routes just to make a frontend feature easier.

If a feature needs a new backend capability, add a new endpoint deliberately.

---

## Rule 5 — Preserve imports

`chat.js` currently depends on the existing authentication and API modules.

Core imports include:

```text
../auth.js
../api.js
```

Do not change these paths unless the project structure changes.

---

## Rule 6 — Test after every module change

After changing one feature:

1. Open the app.
2. Log in.
3. Open the chat.
4. Send a message.
5. Check the AI response.
6. Check recent chats.
7. Switch chats.
8. Test the changed feature.
9. Check mobile layout.

If the page goes dark, inspect the browser console for the first JavaScript error.

---

# CURRENT STATUS

### Working/core

- Authentication guard.
- Chat interface.
- Backend API connection.
- Conversation creation.
- Recent conversation loading.
- Conversation switching.
- Message loading.
- Message sending.
- AI response rendering.
- AI text formatting.
- Code-copy controls.
- Mobile sidebar structure.
- Profile/sidebar structure.
- Logout.
- Audio ▶ button.
- Modular feature loading.
- Conversation title generation/caching.

### Reserved for future implementation

- Full live voice conversation.
- File/image uploads.
- Advanced settings.
- Full profile editing.
- Message regeneration/actions.
- Full chat search.
- Full Project Mode.
- Advanced composer features.

---

# FUTURE FEATURE WORKFLOW

When you want a new feature, tell me:

```text
Feature:
Where:
What it should do:
What should NOT change:
```

Example:

```text
Feature: Live Conversation
Where: js/pages/chat/voice.js
What it should do: Let me talk to SalonePadi AI and hear the response.
What should NOT change: Normal text chat, recent chats, login, API and messages.
```

Then the implementation should stay inside the appropriate module as much as possible.

---

# MASTER ARCHITECTURE PRINCIPLE

```text
chat.js
    =
MASTER CONTROLLER

chat/*.js
    =
SPECIALIZED FEATURES

api.js
    =
BACKEND COMMUNICATION

auth.js
    =
AUTHENTICATION

BACKEND
    =
DATABASE + AI + LONG-TERM MEMORY
```

This separation is intentional.

The goal is to keep SalonePadi AI expandable without turning the master chat controller into an unmanageable file again.

---

# BEFORE EDITING ANY FILE

Read this README first.

Then identify the feature's owner.

**Do not modify unrelated modules.**

If a new feature does not fit an existing module, create a new module under:

```text
js/pages/chat/
```

and connect it through the feature system.

That is the rule that keeps the SalonePadi AI chat interface modular.
