/* =========================================
   SalonePadi AI
   Messages Module

   RESPONSIBILITY:
   This file ONLY renders chat messages.

   It handles:
   - User message rendering
   - AI message rendering
   - Message avatars
   - Message text
   - AI message action area
   - Audio button attachment
   - Safe text rendering

   It does NOT:
   - Send messages
   - Call the backend
   - Manage conversations
   - Manage composer/input
   - Manage sidebar
   - Manage authentication
   - Manage chat state
   - Own AI formatting logic
   ========================================= */

import {
  createAudioButton
} from "./audio.js";

import {
  CONFIG
} from "../../config.js";


/* =========================================
   ADD MESSAGE
   ========================================= */

export function addMessage(
  messagesContainer,
  role,
  content,
  displayName = "User"
) {

  /*
   * Safety check.
   */

  if (!messagesContainer) {
    return null;
  }


  /*
   * Determine message type.
   */

  const isUser =
    role === "user";


  /* =========================================
     MESSAGE ROW
     ========================================= */

  const row =
    document.createElement(
      "div"
    );


  row.className =
    isUser
      ? "message-row message-row-user"
      : "message-row message-row-ai";


  /* =========================================
     AVATAR
     ========================================= */

  const avatar =
    document.createElement(
      "div"
    );


  avatar.className =
    "message-avatar";


  if (isUser) {

    /*
     * User avatar = initials.
     */

    avatar.textContent =
      getInitials(
        displayName
      );

  } else {

    /*
     * AI avatar = configured logo.
     */

    createAIAvatar(
      avatar
    );

  }


  /* =========================================
     MESSAGE BUBBLE
     ========================================= */

  const bubble =
    document.createElement(
      "div"
    );


  bubble.className =
    isUser
      ? "message-bubble user-message"
      : "message-bubble ai-message";


  /* =========================================
     USER MESSAGE
     ========================================= */

  if (isUser) {

    renderUserMessage(
      bubble,
      content
    );

  }


  /* =========================================
     AI MESSAGE
     ========================================= */

  else {

    renderAIMessage(
      bubble,
      content
    );

  }


  /* =========================================
     APPEND
     ========================================= */

  row.append(
    avatar,
    bubble
  );


  messagesContainer.appendChild(
    row
  );


  return row;
}


/* =========================================
   USER MESSAGE
   ========================================= */

function renderUserMessage(
  bubble,
  content
) {

  const text =
    document.createElement(
      "div"
    );


  text.className =
    "message-text";


  /*
   * IMPORTANT:
   *
   * User content uses textContent.
   *
   * This prevents user input from being
   * interpreted as HTML.
   */

  text.textContent =
    String(
      content ?? ""
    );


  bubble.appendChild(
    text
  );

}


/* =========================================
   AI MESSAGE
   ========================================= */

function renderAIMessage(
  bubble,
  content
) {

  /*
   * Message name.
   */

  const name =
    document.createElement(
      "div"
    );


  name.className =
    "message-name";


  name.textContent =
    CONFIG.appName ||
    "AI";


  /*
   * Message text.
   */

  const text =
    document.createElement(
      "div"
    );


  text.className =
    "message-text";


  /*
   * AI formatting is intentionally provided
   * by the formatter module through the global
   * bridge.
   *
   * messages.js does NOT own the formatter.
   */

  if (
    typeof window.formatAIText ===
    "function"
  ) {

    text.innerHTML =
      window.formatAIText(
        content
      );

  } else {

    /*
     * Safe fallback if the formatter has
     * not been initialized yet.
     */

    text.textContent =
      String(
        content ?? ""
      );

  }


  /*
   * Message actions.
   */

  const actions =
    document.createElement(
      "div"
    );


  actions.className =
    "message-actions";


  /*
   * Audio button belongs to the message
   * action area, but the actual audio logic
   * remains in audio.js.
   */

  try {

    const audioButton =
      createAudioButton(
        String(
          content ?? ""
        )
      );


    if (audioButton) {

      actions.appendChild(
        audioButton
      );

    }

  } catch (error) {

    console.warn(
      "Audio button creation failed:",
      error
    );

  }


  bubble.append(
    name,
    text,
    actions
  );

}


/* =========================================
   AI AVATAR
   ========================================= */

function createAIAvatar(
  avatar
) {

  /*
   * Use configured logo when available.
   */

  if (
    CONFIG?.logo
  ) {

    const logo =
      document.createElement(
        "img"
      );


    logo.src =
      CONFIG.logo;


    logo.alt =
      CONFIG.logoAlt ||
      CONFIG.appName ||
      "AI";


    logo.className =
      "message-avatar-image";


    /*
     * Safe fallback if logo fails.
     */

    logo.addEventListener(
      "error",
      () => {

        avatar.innerHTML =
          "";

        avatar.textContent =
          "AI";

      }
    );


    avatar.appendChild(
      logo
    );


    return;

  }


  /*
   * No logo configured.
   */

  avatar.textContent =
    "AI";

}


/* =========================================
   USER INITIALS
   ========================================= */

function getInitials(
  value
) {

  const text =
    String(
      value || "User"
    )
      .trim();


  if (!text) {
    return "U";
  }


  const parts =
    text.split(
      /\s+/
    );


  /*
   * First + last name.
   *
   * John Fatorma → JF
   */

  if (
    parts.length >= 2
  ) {

    return (
      parts[0][0] +
      parts[
        parts.length - 1
      ][0]
    ).toUpperCase();

  }


  /*
   * Single name.
   *
   * John → JO
   */

  return text
    .slice(
      0,
      2
    )
    .toUpperCase();

}


/* =========================================
   OPTIONAL FORMATTER BRIDGE
   =========================================

   The formatter itself will eventually live
   in its own module.

   For now messages.js simply consumes:

       window.formatAIText()

   This keeps formatting out of the renderer.
   ========================================= */
