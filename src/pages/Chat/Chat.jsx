import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useChat } from "../../hooks/useChat";
import { useAuth } from "../../hooks/useAuth";
import "./Chat.css";

export default function Chat() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const {
    conversations,
    messages,
    activeConversation,
    loading,
    sending,
    error,
    loadConversations,
    openConversation,
    newConversation,
    send
  } = useChat();

  const [message, setMessage] = useState("");

  useEffect(() => {
    loadConversations();
  }, []);

  async function handleNewChat() {
    try {
      await newConversation("New Chat");
    } catch (err) {
      console.error(err);
    }
  }

  async function handleSend(event) {
    event.preventDefault();

    const text = message.trim();

    if (!text || sending) {
      return;
    }

    try {
      if (!activeConversation) {
        await newConversation("New Chat");
      }

      await send(text);
      setMessage("");
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <main className="chat-page">
      <aside className="chat-sidebar">
        <div className="chat-sidebar-header">
          <button
            type="button"
            className="back-button"
            onClick={() => navigate("/dashboard")}
          >
            ← Dashboard
          </button>

          <button
            type="button"
            className="new-chat-button"
            onClick={handleNewChat}
          >
            + New Chat
          </button>
        </div>

        <div className="conversation-list">
          {loading && conversations.length === 0 ? (
            <p className="chat-muted">
              Loading chats...
            </p>
          ) : conversations.length === 0 ? (
            <p className="chat-muted">
              No conversations yet.
            </p>
          ) : (
            conversations.map((conversation) => (
              <button
                key={conversation.id}
                type="button"
                className={
                  activeConversation === conversation.id
                    ? "conversation active"
                    : "conversation"
                }
                onClick={() =>
                  openConversation(conversation.id)
                }
              >
                {conversation.title || "New Chat"}
              </button>
            ))
          )}
        </div>
      </aside>

      <section className="chat-main">
        <header className="chat-header">
          <div>
            <h1>SalonePadi AI</h1>

            <p>
              {user?.email || "Your personal AI Padi"}
            </p>
          </div>
        </header>

        <div className="messages">
          {!activeConversation && messages.length === 0 ? (
            <div className="chat-empty">
              <div className="chat-empty-logo">
                🦁
              </div>

              <h2>Kushe, Padi!</h2>

              <p>
                Start a conversation with
                SalonePadi AI.
              </p>
            </div>
          ) : (
            messages.map((item, index) => {
              const role =
                item.role ||
                item.sender ||
                "assistant";

              const content =
                item.content ||
                item.message ||
                "";

              const isUser =
                role === "user";

              return (
                <div
                  key={item.id || index}
                  className={
                    isUser
                      ? "message user-message"
                      : "message assistant-message"
                  }
                >
                  <div className="message-role">
                    {isUser ? "You" : "SalonePadi AI"}
                  </div>

                  <div className="message-content">
                    {content}
                  </div>
                </div>
              );
            })
          )}

          {sending && (
            <div className="message assistant-message">
              <div className="message-role">
                SalonePadi AI
              </div>

              <div className="message-content">
                Thinking...
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="chat-error">
            {error}
          </div>
        )}

        <form
          className="chat-input-area"
          onSubmit={handleSend}
        >
          <input
            type="text"
            value={message}
            onChange={(event) =>
              setMessage(event.target.value)
            }
            placeholder="Message SalonePadi AI..."
            disabled={sending}
          />

          <button
            type="submit"
            disabled={
              sending || !message.trim()
            }
          >
            {sending ? "..." : "Send"}
          </button>
        </form>
      </section>
    </main>
  );
}
