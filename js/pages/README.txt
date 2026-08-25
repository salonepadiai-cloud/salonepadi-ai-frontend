# SalonePadi AI — Chat Master Module

Replace your existing frontend chat controller with:

js/pages/chat.js

And keep the modular files under:

js/pages/chat/

Core files:
- audio.js
- messages.js
- conversations.js
- chat-state.js
- feature-loader.js

Future feature files are already wired by feature-loader.js:
- sidebar.js
- composer.js
- settings.js
- profile.js
- voice.js
- attachments.js
- message-actions.js
- search.js
- project-mode.js

Future feature contract:

export function init(context) {
  // feature code

  return () => {
    // cleanup
  };
}

Important:
The feature loader isolates feature failures so one optional module
does not blank the entire chat interface.

The AI backend API contract remains unchanged.
