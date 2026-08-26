/*
|--------------------------------------------------------------------------
| JOHNNY TEC OS — AUDIO ENGINE
|--------------------------------------------------------------------------
|
| Browser text-to-speech only.
|
| No API key.
| No backend request.
| No AI request.
|
| This file is intentionally independent from chat.js.
|
| Responsibilities:
|
|   • Create ▶ audio buttons
|   • Read AI responses aloud
|   • Stop currently playing speech
|   • Keep button state synchronized
|   • Clean AI/Markdown text before speaking
|   • Handle browser speech-synthesis errors
|
|--------------------------------------------------------------------------
*/


/*
|--------------------------------------------------------------------------
| AUDIO STATE
|--------------------------------------------------------------------------
*/

let currentButton = null;

let currentSpeech = null;


/*
|--------------------------------------------------------------------------
| AUDIO SUPPORT
|--------------------------------------------------------------------------
*/

function isAudioSupported() {

  return (
    typeof window !== "undefined" &&
    "speechSynthesis" in window &&
    typeof SpeechSynthesisUtterance !==
      "undefined"
  );

}


/*
|--------------------------------------------------------------------------
| CLEAN TEXT
|--------------------------------------------------------------------------
|
| AI responses can contain Markdown and code.
|
| We don't want the browser reading:
|
|   backticks
|   Markdown symbols
|   code blocks
|   excessive spacing
|
| The visible AI message remains untouched.
|
|--------------------------------------------------------------------------
*/

