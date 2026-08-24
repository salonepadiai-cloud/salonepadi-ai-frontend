import { createAudioButton } from "./audio.js";

/*
|--------------------------------------------------------------------------
| MESSAGE RENDERER
|--------------------------------------------------------------------------
|
| Handles:
| - User messages
| - AI messages
| - AI audio/play button
| - Message scrolling
|
| Keep this file focused only on messages.
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

  const row =
    document.createElement("div");

  const isUser =
    role === "user";

  row.className =
    `message-row ${
      isUser
        ? "user-row"
        : "ai-row"
    }`;

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
  | MESSAGE BUBBLE
  |--------------------------------------------------------------------------
  */

  const bubble =
    document.createElement("div");

  bubble.className =
    `bubble ${
      isUser
        ? "user-bubble"
        : "ai-bubble"
    }`;

  /*
  |--------------------------------------------------------------------------
  | USER MESSAGE
  |--------------------------------------------------------------------------
  */

  if (isUser) {
    const text =
      document.createElement("div");

    text.className =
      "message-text";

    text.textContent =
      String(content ?? "");

    bubble.appendChild(text);
  }

  /*
  |--------------------------------------------------------------------------
  | AI MESSAGE
  |--------------------------------------------------------------------------
  */

  else {
    const title =
      document.createElement("strong");

    title.textContent =
      "SalonePadi AI";

    const text =
      document.createElement("div");

    text.className =
      "message-text";

    text.textContent =
      String(content ?? "");

    /*
    |--------------------------------------------------------------------------
    | MESSAGE ACTIONS
    |--------------------------------------------------------------------------
    */

    const actions =
      document.createElement("div");

    actions.className =
      "message-actions";

    /*
    |--------------------------------------------------------------------------
    | PLAY AUDIO BUTTON
    |--------------------------------------------------------------------------
    */

    try {
      const audioButton =
        createAudioButton(
          String(content ?? "")
        );

      if (audioButton) {
        actions.appendChild(
          audioButton
        );
      }
    } catch (error) {
      console.warn(
        "Unable to create audio button:",
        error
      );
    }

    bubble.append(
      title,
      text,
      actions
    );
  }

  /*
  |--------------------------------------------------------------------------
  | ADD TO CHAT
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
  | SCROLL TO NEWEST MESSAGE
  |--------------------------------------------------------------------------
  */

  requestAnimationFrame(() => {
    messagesContainer.scrollTo({
      top:
        messagesContainer.scrollHeight,
      behavior: "smooth"
    });
  });
}


/*
|--------------------------------------------------------------------------
| INITIALS
|--------------------------------------------------------------------------
*/

function getInitials(value) {
  const text =
    String(value || "User")
      .trim();

  if (!text) {
    return "U";
  }

  const parts =
    text.split(/\s+/);

  if (parts.length >= 2) {
    return (
      parts[0][0] +
      parts[parts.length - 1][0]
    ).toUpperCase();
  }

  return text
    .slice(0, 2)
    .toUpperCase();
}
