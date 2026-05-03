import { useState, useRef, useEffect, useCallback } from "react";
import { useInvokeTutor, useAddToRevisionQueue } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Brain, Send, Volume2, VolumeX, Lightbulb, BookOpen, RotateCcw, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type PedagogyStyle = "english" | "hinglish" | "mnemonic";
type ExamType = "NEET" | "JEE";

interface TutorMessage {
  role: "user" | "tutor";
  content: string;
  mnemonics?: string[];
  weakTopics?: string[];
  revisionSuggestions?: string[];
}

const VOICES: Record<string, { lang: string; name?: string }> = {
  english: { lang: "en-IN", name: undefined },
  hinglish: { lang: "hi-IN", name: undefined },
  mnemonic: { lang: "en-IN", name: undefined },
};

function useTTS() {
  const [speaking, setSpeaking] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const speak = useCallback((text: string, style: PedagogyStyle) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const voiceConfig = VOICES[style];
    utterance.lang = voiceConfig.lang;
    utterance.rate = 0.95;
    utteranceRef.current = utterance;
    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(utterance);
  }, []);

  const stop = useCallback(() => {
    window.speechSynthesis?.cancel();
    setSpeaking(false);
  }, []);

  return { speaking, speak, stop };
}

export default function Tutor() {
  const { toast } = useToast();
  const [messages, setMessages] = useState<TutorMessage[]>([]);
  const [input, setInput] = useState("");
  const [examType, setExamType] = useState<ExamType>("NEET");
  const [subject, setSubject] = useState("Physics");
  const [style, setStyle] = useState<PedagogyStyle>("english");
  const [lastResponse, setLastResponse] = useState<TutorMessage | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const { speaking, speak, stop } = useTTS();

  const invokeTutor = useInvokeTutor({
    mutation: {
      onSuccess: (data) => {
        const tutorMsg: TutorMessage = {
          role: "tutor",
          content: data.response,
          mnemonics: data.mnemonics,
          weakTopics: data.weakTopics,
          revisionSuggestions: data.revisionSuggestions,
        };
        setMessages((prev) => [...prev, tutorMsg]);
        setLastResponse(tutorMsg);
      },
      onError: () => {
        toast({ title: "Tutor error", description: "Could not get a response. Try again.", variant: "destructive" });
      },
    },
  });

  const addRevision = useAddToRevisionQueue({
    mutation: {
      onSuccess: () => toast({ title: "Added to revision queue!" }),
    },
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function handleSend() {
    const q = input.trim();
    if (!q || invokeTutor.isPending) return;
    setMessages((prev) => [...prev, { role: "user", content: q }]);
    setInput("");
    invokeTutor.mutate({
      data: {
        userInput: q,
        targetExam: examType,
        subject,
        pedagogyStyle: style,
      },
    });
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function handleSpeak(text: string) {
    if (speaking) {
      stop();
    } else {
      speak(text, style);
    }
  }

  function handleAddRevision(topic: string) {
    addRevision.mutate({
      data: {
        topic,
        subject,
        examType,
        score: 0,
        nextReviewAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      },
    });
  }

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden" data-testid="page-tutor">
      <div className="border-b border-border px-6 py-3 bg-background flex flex-col sm:flex-row items-start sm:items-center gap-3 shrink-0">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-primary" />
          <span className="font-semibold text-sm">AI Tutor</span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Select value={examType} onValueChange={(v) => setExamType(v as ExamType)}>
            <SelectTrigger className="h-8 text-xs w-24" data-testid="select-exam">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="NEET">NEET</SelectItem>
              <SelectItem value="JEE">JEE</SelectItem>
            </SelectContent>
          </Select>
          <Select value={subject} onValueChange={setSubject}>
            <SelectTrigger className="h-8 text-xs w-28" data-testid="select-subject-tutor">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {["Physics", "Chemistry", "Biology", "Mathematics"].map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={style} onValueChange={(v) => setStyle(v as PedagogyStyle)}>
            <SelectTrigger className="h-8 text-xs w-28" data-testid="select-style">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="english">English</SelectItem>
              <SelectItem value="hinglish">Hinglish</SelectItem>
              <SelectItem value="mnemonic">Mnemonic</SelectItem>
            </SelectContent>
          </Select>
          {messages.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs gap-1"
              onClick={() => { setMessages([]); setLastResponse(null); stop(); }}
              data-testid="btn-clear-chat"
            >
              <RotateCcw className="w-3 h-3" />
              Clear
            </Button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6" data-testid="chat-messages">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center max-w-md">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Brain className="w-7 h-7 text-primary" />
              </div>
              <h2 className="font-bold text-lg">Ask Cortex anything</h2>
              <p className="text-muted-foreground text-sm mt-2">
                Your adversarial AI tutor for NEET &amp; JEE. Ask questions, get explanations with mnemonics, and build lasting memory.
              </p>
              <div className="flex flex-wrap gap-2 justify-center mt-4">
                {[
                  "Explain Newton's laws with examples",
                  "How does photosynthesis work?",
                  "What is Ohm's law?",
                  "Explain the carbon cycle",
                ].map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => setInput(prompt)}
                    className="text-xs px-3 py-1.5 rounded-full border border-border hover:border-primary/50 hover:bg-muted transition-colors"
                    data-testid={`prompt-suggestion`}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-4">
            {messages.map((msg, i) => (
              <div
                key={i}
                data-testid={`message-${i}`}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "user" ? (
                  <div className="max-w-[80%] bg-primary text-primary-foreground rounded-2xl rounded-tr-sm px-4 py-2.5 text-sm">
                    {msg.content}
                  </div>
                ) : (
                  <div className="max-w-[85%] space-y-2">
                    <Card className="rounded-2xl rounded-tl-sm">
                      <CardContent className="pt-4 pb-3 px-4">
                        <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>

                        {msg.mnemonics && msg.mnemonics.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-border">
                            <p className="text-xs font-semibold text-accent flex items-center gap-1 mb-2">
                              <Lightbulb className="w-3 h-3" />
                              Mnemonics
                            </p>
                            <ul className="space-y-1">
                              {msg.mnemonics.map((m, j) => (
                                <li key={j} className="text-xs text-muted-foreground pl-2 border-l-2 border-accent/40">
                                  {m}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {msg.revisionSuggestions && msg.revisionSuggestions.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {msg.revisionSuggestions.map((t, j) => (
                              <Badge
                                key={j}
                                variant="outline"
                                className="text-[10px] gap-1 cursor-pointer hover:bg-primary/10"
                                onClick={() => handleAddRevision(t)}
                                data-testid={`revision-suggestion-${j}`}
                              >
                                <Plus className="w-2.5 h-2.5" />
                                {t}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs gap-1 text-muted-foreground"
                      onClick={() => handleSpeak(msg.content)}
                      data-testid={`btn-speak-${i}`}
                    >
                      {speaking ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
                      {speaking ? "Stop" : "Listen"}
                    </Button>
                  </div>
                )}
              </div>
            ))}

            {invokeTutor.isPending && (
              <div className="flex justify-start" data-testid="tutor-loading">
                <Card className="max-w-[60%] rounded-2xl rounded-tl-sm">
                  <CardContent className="pt-4 pb-3 px-4 space-y-2">
                    <Skeleton className="h-3 w-48" />
                    <Skeleton className="h-3 w-64" />
                    <Skeleton className="h-3 w-40" />
                  </CardContent>
                </Card>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      <div className="border-t border-border px-4 py-3 bg-background shrink-0">
        <div className="max-w-3xl mx-auto flex gap-2 items-end">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Ask a ${examType} ${subject} question… (Enter to send)`}
            className="resize-none min-h-[44px] max-h-[140px] text-sm"
            rows={1}
            data-testid="input-question"
          />
          <Button
            size="icon"
            onClick={handleSend}
            disabled={!input.trim() || invokeTutor.isPending}
            className="shrink-0 h-11 w-11"
            data-testid="btn-send"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
