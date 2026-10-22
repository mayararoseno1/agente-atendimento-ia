
const form = document.getElementById("chat-form");
const input = document.getElementById("message-input");
const messages = document.getElementById("messages");
const sendButton = document.getElementById("send-button");

// Identidade fictícia usada apenas no simulador local.
const customerId = "CUS-001";

function addMessage(text, sender) {
  const bubble = document.createElement("div");
  bubble.classList.add("message", sender);

  // textContent evita interpretar HTML enviado pelo usuário ou IA.
  bubble.textContent = text;

  messages.appendChild(bubble);
  messages.scrollTop = messages.scrollHeight;
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const message = input.value.trim();

  if (!message || sendButton.disabled) {
    return;
  }

  addMessage(message, "user");
  input.value = "";

  sendButton.disabled = true;
  input.disabled = true;

  try {
    const response = await fetch("/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        customerId,
        message,
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error("Falha no atendimento");
    }

    addMessage(data.reply, "bot");
  } catch (error) {
    console.error("Erro no chat:", error);

    addMessage(
      "Não consegui responder agora. Tente novamente ou solicite atendimento humano.",
      "bot"
    );
  } finally {
    sendButton.disabled = false;
    input.disabled = false;
    input.focus();
  }
});
