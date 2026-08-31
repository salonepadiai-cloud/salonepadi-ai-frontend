// JOHNNY TEC OS — services/chat-service.js

const ChatService = {
  async createConversation(title) {
    const data = await apiRequest('/api/chat/conversations', {
      method: 'POST',
      auth: true,
      body: title ? { title } : {},
    });
    return data.conversation;
  },

  async sendMessage(conversationId, message) {
    return apiRequest(`/api/chat/conversations/${conversationId}/messages`, {
      method: 'POST',
      auth: true,
      body: { message },
    });
  },

  async listConversations() {
    const data = await apiRequest('/api/chat/conversations', { auth: true });
    return data.conversations || [];
  },

  async deleteConversation(conversationId) {
    return apiRequest(`/api/chat/conversations/${conversationId}`, {
      method: 'DELETE',
      auth: true,
    });
  },

  deriveTitle(text) {
    const clean = text.trim().replace(/\s+/g, ' ');
    return clean.length > 40 ? clean.slice(0, 40) + '\u2026' : clean;
  },
};
