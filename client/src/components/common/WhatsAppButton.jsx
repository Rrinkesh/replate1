
import React from "react";
import { MessageCircle } from "lucide-react";

const WhatsAppButton = ({ phoneNumber = "911234567890", message = "Hello, I need help with RePlate." }) => {
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 bg-green-500 text-white rounded-full shadow-lg hover:bg-green-600 hover:scale-110 transition-all duration-300 animate-bounce group"
      aria-label="Chat with Admin on WhatsApp"
    >
      <MessageCircle className="w-8 h-8" />
      
      {/* Tooltip */}
      <span className="absolute right-16 px-3 py-2 bg-charcoal-900 text-white text-xs font-semibold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-md">
        Chat with Admin
      </span>
    </a>
  );
};

export default WhatsAppButton;

