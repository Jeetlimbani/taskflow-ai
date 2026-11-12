import { useState } from "react";
import { FiSend } from "react-icons/fi";

function ChatInput({ onSend, disabled }) {
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim() || disabled) return;

    onSend(input.trim());
    setInput("");
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex items-center gap-3 border border-gray-700 rounded-xl p-3 bg-gray-800">

      <input
        type="text"
        value={input}
        onChange={(event) => setInput(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={
          disabled
            ? "TaskFlow AI is responding..."
            : "Ask TaskFlow AI anything..."
        }
        disabled={disabled}
        className="flex-1 bg-transparent outline-none text-white placeholder-gray-400 disabled:opacity-50"
      />

      <button
        onClick={handleSend}
        disabled={disabled || !input.trim()}
        className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white p-3 rounded-lg"
      >
        <FiSend size={18} />
      </button>

    </div>
  );
}

export default ChatInput;