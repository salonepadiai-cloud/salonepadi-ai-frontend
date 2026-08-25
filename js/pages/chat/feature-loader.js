/*
|--------------------------------------------------------------------------
| CHAT FEATURE LOADER
|--------------------------------------------------------------------------
|
| Feature contract:
|
| Every feature file can later export:
|
|   export function init(context) {
|     // feature code
|
|     return () => {
|       // cleanup
|     };
|   }
|
| The master chat controller does not need to be edited when a feature
| implementation is improved. A feature error is isolated and does not
| blank the entire chat UI.
|--------------------------------------------------------------------------
*/

const FEATURE_MODULES = [
  "./sidebar.js",
  "./composer.js",
  "./settings.js",
  "./profile.js",
  "./voice.js",
  "./attachments.js",
  "./message-actions.js",
  "./search.js",
  "./project-mode.js"
];

export async function loadChatFeatures(
  context
) {
  const cleanups = [];

  const results =
    await Promise.allSettled(
      FEATURE_MODULES.map(
        modulePath =>
          import(modulePath)
      )
    );

  for (
    let index = 0;
    index < results.length;
    index += 1
  ) {
    const result =
      results[index];

    const modulePath =
      FEATURE_MODULES[index];

    if (
      result.status !==
      "fulfilled"
    ) {
      console.warn(
        `Optional chat feature unavailable: ${modulePath}`,
        result.reason
      );

      continue;
    }

    const module =
      result.value;

    if (
      typeof module.init !==
      "function"
    ) {
      continue;
    }

    try {
      const cleanup =
        await module.init(
          context
        );

      if (
        typeof cleanup ===
        "function"
      ) {
        cleanups.push(
          cleanup
        );
      }
    } catch (error) {
      console.warn(
        `Chat feature failed safely: ${modulePath}`,
        error
      );
    }
  }

  return () => {
    for (
      const cleanup of cleanups
    ) {
      try {
        cleanup();
      } catch (error) {
        console.warn(
          "Chat feature cleanup error:",
          error
        );
      }
    }
  };
}