function cleanText(
  text
) {

  return String(
    text || ""
  )

    /*
    |--------------------------------------------------------------------------
    | Remove fenced code blocks
    |--------------------------------------------------------------------------
    */

    .replace(
      /```[\s\S]*?```/g,
      " code omitted "
    )

    /*
    |--------------------------------------------------------------------------
    | Remove inline code markers
    |--------------------------------------------------------------------------
    */

    .replace(
      /`([^`]+)`/g,
      "$1"
    )

    /*
    |--------------------------------------------------------------------------
    | Remove Markdown headings
    |--------------------------------------------------------------------------
    */

    .replace(
      /^#{1,6}\s+/gm,
      ""
    )

    /*
    |--------------------------------------------------------------------------
    | Remove bold
    |--------------------------------------------------------------------------
    */

    .replace(
      /\*\*(.*?)\*\*/g,
      "$1"
    )

    /*
    |--------------------------------------------------------------------------
    | Remove italic
    |--------------------------------------------------------------------------
    */

    .replace(
      /\*(.*?)\*/g,
      "$1"
    )

    /*
    |--------------------------------------------------------------------------
    | Remove bullet markers
    |--------------------------------------------------------------------------
    */

    .replace(
      /^\s*[-*+]\s+/gm,
      ""
    )

    /*
    |--------------------------------------------------------------------------
    | Remove numbered-list markers
    |--------------------------------------------------------------------------
    */

    .replace(
      /^\s*\d+\.\s+/gm,
      ""
    )

    /*
    |--------------------------------------------------------------------------
    | Remove Markdown links but keep
    | the readable link text.
    |--------------------------------------------------------------------------
    */

    .replace(
      /\[([^\]]+)\]\([^)]+\)/g,
      "$1"
    )

    /*
    |--------------------------------------------------------------------------
    | Remove HTML tags if any exist
    |--------------------------------------------------------------------------
    */

    .replace(
      /<[^>]*>/g,
      " "
    )

    /*
    |--------------------------------------------------------------------------
    | Normalize whitespace
    |--------------------------------------------------------------------------
    */

    .replace(
      /\s+/g,
      " "
    )

    .trim();

}


/*
|--------------------------------------------------------------------------
| STOP AUDIO
|--------------------------------------------------------------------------
|
| Public function.
|
| Can be called by other chat components.
|
|--------------------------------------------------------------------------
*/

export function stopAudio() {

  /*
  |--------------------------------------------------------------------------
  | Stop browser speech
  |--------------------------------------------------------------------------
  */

  if (
    isAudioSupported()
  ) {

    window.speechSynthesis.cancel();

  }


  /*
  |--------------------------------------------------------------------------
  | Reset active button
  |--------------------------------------------------------------------------
  */

  if (
    currentButton
  ) {

    resetButton(
      currentButton
    );

  }


  /*
  |--------------------------------------------------------------------------
  | Clear state
  |--------------------------------------------------------------------------
  */

  currentButton =
    null;

  currentSpeech =
    null;

}


/*
|--------------------------------------------------------------------------
| CREATE AUDIO BUTTON
|--------------------------------------------------------------------------
|
| Creates the ▶ button used by messages.js.
|
| Example:
|
|   const button =
|     createAudioButton(
|       aiResponse
|     );
|
|--------------------------------------------------------------------------
*/

export function createAudioButton(
  text
) {

  /*
  |--------------------------------------------------------------------------
  | Create button
  |--------------------------------------------------------------------------
  */

  const button =
    document.createElement(
      "button"
    );


  /*
  |--------------------------------------------------------------------------
  | Basic button properties
  |--------------------------------------------------------------------------
  */

  button.type =
    "button";


  button.className =
    "message-audio-button";


  button.title =
    "Listen to response";


  button.setAttribute(
    "aria-label",
    "Listen to response"
  );


  button.textContent =
    "▶";


  /*
  |--------------------------------------------------------------------------
  | Click handler
  |--------------------------------------------------------------------------
  */

  button.addEventListener(
    "click",
    event => {

      /*
      |--------------------------------------------------------------------------
      | Prevent message click propagation
      |--------------------------------------------------------------------------
      */

      event.preventDefault();

      event.stopPropagation();


      /*
      |--------------------------------------------------------------------------
      | Browser support check
      |--------------------------------------------------------------------------
      */

      if (
        !isAudioSupported()
      ) {

        setUnsupportedState(
          button
        );

        return;

      }


      /*
      |--------------------------------------------------------------------------
      | If this same button is already
      | speaking, stop it.
      |--------------------------------------------------------------------------
      */

      if (
        currentButton ===
          button &&
        window.speechSynthesis
          .speaking
      ) {

        stopAudio();

        return;

      }


      /*
      |--------------------------------------------------------------------------
      | Stop any other message currently
      | being spoken.
      |--------------------------------------------------------------------------
      */

      stopAudio();


      /*
      |--------------------------------------------------------------------------
      | Clean response
      |--------------------------------------------------------------------------
      */

      const spoken =
        cleanText(
          text
        );


      /*
      |--------------------------------------------------------------------------
      | Nothing to read
      |--------------------------------------------------------------------------
      */

      if (
        !spoken
      ) {

        return;

      }


      /*
      |--------------------------------------------------------------------------
      | Create speech
      |--------------------------------------------------------------------------
      */

      const speech =
        new SpeechSynthesisUtterance(
          spoken
        );


      /*
      |--------------------------------------------------------------------------
      | Speech settings
      |--------------------------------------------------------------------------
      */

      speech.rate =
        1;


      speech.pitch =
        1;


      speech.volume =
        1;


      /*
      |--------------------------------------------------------------------------
      | Store active state
      |--------------------------------------------------------------------------
      */

      currentButton =
        button;


      currentSpeech =
        speech;


      /*
      |--------------------------------------------------------------------------
      | Update button
      |--------------------------------------------------------------------------
      */

      setPlayingState(
        button
      );


      /*
      |--------------------------------------------------------------------------
      | Speech started
      |--------------------------------------------------------------------------
      */

      speech.onstart =
        () => {

          if (
            currentButton ===
            button
          ) {

            setPlayingState(
              button
            );

          }

        };


      /*
      |--------------------------------------------------------------------------
      | Speech finished
      |--------------------------------------------------------------------------
      */

      speech.onend =
        () => {

          if (
            currentButton ===
            button
          ) {

            resetButton(
              button
            );

            currentButton =
              null;

            currentSpeech =
              null;

          }

        };


      /*
      |--------------------------------------------------------------------------
      | Speech cancelled
      |--------------------------------------------------------------------------
      */

      speech.onpause =
        () => {

          /*
           * We intentionally don't
           * reset the button here.
           *
           * Browser speech synthesis
           * can pause temporarily.
           */

        };


      /*
      |--------------------------------------------------------------------------
      | Speech resumed
      |--------------------------------------------------------------------------
      */

      speech.onresume =
        () => {

          if (
            currentButton ===
            button
          ) {

            setPlayingState(
              button
            );

          }

        };


      /*
      |--------------------------------------------------------------------------
      | Speech error
      |--------------------------------------------------------------------------
      */

      speech.onerror =
        error => {

          console.warn(
            "Speech synthesis error:",
            error
          );


          if (
            currentButton ===
            button
          ) {

            resetButton(
              button
            );

            currentButton =
              null;

            currentSpeech =
              null;

          }

        };


      /*
      |--------------------------------------------------------------------------
      | Start speech
      |--------------------------------------------------------------------------
      */

      try {

        window.speechSynthesis.speak(
          speech
        );

      }

      catch (error) {

        console.error(
          "Unable to start speech:",
          error
        );


        resetButton(
          button
        );


        currentButton =
          null;


        currentSpeech =
          null;

      }

    }
  );


  /*
  |--------------------------------------------------------------------------
  | Return button
  |--------------------------------------------------------------------------
  */

  return button;

}


/*
|--------------------------------------------------------------------------
| PLAYING STATE
|--------------------------------------------------------------------------
*/

function setPlayingState(
  button
) {

  if (
    !button
  ) {

    return;

  }


  button.textContent =
    "■";


  button.classList.add(
    "audio-playing"
  );


  button.title =
    "Stop listening";


  button.setAttribute(
    "aria-label",
    "Stop listening"
  );

}


/*
|--------------------------------------------------------------------------
| RESET BUTTON
|--------------------------------------------------------------------------
*/

function resetButton(
  button
) {

  if (
    !button
  ) {

    return;

  }


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


/*
|--------------------------------------------------------------------------
| UNSUPPORTED BROWSER STATE
|--------------------------------------------------------------------------
|
| Some browsers/devices may not expose speechSynthesis.
|
| We don't break the chat.
|
|--------------------------------------------------------------------------
*/

function setUnsupportedState(
  button
) {

  if (
    !button
  ) {

    return;

  }


  const original =
    button.textContent;


  button.textContent =
    "×";


  button.title =
    "Audio is not supported by this browser";


  button.setAttribute(
    "aria-label",
    "Audio is not supported by this browser"
  );


  setTimeout(
    () => {

      button.textContent =
        original;


      button.title =
        "Listen to response";


      button.setAttribute(
        "aria-label",
        "Listen to response"
      );

    },
    1800
  );

}


/*
|--------------------------------------------------------------------------
| OPTIONAL STATUS HELPERS
|--------------------------------------------------------------------------
|
| These are exported so future UI features can use
| the audio engine without modifying this file.
|
|--------------------------------------------------------------------------
*/

export function isAudioPlaying() {

  return (
    isAudioSupported() &&
    window.speechSynthesis.speaking
  );

}


export function getCurrentAudioButton() {

  return currentButton;

}


/*
|--------------------------------------------------------------------------
| DEFAULT EXPORT
|--------------------------------------------------------------------------
|
| Not required by the current application,
| but keeping the public API small makes this
| module easier to extend later.
|
|--------------------------------------------------------------------------
*/

export default {
  createAudioButton,
  stopAudio,
  isAudioPlaying,
  getCurrentAudioButton
};
