
const form = document.getElementById("chat-form");
const input = document.getElementById("message-input");
const messages = document.getElementById("messages");
const sendButton = document.getElementById("send-button");

// Identidade fictícia usada apenas no simulador local.
const customerId = "CUS-001";

// Renderiza negrito e itálico sem executar HTML da IA.
function addMessage(text, sender) {
  const bubble = document.createElement("div");
  bubble.classList.add("message", sender);

  if (sender === "user") {
    bubble.textContent = text;
  } else {
    const pattern = /(\*\*([^*\n]+)\*\*|\*([^*\n]+)\*)/g;
    let lastIndex = 0;

    for (const match of text.matchAll(pattern)) {
      const index = match.index;

      bubble.appendChild(
        document.createTextNode(text.slice(lastIndex, index))
      );

      const element = document.createElement(
        match[2] !== undefined ? "strong" : "em"
      );

      element.textContent = match[2] ?? match[3];
      bubble.appendChild(element);

      lastIndex = index + match[0].length;
    }

    bubble.appendChild(
      document.createTextNode(text.slice(lastIndex))
    );
  }

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
