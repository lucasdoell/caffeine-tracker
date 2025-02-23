// frontend/src/components/chatbot/chat-bot.tsx
"use client";

import React from "react";
// UI imports
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { BotMessageSquare } from "lucide-react";
import { Input } from "@/components/ui/input";
// Markdown support
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export function ChatBot() {
  const [open, setOpen] = React.useState(false);
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false); // Tracks API response status

  async function handleSend() {
    if (!userInput.trim() || isLoading) return; // Prevent multiple requests

    // Add user message
    setMessages((prev) => [...prev, { role: "user", content: userInput }]);
    setIsLoading(true); // Set loading state

    // Add temporary "Tracking..." AI message
    setMessages((prev) => [
      ...prev,
      { role: "assistant", content: "*Tracking...*" },
    ]);

    try {
      // Send request to AI endpoint
      const response = await fetch("/api/ai/chat/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${localStorage.getItem("jwt_token")}`,
        },
        body: JSON.stringify({ message: userInput }),
      });
      const data = await response.json();

      // Remove "Tracking..." and replace with real response
      setMessages((prev) => [
        ...prev.slice(0, -1), // Remove last "Tracking..." entry
        { role: "assistant", content: data.response ?? "*[No response]*" },
      ]);
    } catch (error) {
      // Handle error gracefully
      setMessages((prev) => [
        ...prev.slice(0, -1),
        { role: "assistant", content: "*[Error fetching response]*" },
      ]);
    } finally {
      setIsLoading(false);
      setUserInput(""); // Clear input field
    }
  }

  return (
    <>
      {/* Floating bubble (bottom-right) */}
      <div
        className="fixed bottom-8 right-8 w-12 h-12 rounded-full flex items-center justify-center cursor-pointer"
        style={{ backgroundColor: "oklch(29.42% 0.039 76.43)" }}
        onClick={() => setOpen(true)}
      >
        <span className="text-white font-bold text-xl">
          <BotMessageSquare />
        </span>
      </div>

      {/* Chat Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild></DialogTrigger>
        <DialogContent className="flex flex-col h-[70vh]">
          <DialogHeader>
            <h2 className="text-lg font-bold">Caff Track Chat</h2>
          </DialogHeader>

          {/* Message list */}
          <div className="flex-1 overflow-y-auto border p-2 space-y-3">
            {messages.map((msg, idx) => {
              const isAssistant = msg.role === "assistant";
              return (
                <div
                  key={idx}
                  className={`p-2 rounded ${
                    isAssistant ? "bg-gray-100" : "bg-gray-200"
                  }`}
                >
                  <strong>{isAssistant ? "CaffTrack" : "You"}:</strong>{" "}
                  {isAssistant ? (
                    <div className="prose prose-sm max-w-none mt-1">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <span>{msg.content}</span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Input + Send */}
          <DialogFooter className="flex space-x-2">
            <Input
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Type your question..."
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSend();
              }}
              disabled={isLoading} // Disable input while loading
            />
            <Button onClick={handleSend} disabled={isLoading}>
              {isLoading ? "Tracking..." : "Send"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
