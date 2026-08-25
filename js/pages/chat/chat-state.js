/*
|--------------------------------------------------------------------------
| CHAT STATE
|--------------------------------------------------------------------------
|
| Small shared state object for the frontend chat.
| This is NOT the AI memory system.
|--------------------------------------------------------------------------
*/

export function createChatState() {
  const state = {
    conversationId: null,
    conversationTitle: "New Chat",
    isSending: false,
    isPlaying: false,
    isListening: false,
    selectedMessageId: null,
    destroyed: false,

    setConversation(id, title) {
      this.conversationId = id || null;
      this.conversationTitle =
        title || "New Chat";
    },

    destroy() {
      this.destroyed = true;
      this.conversationId = null;
      this.conversationTitle = "New Chat";
      this.isSending = false;
      this.isPlaying = false;
      this.isListening = false;
      this.selectedMessageId = null;
    }
  };

  return state;
}
