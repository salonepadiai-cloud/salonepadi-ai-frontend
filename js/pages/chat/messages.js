import {
  createAudioButton
} from "./audio.js";

/*
|--------------------------------------------------------------------------
| MESSAGE RENDERER
|--------------------------------------------------------------------------
*/

export function addMessage(
  messagesContainer,
  role,
  content,
  displayName = "User"
) {
  if (!messagesContainer) {
    return null;
  }

  const isUser =
    role === "user";

  const row =
    document.createElement(
      "div"
    );

  row.className =
    isUser
      ? "message-row message-row-user"
      : "message-row message-row-ai";

  const avatar =
    document.createElement(
      "div"
    );

  avatar.className =
    "message-avatar";

  avatar.textContent =
    isUser
      ? getInitials(
          displayName
        )
      : "🦁";

  const bubble =
    document.createElement(
      "div"
    );

  bubble.className =
    isUser
      ? "message-bubble user-message"
      : "message-bubble ai-message";

  if (isUser) {
    const text =
      document.createElement(
        "div"
      );

    text.className =
      "message-text";

    text.textContent =
      String(content ?? "");

    bubble.appendChild(
      text
    );
  } else {
    bubble.innerHTML = `
      <div class="message-name">
        SalonePadi AI
      </div>

      <div class="message-text"></div>

      <div class="message-actions"></div>
    `;

    const text =
      bubble.querySelector(
        ".message-text"
      );

    if (
      text &&
      typeof window.formatAIText ===
        "function"
    ) {
      text.innerHTML =
        window.formatAIText(
          content
        );
    } else if (text) {
      text.textContent =
        String(
          content ?? ""
        );
    }

    const actions =
      bubble.querySelector(
        ".message-actions"
      );

    if (actions) {
      try {
        const audioButton =
          createAudioButton(
            content
          );

        if (audioButton) {
          actions.appendChild(
            audioButton
          );
        }
      } catch (error) {
        console.warn(
          "Audio button error:",
          error
        );
      }
    }
  }

  row.append(
    avatar,
    bubble
  );

  messagesContainer.appendChild(
    row
  );

  return row;
}

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

  if (parts.length >= 2) {
    return (
      parts[0][0] +
      parts[
        parts.length - 1
      ][0]
    ).toUpperCase();
  }

  return text
    .slice(0, 2)
    .toUpperCase();
}
