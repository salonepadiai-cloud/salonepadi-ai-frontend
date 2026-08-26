import {
  createAudioButton
} from "./audio.js";

import {
  CONFIG
} from "../../config.js";


/*
|--------------------------------------------------------------------------
| MESSAGE RENDERER
|--------------------------------------------------------------------------
|
| Responsible ONLY for rendering chat messages.
|
| Audio functionality remains inside:
|
|     chat/audio.js
|
| Branding comes from:
|
|     config.js
|
| This keeps chat.js from becoming unnecessarily large.
|
|--------------------------------------------------------------------------
*/


export function addMessage(
  messagesContainer,
  role,
  content,
  displayName = "User"
) {

  /*
  |--------------------------------------------------------------------------
  | SAFETY CHECK
  |--------------------------------------------------------------------------
  */

  if (!messagesContainer) {
    return null;
  }


  /*
  |--------------------------------------------------------------------------
  | MESSAGE TYPE
  |--------------------------------------------------------------------------
  */

  const isUser =
    role === "user";


  /*
  |--------------------------------------------------------------------------
  | MESSAGE ROW
  |--------------------------------------------------------------------------
  */

  const row =
    document.createElement(
      "div"
    );


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
    document.createElement(
      "div"
    );


  avatar.className =
    "message-avatar";


  /*
  |--------------------------------------------------------------------------
  | USER AVATAR
  |--------------------------------------------------------------------------
  |
  | User messages use the user's initials.
  |
  | AI messages use the configured application logo
  | when available.
  |
  |--------------------------------------------------------------------------
  */

  if (isUser) {

    avatar.textContent =
      getInitials(
        displayName
      );

  } else {

    /*
     * Prefer the configured logo.
     */

    if (CONFIG.logo) {

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
       * If the image fails, fall back
       * to a simple text mark.
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

    } else {

      avatar.textContent =
        "AI";

    }

  }


  /*
  |--------------------------------------------------------------------------
  | MESSAGE BUBBLE
  |--------------------------------------------------------------------------
  */

  const bubble =
    document.createElement(
      "div"
    );


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

    const text =
      document.createElement(
        "div"
      );


    text.className =
      "message-text";


    /*
     * textContent is intentionally used here.
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


  /*
  |--------------------------------------------------------------------------
  | AI MESSAGE
  |--------------------------------------------------------------------------
  */

  else {

    bubble.innerHTML = `
      <div class="message-name">
        ${escapeHTML(
          CONFIG.appName ||
          "AI"
        )}
      </div>

      <div class="message-text"></div>

      <div class="message-actions"></div>
    `;


    /*
    |--------------------------------------------------------------------------
    | AI MESSAGE TEXT
    |--------------------------------------------------------------------------
    */

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

    }

    else if (text) {

      text.textContent =
        String(
          content ?? ""
        );

    }


    /*
    |--------------------------------------------------------------------------
    | MESSAGE ACTIONS
    |--------------------------------------------------------------------------
    |
    | Buttons such as:
    |
    |   ▶ Listen
    |
    | stay inside this dedicated action
    | container.
    |
    |--------------------------------------------------------------------------
    */

    const actions =
      bubble.querySelector(
        ".message-actions"
      );


    if (actions) {

      try {

        /*
        |--------------------------------------------------------------------------
        | AUDIO BUTTON
        |--------------------------------------------------------------------------
        |
        | The actual speech functionality lives
        | inside chat/audio.js.
        |
        */

        const audioButton =
          createAudioButton(
            content
          );


        if (audioButton) {

          actions.appendChild(
            audioButton
          );

        }

      }

      catch (error) {

        console.warn(
          "Audio button error:",
          error
        );

      }

    }

  }


  /*
  |--------------------------------------------------------------------------
  | APPEND MESSAGE
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
  | RETURN CREATED ROW
  |--------------------------------------------------------------------------
  */

  return row;

}


/*
|--------------------------------------------------------------------------
| USER INITIALS
|--------------------------------------------------------------------------
|
| Examples:
|
|   "John Fatorma" → "JF"
|   "John"         → "JO"
|   "Aisha Kamara" → "AK"
|
|--------------------------------------------------------------------------
*/

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


  return text
    .slice(0, 2)
    .toUpperCase();

}


/*
|--------------------------------------------------------------------------
| SAFE HTML ESCAPE
|--------------------------------------------------------------------------
|
| Used for application-controlled text such as
| CONFIG.appName.
|
| User messages themselves are rendered with
| textContent and therefore do not need HTML
| interpolation.
|
|--------------------------------------------------------------------------
*/

function escapeHTML(
  value
) {

  return String(
    value ?? ""
  )
    .replace(
      /&/g,
      "&amp;"
    )
    .replace(
      /</g,
      "&lt;"
    )
    .replace(
      />/g,
      "&gt;"
    )
    .replace(
      /"/g,
      "&quot;"
    )
    .replace(
      /'/g,
      "&#039;"
    );

      }
