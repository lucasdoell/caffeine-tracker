// frontend/src/components/chatbot/chat-bot.tsx
"use client";

import React from "react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { BotMessageSquare } from 'lucide-react';
import { Input } from "@/components/ui/input";
import ReactMarkdown from "react-markdown";
// If you want GFM features (tables, strikethrough, etc.):
import remarkGfm from "remark-gfm";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;  // AI might include markdown (headings, bold, lists, etc.)
}

export function ChatBot() {
  const [open, setOpen] = React.useState(false);
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = React.useState("");

  async function handleSend() {
    if (!userInput.trim()) return;

    // Add user message
    setMessages((prev) => [...prev, { role: "user", content: userInput }]);

    // Send request
    const response = await fetch("/api/ai/chat/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${localStorage.getItem("jwt_token")}`,
      },
      body: JSON.stringify({ message: userInput }),
    });
    const data = await response.json();

    // Add assistant message (assuming `data.response` is the AI markdown)
    setMessages((prev) => [
      ...prev,
      { role: "assistant", content: data.response ?? "*[No response]*" },
    ]);

    // Clear input
    setUserInput("");
  }

  return (
    <>
    {/* Floating bubble (bottom-right) */}
    <div
    className="fixed bottom-8 right-8 w-12 h-12 rounded-full flex items-center justify-center cursor-pointer"
    style={{ backgroundColor: "oklch(29.42% 0.039 76.43)" }}
    onClick={() => setOpen(true)}
    >
    <span className="text-white font-bold text-xl"><BotMessageSquare /></span>
    </div>

      {/* Chat Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
        </DialogTrigger>
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
                    // Use ReactMarkdown with .prose to style headings, bold, etc.
                    <div className="prose prose-sm max-w-none mt-1">
                      <ReactMarkdown
                        // add GFM plugin if you want tables, strikethrough, etc.
                        remarkPlugins={[remarkGfm]}
                      >
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
            />
            <Button onClick={handleSend}>Send</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
