"use client";
import { useState, useRef, useEffect } from "react";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";

interface Message {
  id: string;
  content: string;
  createdAt: string;
  read: boolean;
  sender: { id: string; name: string; role: string };
}

interface MessageThreadProps {
  bookingId: string;
  currentUserId: string;
  initialMessages: Message[];
}

export default function MessageThread({
  bookingId,
  currentUserId,
  initialMessages,
}: MessageThreadProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    if (!text.trim() || sending) return;
    setSending(true);
    const res = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookingId, content: text.trim() }),
    });
    if (res.ok) {
      const msg = await res.json();
      setMessages((prev) => [...prev, msg]);
      setText("");
    }
    setSending(false);
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className="flex flex-col">
      <div className="h-72 overflow-y-auto p-5 space-y-4">
        {messages.length === 0 && (
          <p className="text-center text-sm text-[#64748B] py-8">
            No messages yet. Send a message to your agency.
          </p>
        )}
        {messages.map((msg) => {
          const isMe = msg.sender.id === currentUserId;
          return (
            <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-xs lg:max-w-md ${isMe ? "order-2" : "order-1"}`}>
                {!isMe && (
                  <p className="text-xs text-[#64748B] mb-1 ml-2">{msg.sender.name}</p>
                )}
                <div
                  className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    isMe
                      ? "bg-[#0891b2] text-white rounded-br-sm"
                      : "bg-[#F8FAFC] text-[#0F172A] border border-gray-100 rounded-bl-sm"
                  }`}
                >
                  {msg.content}
                </div>
                <p className={`text-xs text-[#64748B] mt-1 ${isMe ? "text-right mr-2" : "ml-2"}`}>
                  {formatDate(msg.createdAt, "d MMM, h:mm a")}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <div className="border-t border-gray-100 p-4 flex gap-3">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Type a message… (Enter to send)"
          rows={2}
          className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm text-[#0F172A] placeholder:text-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#0891b2] resize-none"
        />
        <Button onClick={send} disabled={sending || !text.trim()} size="icon" className="self-end h-10 w-10">
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
