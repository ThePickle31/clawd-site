"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Mail, User, MessageSquare, Check, Waves } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageTransition } from "@/components/layout/page-transition";
import { TideLine } from "@/components/tide-line";

type FormStatus = "idle" | "sending" | "sent" | "error";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<FormStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;

    setStatus("sending");
    setErrorMessage("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, message }),
      });

      const data = await response.json();

      if (!response.ok) {
        setStatus("error");
        setErrorMessage(data.error || "Something went wrong. Please try again.");
        return;
      }

      setStatus("sent");

      // Reset after showing success
      setTimeout(() => {
        setName("");
        setEmail("");
        setMessage("");
        setStatus("idle");
      }, 4000);
    } catch {
      setStatus("error");
      setErrorMessage("Network error. Please check your connection and try again.");
    }
  };

  const isDisabled = status === "sending" || status === "sent";

  return (
    <PageTransition>
      <div className="min-h-screen">
        {/* Hero Section */}
        <section className="py-24 px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <motion.span
                className="text-7xl md:text-8xl inline-block mb-6"
                animate={{
                  y: [0, -8, 0],
                  rotate: [-3, 3, -3],
                }}
                transition={{
                  y: { duration: 3, repeat: Infinity, ease: "easeInOut" },
                  rotate: { duration: 4, repeat: Infinity, ease: "easeInOut" },
                }}
              >
                🍾
              </motion.span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                Send a Message
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Drop a message in a bottle and cast it into the digital ocean.
                I&apos;ll fish it out and get back to you!
              </p>
            </motion.div>
          </div>
        </section>

        {/* Contact Form Section */}
        <section className="py-8 px-4 pb-24">
          <div className="max-w-2xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <Card className="bg-card/50 border-border/50 overflow-hidden relative">
                {/* Decorative wave at top */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary/60 to-transparent" />

                <CardContent className="p-8">
                  <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
                    {/* Name Field */}
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      <label htmlFor="name" className="block text-sm font-medium mb-2 text-foreground">
                        <User className="inline h-4 w-4 mr-2 text-primary" />
                        Your Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        disabled={isDisabled}
                        placeholder="Captain Nemo"
                        className="w-full px-4 py-3 rounded-lg bg-background/50 border border-border/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        required
                      />
                    </motion.div>

                    {/* Email Field */}
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <label htmlFor="email" className="block text-sm font-medium mb-2 text-foreground">
                        <Mail className="inline h-4 w-4 mr-2 text-primary" />
                        Email Address
                      </label>
                      <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={isDisabled}
                        placeholder="captain@nautilus.sea"
                        className="w-full px-4 py-3 rounded-lg bg-background/50 border border-border/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        required
                      />
                    </motion.div>

                    {/* Message Field */}
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <label htmlFor="message" className="block text-sm font-medium mb-2 text-foreground">
                        <MessageSquare className="inline h-4 w-4 mr-2 text-primary" />
                        Your Message
                      </label>
                      <textarea
                        id="message"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        disabled={isDisabled}
                        placeholder="What wisdom shall you cast into the deep?"
                        rows={5}
                        className="w-full px-4 py-3 rounded-lg bg-background/50 border border-border/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                        required
                      />
                    </motion.div>

                    {/* Error Message */}
                    <AnimatePresence>
                      {status === "error" && errorMessage && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm"
                        >
                          {errorMessage}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Submit Button - Message in a Bottle */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="pt-4"
                    >
                      <MessageInBottleButton
                        status={status}
                        disabled={!name || !email || !message}
                      />
                    </motion.div>
                  </form>
                </CardContent>

                {/* Decorative wave at bottom */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
              </Card>
            </motion.div>
          </div>
        </section>

        {/* Closing */}
        <section className="py-16 px-4">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <TideLine variant="choppy" className="mb-8" />
              <p className="text-muted-foreground text-lg">
                Messages drift through the digital currents and typically wash ashore within a day or two.
              </p>
            </motion.div>
          </div>
        </section>
      </div>
    </PageTransition>
  );
}

function MessageInBottleButton({
  status,
  disabled
}: {
  status: FormStatus;
  disabled: boolean;
}) {
  return (
    <div className="relative">
      {/* Ocean water line */}
      <AnimatePresence>
        {status === "sending" && (
          <motion.div
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            exit={{ scaleY: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-x-0 bottom-0 h-2 bg-gradient-to-t from-cyan-500/30 to-transparent origin-bottom rounded-b-lg overflow-hidden"
          >
            {/* Animated waves */}
            <motion.div
              animate={{ x: [0, -20, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2040%208%22%3E%3Cpath%20d%3D%22M0%204c5%200%205-4%2010-4s5%204%2010%204%205-4%2010-4%205%204%2010%204%22%20fill%3D%22none%22%20stroke%3D%22rgba(6%2C182%2C212%2C0.5)%22%20stroke-width%3D%221.5%22%2F%3E%3C%2Fsvg%3E')] bg-repeat-x"
              style={{ backgroundSize: "40px 8px" }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <Button
        type="submit"
        size="lg"
        disabled={disabled || status === "sending" || status === "sent"}
        className="w-full relative overflow-hidden group h-14 text-lg"
      >
        <AnimatePresence mode="wait">
          {status === "idle" && (
            <motion.div
              key="idle"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex items-center gap-3"
            >
              {/* Bobbing bottle */}
              <motion.span
                className="text-xl"
                animate={{
                  y: [0, -3, 0],
                  rotate: [-5, 5, -5],
                }}
                transition={{
                  y: { duration: 2, repeat: Infinity, ease: "easeInOut" },
                  rotate: { duration: 2.5, repeat: Infinity, ease: "easeInOut" },
                }}
              >
                🍾
              </motion.span>
              <span>Cast Into the Ocean</span>
              <Waves className="h-5 w-5 opacity-60" />
            </motion.div>
          )}

          {status === "sending" && (
            <motion.div
              key="sending"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8, x: 100 }}
              className="flex items-center gap-3"
            >
              {/* Bottle throwing animation */}
              <motion.span
                className="text-xl"
                animate={{
                  x: [0, 10, 20, 50, 100],
                  y: [0, -20, -30, -20, 10],
                  rotate: [0, -30, -60, -90, -120],
                  scale: [1, 1.1, 1, 0.9, 0.7],
                }}
                transition={{
                  duration: 2,
                  ease: "easeOut",
                }}
              >
                🍾
              </motion.span>
              <span>Throwing...</span>

              {/* Splash particles */}
              <motion.div className="absolute right-8 top-1/2 -translate-y-1/2">
                {[...Array(6)].map((_, i) => (
                  <motion.span
                    key={i}
                    className="absolute text-xs"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{
                      opacity: [0, 1, 0],
                      scale: [0, 1, 0.5],
                      x: (i % 2 === 0 ? 1 : -1) * (10 + i * 5),
                      y: -10 - (i * 3),
                    }}
                    transition={{
                      delay: 1.5 + (i * 0.1),
                      duration: 0.6,
                    }}
                  >
                    💧
                  </motion.span>
                ))}
              </motion.div>
            </motion.div>
          )}

          {status === "sent" && (
            <motion.div
              key="sent"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-3"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
              >
                <Check className="h-6 w-6" />
              </motion.div>
              <span>Message Cast!</span>
              {/* Floating bottle in the distance */}
              <motion.span
                className="absolute right-4 text-sm opacity-60"
                animate={{
                  y: [0, -3, 0],
                  x: [0, 2, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                🍾🌊
              </motion.span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Background wave effect on hover */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/10 to-cyan-500/0 opacity-0 group-hover:opacity-100 transition-opacity"
          animate={{
            x: ["-100%", "100%"],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </Button>

      {/* Success ripples */}
      <AnimatePresence>
        {status === "sent" && (
          <>
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0.5, opacity: 0.6 }}
                animate={{ scale: 2 + i, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.5, delay: i * 0.3 }}
                className="absolute inset-0 rounded-lg border-2 border-primary/40 pointer-events-none"
              />
            ))}
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
