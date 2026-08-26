/* =========================================
   SalonePadi AI
   Chat Feature Loader

   RESPONSIBILITY:
   This file ONLY loads optional Chat J
   features.

   It does NOT:
   - Render messages
   - Manage conversations
   - Handle composer/input
   - Manage authentication
   - Manage chat state
   - Implement audio
   - Implement profile
   - Implement settings
   - Implement sidebar logic

   Optional feature modules are loaded here
   so the Chat Master Controller does not
   need to know their internal details.
   ========================================= */


/* =========================================
   LOAD CHAT FEATURES
   ========================================= */

export async function loadChatFeatures(
  context = {}
) {

  const cleanups = [];


  /* -----------------------------------------
     SAFETY
     ----------------------------------------- */

  if (!context) {
    context = {};
  }


  /* -----------------------------------------
     FEATURE REGISTRY
     -----------------------------------------

     Add optional Chat J modules here.

     Each module should expose:

       init(context)

     and may return:

       cleanup()

     ----------------------------------------- */

  const features = [];


  /* =========================================
     LOAD FEATURES
     ========================================= */

  for (const loadFeature of features) {

    try {

      const module =
        await loadFeature();


      if (
        !module ||
        typeof module.init !==
          "function"
      ) {
        continue;
      }


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

      /*
       * Optional features must never
       * break the main Chat J.
       */

      console.warn(
        "Optional chat feature failed:",
        error
      );

    }

  }


  /* =========================================
     RETURN FEATURE CLEANUP
     ========================================= */

  return () => {

    /*
     * Clean up in reverse order.
     *
     * This is safer when one feature depends
     * on another feature being removed first.
     */

    for (
      let index =
        cleanups.length - 1;
      index >= 0;
      index -= 1
    ) {

      const cleanup =
        cleanups[index];


      if (
        typeof cleanup !==
        "function"
      ) {
        continue;
      }


      try {

        cleanup();

      } catch (error) {

        console.warn(
          "Chat feature cleanup failed:",
          error
        );

      }

    }


    cleanups.length = 0;

  };

}


/* =========================================
   BACKWARD-COMPATIBILITY ALIAS
   =========================================

   Some older code may still use:

       init(context)

   Keep this temporarily while we finish
   separating Chat J's.
   ========================================= */

export async function init(
  context = {}
) {

  return loadChatFeatures(
    context
  );

}
