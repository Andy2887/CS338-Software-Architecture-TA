const chatEl = document.getElementById("chat");
const inputEl = document.getElementById("input");
const sendBtn = document.getElementById("send");

const messages = [];

function addMessage(role, content) {
  messages.push({ role, content });

  const wrapper = document.createElement("div");
  wrapper.className = `message ${role}`;

  const roleEl = document.createElement("div");
  roleEl.className = "role";
  roleEl.textContent = role === "user" ? "Student" : "TA";

  const textEl = document.createElement("div");
  textEl.textContent = content;

  wrapper.appendChild(roleEl);
  wrapper.appendChild(textEl);
  chatEl.appendChild(wrapper);
  chatEl.scrollTop = chatEl.scrollHeight;
}

async function sendMessage() {
  const text = inputEl.value.trim();
  if (!text) return;

  inputEl.value = "";
  sendBtn.disabled = true;
  addMessage("user", text);

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages }),
    });

    const payload = await response.json();
    if (!response.ok) {
      throw new Error(payload.error || "Failed to reach assistant");
    }

    addMessage("assistant", payload.reply);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    addMessage("assistant", `I hit a server issue: ${message}`);
  } finally {
    sendBtn.disabled = false;
    inputEl.focus();
  }
}

sendBtn.addEventListener("click", sendMessage);
inputEl.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    sendMessage();
  }
});

addMessage(
  "assistant",
  "What are you trying to build, and what constraints matter most (users, scale, deadline, or deployment limits)?",
);
