/*
|--------------------------------------------------------------------------
| SALONEPADI AI — AUDIO CONTROLLER
|--------------------------------------------------------------------------
|
| Handles text-to-speech for AI messages.
|
| No backend changes required.
| Uses the browser's built-in SpeechSynthesis API.
|
|--------------------------------------------------------------------------
*/

let currentUtterance = null;
let currentButton = null;


/*
|--------------------------------------------------------------------------
| BROWSER SUPPORT
|--------------------------------------------------------------------------
*/

export function audioSupported() {
  return (
    "speechSynthesis" in window &&
    "SpeechSynthesisUtterance" in window
  );
}


/*
|--------------------------------------------------------------------------
| CLEAN TEXT
|--------------------------------------------------------------------------
|
| Removes markdown/code formatting that should not be spoken.
|
*/

function cleanSpeechText(text) {
  if (!text) {
    return "";
  }

  return String(text)

    // Remove fenced code blocks
    .replace(/```[\s\S]*?```/g, " code omitted ")

    // Remove inline code
    .replace(/`([^`]+)`/g, "$1")

    // Remove markdown links but keep their text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")

    // Remove heading markers
    .replace(/^#{1,6}\s+/gm, "")

    // Remove bold / italic markers
    .replace(/\*\*\*(.*?)\*\*\*/g, "$1")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/__(.*?)__/g, "$1")
    .replace(/_(.*?)_/g, "$1")

    // Remove excessive bullet characters
    .replace(/^\s*[-*+]\s+/gm, "")

    // Remove numbered-list formatting
    .replace(/^\s*\d+\.\s+/gm, "")

    // Normalize whitespace
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")

    .trim();
}


/*
|--------------------------------------------------------------------------
| STOP CURRENT AUDIO
|--------------------------------------------------------------------------
*/

export function stopAudio() {
  if (!audioSupported()) {
    return;
  }

  window.speechSynthesis.cancel();

  if (currentButton) {
    resetButton(currentButton);
  }

  currentUtterance = null;
  currentButton = null;
}


/*
|--------------------------------------------------------------------------
| PLAY MESSAGE
|--------------------------------------------------------------------------
*/

export function playMessage(text, button = null) {
  if (!audioSupported()) {
    console.warn(
      "Speech synthesis is not supported by this browser."
    );

    return false;
  }

  const speechText = cleanSpeechText(text);

  if (!speechText) {
    return false;
  }


  /*
  |--------------------------------------------------------------------------
  | If the same button is already playing,
  | stop it.
  |--------------------------------------------------------------------------
  */

  if (
    currentButton === button &&
    window.speechSynthesis.speaking
  ) {
    stopAudio();
    return true;
  }


  /*
  |--------------------------------------------------------------------------
  | Stop previous message
  |--------------------------------------------------------------------------
  */

  stopAudio();


  const utterance =
    new SpeechSynthesisUtterance(
      speechText
    );


  /*
  |--------------------------------------------------------------------------
  | Voice settings
  |--------------------------------------------------------------------------
  */

  utterance.rate = 1;
  utterance.pitch = 1;
  utterance.volume = 1;


  /*
  |--------------------------------------------------------------------------
  | Try to use an English voice
  |--------------------------------------------------------------------------
  */

  const voices =
    window.speechSynthesis.getVoices();


  const preferredVoice =
    voices.find(
      voice =>
        /^en/i.test(voice.lang) &&
        /Google|Microsoft|Samantha|Daniel/i.test(
          voice.name
        )
    ) ||
    voices.find(
      voice =>
        /^en/i.test(voice.lang)
    );


  if (preferredVoice) {
    utterance.voice =
      preferredVoice;
  }


  /*
  |--------------------------------------------------------------------------
  | START
  |--------------------------------------------------------------------------
  */

  utterance.onstart = () => {

    currentUtterance =
      utterance;

    currentButton =
      button;

    if (button) {
      setPlayingButton(button);
    }

  };


  /*
  |--------------------------------------------------------------------------
  | END
  |--------------------------------------------------------------------------
  */

  utterance.onend = () => {

    if (button) {
      resetButton(button);
    }

    if (
      currentUtterance ===
      utterance
    ) {

      currentUtterance =
        null;

      currentButton =
        null;

    }

  };


  /*
  |--------------------------------------------------------------------------
  | ERROR
  |--------------------------------------------------------------------------
  */

  utterance.onerror = error => {

    console.warn(
      "Speech synthesis error:",
      error
    );


    if (button) {
      resetButton(button);
    }


    if (
      currentUtterance ===
      utterance
    ) {

      currentUtterance =
        null;

      currentButton =
        null;

    }

  };


  /*
  |--------------------------------------------------------------------------
  | SPEAK
  |--------------------------------------------------------------------------
  */

  window.speechSynthesis.speak(
    utterance
  );


  return true;
}


/*
|--------------------------------------------------------------------------
| BUTTON STATE — PLAYING
|--------------------------------------------------------------------------
*/

function setPlayingButton(button) {

  button.classList.add(
    "audio-playing"
  );

  button.setAttribute(
    "aria-label",
    "Stop listening"
  );

  button.title =
    "Stop listening";

  button.innerHTML =
    `
      <span class="audio-stop-icon">
        ■
      </span>
    `;

}


/*
|--------------------------------------------------------------------------
| BUTTON STATE — STOPPED
|--------------------------------------------------------------------------
*/

function resetButton(button) {

  button.classList.remove(
    "audio-playing"
  );

  button.setAttribute(
    "aria-label",
    "Listen to response"
  );

  button.title =
    "Listen to response";

  button.innerHTML =
    `
      <span class="audio-play-icon">
        ▶
      </span>
    `;

}


/*
|--------------------------------------------------------------------------
| CREATE AUDIO BUTTON
|--------------------------------------------------------------------------
*/

export function createAudioButton(text) {

  const button =
    document.createElement(
      "button"
    );


  button.type =
    "button";


  button.className =
    "message-audio-button";


  button.setAttribute(
    "aria-label",
    "Listen to response"
  );


  button.title =
    "Listen to response";


  button.innerHTML =
    `
      <span class="audio-play-icon">
        ▶
      </span>
    `;


  button.addEventListener(
    "click",
    event => {

      event.preventDefault();
      event.stopPropagation();

      playMessage(
        text,
        button
      );

    }
  );


  return button;
}


/*
|--------------------------------------------------------------------------
| CLEANUP
|--------------------------------------------------------------------------
*/

export function destroyAudio() {
  stopAudio();
}
