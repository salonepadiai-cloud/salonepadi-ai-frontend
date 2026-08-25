/*
|--------------------------------------------------------------------------
| SIDEBAR FEATURE
|--------------------------------------------------------------------------
|
| Owns sidebar-only interaction that should not be duplicated in the
| master controller.
|
| Conversation data/deletion is still performed by conversations.js through
| the backend. This module only provides safe UI-level behavior.
|--------------------------------------------------------------------------
*/

export function init(context) {
  const {
    elements,
    actions
  } = context || {};

  const conversationList =
    elements?.conversationList;

  const deleteConversation =
    actions?.deleteConversation;

  if (
    !conversationList ||
    typeof deleteConversation !== "function"
  ) {
    return;
  }

  /*
   * The master controller also binds delete buttons directly for immediate
   * compatibility. This delegated guard is intentionally lightweight and
   * only prevents a delete click from being interpreted as chat selection.
   */
  const stopDeletePropagation =
    event => {
      const deleteButton =
        event.target.closest(
          ".conversation-delete-button"
        );

      if (!deleteButton) {
        return;
      }

      event.stopPropagation();
    };

  conversationList.addEventListener(
    "click",
    stopDeletePropagation
  );

  return () => {
    conversationList.removeEventListener(
      "click",
      stopDeletePropagation
    );
  };
}
