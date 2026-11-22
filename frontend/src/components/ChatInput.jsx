
import { useState, useEffect } from "react";
import { FiSend, FiPaperclip, FiX } from "react-icons/fi";

function ChatInput({ onSend, disabled }) {
  const [input, setInput] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageError, setImageError] = useState("");

  // Clean up the preview URL when the image changes or component unmounts
  useEffect(() => {
    return () => {
      if (selectedImage?.preview) {
        URL.revokeObjectURL(selectedImage.preview);
      }
    };
  }, [selectedImage]);

  // Select an image
  const handleImageSelect = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setImageError("");

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      setImageError("Please select a JPG, JPEG, PNG, or WEBP image.");
      event.target.value = "";
      return;
    }

    // Maximum image size: 10 MB
    if (file.size > 10 * 1024 * 1024) {
      setImageError("Image size must be less than 10 MB.");
      event.target.value = "";
      return;
    }

    const preview = URL.createObjectURL(file);

    setSelectedImage({
      file,
      preview,
    });

    event.target.value = "";
  };

  // Remove selected image
  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImageError("");
  };

  const handleSend = () => {
    if ((!input.trim() && !selectedImage) || disabled) return;
  
    onSend(input.trim(), selectedImage?.file || null);
  
    setInput("");
    setSelectedImage(null);
    setImageError("");
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border border-gray-700 rounded-xl p-3 bg-gray-800">

      {/* Image Preview */}
      {selectedImage && (
        <div className="relative inline-block mb-3">
          <img
            src={selectedImage.preview}
            alt="Selected attachment"
            className="w-24 h-24 object-cover rounded-lg border border-gray-600"
          />

          <button
            type="button"
            onClick={handleRemoveImage}
            disabled={disabled}
            className="absolute -top-2 -right-2 bg-red-600 hover:bg-red-700 text-white p-1 rounded-full"
            aria-label="Remove image"
          >
            <FiX size={14} />
          </button>
        </div>
      )}

      {/* Image Validation Error */}
      {imageError && (
        <p className="text-sm text-red-400 mb-2">
          {imageError}
        </p>
      )}

      {/* Input Controls */}
      <div className="flex items-center gap-3">

        {/* Image Upload */}
        <label
          className={`p-3 rounded-lg text-gray-300 hover:bg-gray-700 cursor-pointer ${
            disabled ? "opacity-50 cursor-not-allowed" : ""
          }`}
          title="Attach an image"
        >
          <FiPaperclip size={20} />

          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleImageSelect}
            disabled={disabled}
            className="hidden"
          />
        </label>

        {/* Text Input */}
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
          className="flex-1 min-w-0 bg-transparent outline-none text-white placeholder-gray-400 disabled:opacity-50"
        />

        {/* Send Button */}
        <button
          onClick={handleSend}
          disabled={disabled || (!input.trim() && !selectedImage)}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white p-3 rounded-lg"
          aria-label="Send message"
        >
          <FiSend size={18} />
        </button>

      </div>
    </div>
  );
}

export default ChatInput;
