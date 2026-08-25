/*
|--------------------------------------------------------------------------
| SALONEPADI AI — AUDIO
|--------------------------------------------------------------------------
|
| Browser text-to-speech only.
| No API key and no backend request are required.
|--------------------------------------------------------------------------
*/

let currentButton = null;

function cleanText(text) {
  return String(text || "")
    .replace(
      /```[\s\S]*?```/g,
      " code omitted "
    )
    .replace(
      /`([^`]+)`/g,
      "$1"
    )
    .replace(
      /^#{1,6}\s+/gm,
      ""
    )
    .replace(
      /\*\*(.*?)\*\*/g,
      "$1"
    )
    .replace(
      /\*(.*?)\*/g,
      "$1"
    )
    .replace(
      /^\s*[-*+]\s+/gm,
      ""
    )
    .replace(
      /^\s*\d+\.\s+/gm,
      ""
    )
    .replace(
      /\s+/g,
      " "
    )
    .trim();
}

export function stopAudio() {
  if (
    "speechSynthesis" in
    window
  ) {
    window.speechSynthesis.cancel();
  }

  if (currentButton) {
    resetButton(
      currentButton
    );
  }

  currentButton = null;
}

export function createAudioButton(
  text
) {
  const button =
    document.createElement(
      "button"
    );

  button.type = "button";
  button.className =
    "message-audio-button";
  button.title =
    "Listen to response";
  button.setAttribute(
    "aria-label",
    "Listen to response"
  );
  button.textContent = "▶";

  button.addEventListener(
    "click",
    event => {
      event.preventDefault();
      event.stopPropagation();

      if (
        !(
          "speechSynthesis" in
          window
        )
      ) {
        return;
      }

      if (
        currentButton ===
          button &&
        window.speechSynthesis
          .speaking
      ) {
        stopAudio();
        return;
      }

      stopAudio();

      const spoken =
        cleanText(text);

      if (!spoken) {
        return;
      }

      const speech =
        new SpeechSynthesisUtterance(
          spoken
        );

      speech.rate = 1;
      speech.pitch = 1;
      speech.volume = 1;

      currentButton =
        button;

      button.textContent =
        "■";

      button.classList.add(
        "audio-playing"
      );

      speech.onend = () => {
        resetButton(
          button
        );

        currentButton =
          null;
      };

      speech.onerror = () => {
        resetButton(
          button
        );

        currentButton =
          null;
      };

      window.speechSynthesis.speak(
        speech
      );
    }
  );

  return button;
}

function resetButton(
  button
) {
  button.textContent =
    "▶";

  button.classList.remove(
    "audio-playing"
  );

  button.title =
    "Listen to response";

  button.setAttribute(
    "aria-label",
    "Listen to response"
  );
}
