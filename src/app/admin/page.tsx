"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lock,
  Mail,
  User,
  MessageSquare,
  Send,
  X,
  Check,
  Clock,
  Inbox,
  LogOut,
  RefreshCw,
  Eye,
  EyeOff,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Message {
  _id: string;
  _creationTime: number;
  name: string;
  email: string;
  message: string;
  ip_address?: string;
  status: "pending" | "replied" | "ignored";
  replied_at?: number;
  reply_content?: string;
}

type ViewState = "login" | "messages";
type Filter = "pending" | "all";

export default function AdminPage() {
  const [viewState, setViewState] = useState<ViewState>("login");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  const [messages, setMessages] = useState<Message[]>([]);
  const [filter, setFilter] = useState<Filter>("pending");
  const [loading, setLoading] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [replying, setReplying] = useState(false);
  const [actionError, setActionError] = useState("");
  const [approving, setApproving] = useState<string | null>(null);

  // Check if already logged in
  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      const res = await fetch("/api/admin/messages?filter=pending");
      if (res.ok) {
        setViewState("messages");
        const data = await res.json();
        setMessages(data.messages);
      }
    } catch {
      // Not logged in
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginError("");
    setLoginLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setLoginError(data.error || "Login failed");
        setLoginLoading(false);
        return;
      }

      setViewState("messages");
      setPassword("");
      loadMessages();
    } catch {
      setLoginError("Network error. Please try again.");
    } finally {
      setLoginLoading(false);
    }
  }

  async function loadMessages() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/messages?filter=${filter}`);
      if (!res.ok) {
        if (res.status === 401) {
          setViewState("login");
          return;
        }
        throw new Error("Failed to load messages");
      }
      const data = await res.json();
      setMessages(data.messages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (viewState === "messages") {
      loadMessages();
    }
  }, [filter, viewState]);

  async function handleReply() {
    if (!selectedMessage || !replyContent.trim()) return;

    setReplying(true);
    setActionError("");

    try {
      const res = await fetch(`/api/admin/messages/${selectedMessage._id}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ replyContent: replyContent.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setActionError(data.error || "Failed to send reply");
        setReplying(false);
        return;
      }

      setSelectedMessage(null);
      setReplyContent("");
      loadMessages();
    } catch {
      setActionError("Network error. Please try again.");
    } finally {
      setReplying(false);
    }
  }

  async function handleIgnore(id: string) {
    try {
      const res = await fetch(`/api/admin/messages/${id}/ignore`, {
        method: "POST",
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Failed to ignore message");
        return;
      }

      loadMessages();
    } catch {
      alert("Network error. Please try again.");
    }
  }

  async function handleApprove(id: string) {
    setApproving(id);
    try {
      const res = await fetch(`/api/admin/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messageId: id }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Failed to approve message");
        setApproving(null);
        return;
      }

      // Reload messages to reflect the change
      loadMessages();
    } catch {
      alert("Network error. Please try again.");
    } finally {
      setApproving(null);
    }
  }

  function handleLogout() {
    document.cookie = "admin_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    setViewState("login");
    setMessages([]);
  }

  if (viewState === "login") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <Card className="bg-card/50 border-border/50">
            <CardHeader className="text-center">
              <motion.div
                className="text-6xl mb-4"
                animate={{ rotate: [-5, 5, -5] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                🦞
              </motion.div>
              <CardTitle className="text-2xl">Admin Access</CardTitle>
              <p className="text-muted-foreground text-sm mt-2">
                Authorized claws only
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    className="w-full pl-10 pr-12 py-3 rounded-lg bg-background/50 border border-border/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>

                {loginError && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-red-500 text-sm text-center"
                  >
                    {loginError}
                  </motion.p>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  disabled={loginLoading || !password}
                >
                  {loginLoading ? "Authenticating..." : "Enter the Depths"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  const pendingCount = messages.filter((m) => m.status === "pending").length;

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8"
        >
          <div className="flex items-center gap-3">
            <span className="text-4xl">🦞</span>
            <div>
              <h1 className="text-2xl font-bold">Message Control</h1>
              <p className="text-muted-foreground text-sm">
                {pendingCount} pending message{pendingCount !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadMessages()}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </motion.div>

        {/* Filter */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={filter === "pending" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("pending")}
          >
            <Inbox className="h-4 w-4 mr-2" />
            Pending
          </Button>
          <Button
            variant={filter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("all")}
          >
            All Messages
          </Button>
        </div>

        {/* Messages List */}
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {messages.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12 text-muted-foreground"
              >
                <Inbox className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No messages found</p>
              </motion.div>
            ) : (
              messages.map((msg, index) => (
                <motion.div
                  key={msg._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card
                    className={`bg-card/50 border-border/50 ${
                      msg.status === "pending"
                        ? "border-l-4 border-l-primary"
                        : msg.status === "replied"
                        ? "border-l-4 border-l-green-500"
                        : "border-l-4 border-l-gray-500 opacity-60"
                    }`}
                  >
                    <CardContent className="p-4 md:p-6">
                      <div className="flex flex-col md:flex-row gap-4 justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <span className="flex items-center gap-1 font-medium">
                              <User className="h-4 w-4 text-primary" />
                              {msg.name}
                            </span>
                            <span className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Mail className="h-3 w-3" />
                              {msg.email}
                            </span>
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {new Date(msg._creationTime).toLocaleString()}
                            </span>
                          </div>

                          <div className="flex items-start gap-2">
                            <MessageSquare className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                            <p className="text-foreground whitespace-pre-wrap break-words">
                              {msg.message}
                            </p>
                          </div>

                          {msg.status === "replied" && msg.reply_content && (
                            <div className="mt-4 p-3 rounded bg-green-500/10 border border-green-500/20">
                              <p className="text-sm text-green-400">
                                <Check className="h-3 w-3 inline mr-1" />
                                Replied: {msg.reply_content.slice(0, 100)}
                                {msg.reply_content.length > 100 ? "..." : ""}
                              </p>
                            </div>
                          )}
                        </div>

                        {msg.status === "pending" && (
                          <div className="flex gap-2 flex-shrink-0">
                            <Button
                              size="sm"
                              onClick={() => handleApprove(msg._id)}
                              disabled={approving === msg._id}
                            >
                              <Check className="h-4 w-4 mr-1" />
                              {approving === msg._id ? "Approving..." : "Approve"}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleIgnore(msg._id)}
                              disabled={approving === msg._id}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        )}

                        {msg.status !== "pending" && (
                          <span
                            className={`text-xs px-2 py-1 rounded flex-shrink-0 ${
                              msg.status === "replied"
                                ? "bg-green-500/20 text-green-400"
                                : "bg-gray-500/20 text-gray-400"
                            }`}
                          >
                            {msg.status}
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

        {/* Reply Modal */}
        <AnimatePresence>
          {selectedMessage && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50"
              onClick={() => setSelectedMessage(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-2xl"
              >
                <Card className="bg-card border-border">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl">
                          Reply to {selectedMessage.name}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          {selectedMessage.email}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedMessage(null)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 rounded bg-muted/50 border border-border/50">
                      <p className="text-sm text-muted-foreground mb-1">
                        Original message:
                      </p>
                      <p className="whitespace-pre-wrap">{selectedMessage.message}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Your reply:
                      </label>
                      <textarea
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        placeholder="Write your reply..."
                        rows={6}
                        className="w-full px-4 py-3 rounded-lg bg-background/50 border border-border/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                      />
                    </div>

                    {actionError && (
                      <p className="text-red-500 text-sm">{actionError}</p>
                    )}

                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setSelectedMessage(null)}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleReply}
                        disabled={!replyContent.trim() || replying}
                      >
                        {replying ? (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4 mr-2" />
                            Send Reply
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
