/*
|--------------------------------------------------------------------------
| SALONEPADI AI — CHAT STATE
|--------------------------------------------------------------------------
*/

export function createChatState() {

  return {
    conversationId: null,
    conversationTitle: "New Chat",

    messages: [],

    sending: false,
    loading: false,
    error: null,

    audioPlaying: false,
    audioMessageId: null,

    reset() {
      this.conversationId = null;
      this.conversationTitle = "New Chat";
      this.messages = [];
      this.sending = false;
      this.loading = false;
      this.error = null;
      this.audioPlaying = false;
      this.audioMessageId = null;
    },

    setConversation(id, title = "New Chat") {
      this.conversationId = id || null;
      this.conversationTitle = title || "New Chat";
    },

    addMessage(role, content, id = null) {
      const message = {
        id:
          id ||
          `${Date.now()}-${Math.random()
            .toString(36)
            .slice(2)}`,

        role,

        content: String(content ?? ""),

        createdAt: new Date().toISOString()
      };

      this.messages.push(message);

      return message;
    },

    clearMessages() {
      this.messages = [];
    },

    setSending(value) {
      this.sending = Boolean(value);
    },

    setLoading(value) {
      this.loading = Boolean(value);
    },

    setError(error) {
      this.error = error
        ? String(error?.message || error)
        : null;
    },

    setAudioPlaying(messageId = null) {
      this.audioPlaying = Boolean(messageId);
      this.audioMessageId = messageId;
    }
  };
}

export default createChatState;
