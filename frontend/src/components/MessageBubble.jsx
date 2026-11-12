
function MessageBubble({ role, content }) {
  const isUser = role === "user";

  return (
    <div
      className={`flex mb-4 sm:mb-5 ${
        isUser ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`max-w-[90%] sm:max-w-[80%] md:max-w-[75%] min-w-0 rounded-2xl px-3 py-3 sm:p-4 wrap-break-word whitespace-pre-wrap ${
          isUser
            ? "bg-blue-600 text-white"
            : "bg-gray-800 text-gray-100"
        }`}
      >
        {content}
      </div>
    </div>
  );
}

export default MessageBubble;