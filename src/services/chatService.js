import { api } from "./api";

export function getConversations() {
  return api.get("/api/chat/conversations");
}

export function createConversation(title = "New Chat") {
  return api.post("/api/chat/conversations", {
    title
  });
}

export function getMessages(conversationId) {
  return api.get(
    `/api/chat/conversations/${conversationId}/messages`
  );
}

export function sendMessage(conversationId, message) {
  return api.post(
    `/api/chat/conversations/${conversationId}/messages`,
    {
      message
    }
  );
}
