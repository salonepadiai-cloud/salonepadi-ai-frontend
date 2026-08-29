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
};
