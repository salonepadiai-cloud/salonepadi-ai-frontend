let currentButton = null;

function cleanText(text) {
  return String(text || "")
    .replace(/```[\s\S]*?```/g, " code omitted ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/^\s*[-*+]\s+/gm, "")
    .replace(/^\s*\d+\.\s+/gm, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function stopAudio() {
  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }

  if (currentButton) {
    resetButton(currentButton);
  }

  currentButton = null;
}

export function createAudioButton(text) {
  const button = document.createElement("button");

  button.type = "button";
  button.className = "message-audio-button";
  button.title = "Listen to response";
  button.setAttribute(
    "aria-label",
    "Listen to response"
  );

  button.innerHTML = "▶";

  button.addEventListener("click", event => {
    event.preventDefault();
    event.stopPropagation();

    if (!("speechSynthesis" in window)) {
      console.warn(
        "Speech synthesis is not supported."
      );
      return;
    }

    if (
      currentButton === button &&
      window.speechSynthesis.speaking
    ) {
      stopAudio();
      return;
    }

    stopAudio();

    const speech =
      new SpeechSynthesisUtterance(
        cleanText(text)
      );

    speech.rate = 1;
    speech.pitch = 1;
    speech.volume = 1;

    currentButton = button;

    button.innerHTML = "■";
    button.classList.add(
      "audio-playing"
    );

    speech.onend = () => {
      resetButton(button);
      currentButton = null;
    };

    speech.onerror = () => {
      resetButton(button);
      currentButton = null;
    };

    window.speechSynthesis.speak(
      speech
    );
  });

  return button;
}

function resetButton(button) {
  button.innerHTML = "▶";
  button.classList.remove(
    "audio-playing"
  );
  button.title = "Listen to response";
  button.setAttribute(
    "aria-label",
    "Listen to response"
  );
}
