import { createAudioButton } from "./audio.js";

/*
|--------------------------------------------------------------------------
| MESSAGE RENDERER
|--------------------------------------------------------------------------
|
| This file controls how messages appear in the chat.
|
| chat.js does NOT need to know how audio works.
|
| AI message
|    ↓
| messages.js
|    ↓
| audio.js
|
|--------------------------------------------------------------------------
*/

export function addMessage(
  messagesContainer,
  role,
  content,
  displayName = "User"
) {
  if (!messagesContainer) {
    return;
  }

  const safeContent =
    String(content ?? "");

  const isUser =
    role === "user";

  /*
  |--------------------------------------------------------------------------
  | MESSAGE ROW
  |--------------------------------------------------------------------------
  */

  const row =
    document.createElement("div");

  row.className =
    isUser
      ? "message-row message-row-user"
      : "message-row message-row-ai";


  /*
  |--------------------------------------------------------------------------
  | AVATAR
  |--------------------------------------------------------------------------
  */

  const avatar =
    document.createElement("div");

  avatar.className =
    "message-avatar";

  avatar.textContent =
    isUser
      ? getInitials(displayName)
      : "🦁";


  /*
  |--------------------------------------------------------------------------
  | BUBBLE
  |--------------------------------------------------------------------------
  */

  const bubble =
    document.createElement("div");

  bubble.className =
    isUser
      ? "message-bubble user-message"
      : "message-bubble ai-message";


  /*
  |--------------------------------------------------------------------------
  | USER MESSAGE
  |--------------------------------------------------------------------------
  */

  if (isUser) {

    bubble.innerHTML = `
      <div class="message-text"></div>
    `;

    const text =
      bubble.querySelector(
        ".message-text"
      );

    text.textContent =
      safeContent;

  }


  /*
  |--------------------------------------------------------------------------
  | AI MESSAGE
  |--------------------------------------------------------------------------
  */

  else {

    bubble.innerHTML = `
      <div class="message-name">
        SalonePadi AI
      </div>

      <div class="message-text"></div>

      <div class="message-actions"></div>
    `;


    /*
    |--------------------------------------------------------------------------
    | AI TEXT
    |--------------------------------------------------------------------------
    */

    const text =
      bubble.querySelector(
        ".message-text"
      );

    /*
     * Use the existing formatter if chat.js
     * exposes it globally.
     *
     * Otherwise safely display the text.
     */

    if (
      typeof window.formatAIText ===
      "function"
    ) {

      text.innerHTML =
        window.formatAIText(
          safeContent
        );

    } else {

      text.textContent =
        safeContent;

    }


    /*
    |--------------------------------------------------------------------------
    | AUDIO BUTTON
    |--------------------------------------------------------------------------
    */

    const actions =
      bubble.querySelector(
        ".message-actions"
      );

    try {

      const audioButton =
        createAudioButton(
          safeContent
        );

      if (audioButton) {

        actions.appendChild(
          audioButton
        );

      }

    } catch (error) {

      console.warn(
        "SalonePadi audio button error:",
        error
      );

    }

  }


  /*
  |--------------------------------------------------------------------------
  | ADD MESSAGE TO DOM
  |--------------------------------------------------------------------------
  */

  row.append(
    avatar,
    bubble
  );

  messagesContainer.appendChild(
    row
  );


  /*
  |--------------------------------------------------------------------------
  | SCROLL
  |--------------------------------------------------------------------------
  */

  requestAnimationFrame(() => {

    messagesContainer.scrollTo({
      top:
        messagesContainer.scrollHeight,
      behavior:
        "smooth"
    });

  });


  return row;
}


/*
|--------------------------------------------------------------------------
| USER INITIALS
|--------------------------------------------------------------------------
*/

function getInitials(name) {

  const value =
    String(name || "User")
      .trim();

  if (!value) {
    return "U";
  }

  const parts =
    value.split(/\s+/);

  if (parts.length >= 2) {

    return (
      parts[0][0] +
      parts[parts.length - 1][0]
    ).toUpperCase();

  }

  return value
    .slice(0, 2)
    .toUpperCase();

}
