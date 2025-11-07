// === FILE: src/components/chat/ChatBubble.jsx ===
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import TextareaAutosize from "react-textarea-autosize";
import { useChatStore } from "../../store/useChatStore";
import {
  startChatSession,
  sendChatMessage,
  getChatHistory,             // ✅ dùng để probe session còn hợp lệ
} from "../../services/api";

// Markdown safe render
import { marked } from "marked";
import DOMPurify from "dompurify";
import hljs from "highlight.js";
import "highlight.js/styles/github-dark.css";
import axios from "axios";

// ====== Icons (inline SVG) ======
const IconChat = (p) => <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.7" {...p}><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M3 12a9 9 0 1018 0 9 9 0 10-18 0z"/></svg>;
const IconClose = (p) => <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.7" {...p}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>;
const IconMin = (p) => <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.7" {...p}><path strokeLinecap="round" strokeLinejoin="round" d="M6 12h12"/></svg>;
const IconSend = (p) => <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.7" {...p}><path strokeLinecap="round" strokeLinejoin="round" d="M4 8l8-4 8 4-8 4-8-4zm0 8l8-4 8 4"/></svg>;
const IconCopy = (p) => <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.7" {...p}><path d="M8 8h8v8H8z"/><path d="M16 8V6a2 2 0 00-2-2H8"/></svg>;
const IconRefresh = (p) => <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.7" {...p}><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v6h6M20 20v-6h-6M20 9a8 8 0 10-1.8 10.1"/></svg>;
const IconStop = (p) => <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.7" {...p}><rect x="6" y="6" width="12" height="12" rx="2"/></svg>;
const Spinner = () => (
  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v3a5 5 0 00-5 5H4z" />
  </svg>
);

// ====== Markdown setup ======
marked.setOptions({
  highlight(code, lang) {
    if (lang && hljs.getLanguage(lang)) {
      return hljs.highlight(code, { language: lang }).value;
    }
    return hljs.highlightAuto(code).value;
  },
  breaks: true,
  gfm: true,
});
const renderMD = (md) => {
  const dirty = marked.parse(md ?? "");
  return { __html: DOMPurify.sanitize(dirty) };
};

// ====== Component ======
export default function ChatBubble() {
  const { sessionId, setSession, messages, push, replaceMessages, unread, incUnread, clearUnread } = useChatStore();
  const [open, setOpen] = useState(false);
  const [min, setMin] = useState(false);
  const [booting, setBooting] = useState(false);
  const [sending, setSending] = useState(false);
  const [input, setInput] = useState("");
  const [err, setErr] = useState("");
  const listRef = useRef(null);
  const abortRef = useRef(null);
  const atBottomRef = useRef(true);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const submittingRef = useRef(false); // 🔒 chống submit chồng

  // Auto scroll bottom on new messages
  useEffect(() => {
    if (!listRef.current) return;
    if (atBottomRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight + 400;
    } else {
      setShowScrollBtn(true);
      if (!open) incUnread();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages.length]);

  // track bottom
  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    const onScroll = () => {
      const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 24;
      atBottomRef.current = nearBottom;
      setShowScrollBtn(!nearBottom);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  // open -> ensure session (probe sid cũ; nếu 404 thì tạo mới)
  const ensureSession = useCallback(async () => {
    setErr("");
    // Nếu đã có session hiện tại -> probe nhanh
    if (sessionId) {
      try {
        await getChatHistory(sessionId, { limit: 1 });
        return sessionId; // còn hợp lệ
      } catch (e) {
        if (e?.response?.status !== 404) throw e; // lỗi khác thì ném ra
        // 404: sid rác -> tạo mới ở dưới
      }
    }

    setBooting(true);
    try {
      const { data } = await startChatSession();
      setSession(data.session_id);
      if (data.message) push("bot", data.message);
      return data.session_id;
    } catch (e) {
      console.error(e);
      setErr("Không thể khởi tạo phiên chat. Vui lòng đăng nhập và thử lại.");
      throw e;
    } finally {
      setBooting(false);
    }
  }, [sessionId, setSession, push]);

  const handleOpen = useCallback(async () => {
    setOpen(true);
    setMin(false);
    clearUnread();
    try { await ensureSession(); } catch {}
  }, [ensureSession, clearUnread]);

  const handleClose = useCallback(() => {
    setOpen(false);
    setMin(false);
  }, []);

  const handleMin = useCallback(() => setMin((x) => !x), []);

  const canSend = useMemo(() => input.trim().length > 0 && !sending && !!sessionId, [input, sending, sessionId]);

  const send = useCallback(
    async (text) => {
      if (!text || !sessionId) return;
      setSending(true);
      setErr("");

      // Abort request trước đó nếu còn
      try { abortRef.current?.abort(); } catch {}
      abortRef.current = new AbortController();

      try {
        const { data } = await sendChatMessage(sessionId, text, { signal: abortRef.current.signal });
        push("bot", data?.response ?? "(không có phản hồi)");
      } catch (e) {
        const st = e?.response?.status;

        // 🔁 Auto-heal: 404 Not Found (sid rác) -> tạo phiên mới và thử lại 1 lần
        if (st === 404) {
          try {
            const { data } = await startChatSession();
            setSession(data.session_id);
            const r2 = await sendChatMessage(data.session_id, text, { signal: abortRef.current.signal });
            push("bot", r2?.data?.response ?? "(không có phản hồi)");
            return;
          } catch (_) {
            // rơi xuống khối báo lỗi chung
          }
        }

        // ✅ nhận diện đầy đủ cancel/abort các kiểu
        const canceled =
          axios.isCancel?.(e) ||
          e?.code === "ERR_CANCELED" ||
          e?.name === "CanceledError" ||
          e?.name === "AbortError" ||
          String(e?.message || "").toLowerCase().includes("aborted") ||
          String(e?.message || "").toLowerCase().includes("canceled");

        if (!canceled) {
          console.error(e);
          push("bot", "Xin lỗi, mình đang gặp sự cố. Bạn thử lại giúp mình nhé.");
          setErr(st === 401 ? "Phiên đăng nhập đã hết hạn." : "Hệ thống đang bận hoặc mất kết nối.");
        }
      } finally {
        setSending(false);
        abortRef.current = null;
      }
    },
    [sessionId, push, setSession]
  );

  const handleSubmit = useCallback(
    async (e) => {
      e?.preventDefault?.();

      // 🔒 chống gửi chồng + đang gửi
      if (submittingRef.current || sending) return;

      const text = input.trim();
      if (!text) return;

      submittingRef.current = true;
      try {
        if (!sessionId) {
          try { await ensureSession(); } catch { return; }
        }
        push("user", text);
        setInput("");
        await send(text);
      } finally {
        submittingRef.current = false;
      }
    },
    [input, sessionId, ensureSession, send, push, sending]
  );

  const onKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSubmit(e);
      }
    },
    [handleSubmit]
  );

  const copyText = useCallback(async (t) => {
    try { await navigator.clipboard.writeText(t); setErr(""); }
    catch { setErr("Không thể copy vào clipboard."); }
  }, []);

  const regenerate = useCallback(async () => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === "user") { await send(messages[i].text); break; }
    }
  }, [messages, send]);

  const stopSending = useCallback(() => {
    try { abortRef.current?.abort(); } catch {}
  }, []);

  const quick = useMemo(() => [
    "Tư vấn điện thoại 10–12 triệu pin trâu",
    "Chính sách bảo hành tại Cellphones",
    "Mình muốn kiểm tra đơn hàng",
  ], []);

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {/* FAB khi đóng */}
      {!open && (
        <button
          onClick={handleOpen}
          aria-label="Mở chat hỗ trợ"
          className="relative bg-gray-900 text-white w-16 h-16 rounded-full shadow-xl grid place-items-center hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
        >
          <IconChat />
          {unread > 0 && (
            <span className="absolute -top-1 -right-1 text-[11px] px-1.5 py-0.5 rounded-full bg-red-500 text-white shadow">
              {unread > 99 ? "99+" : unread}
            </span>
          )}
        </button>
      )}

      {/* Cửa sổ chat */}
      <AnimatePresence>
        {open && (
          <motion.section
            key="cps-chat"
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 300, damping: 24 }}
            role="dialog"
            aria-label="Hộp thoại trợ lý AI"
            className={`w-[22rem] sm:w-[26rem] rounded-2xl shadow-2xl border bg-white overflow-hidden ${min ? "h-16" : "h-[32rem] sm:h-[36rem]"}`}
          >
            {/* Header */}
            <div className="bg-gray-900 text-white px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/10 grid place-items-center">
                  <IconChat className="w-5 h-5" />
                </div>
                <div className="leading-tight">
                  <h3 className="font-semibold">CELLPHONES • Trợ lý AI</h3>
                  <p className="text-xs text-white/70">{sending ? "Đang trả lời…" : "Sẵn sàng hỗ trợ"}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={handleMin} className="p-2 rounded hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/40" aria-label={min ? "Mở rộng" : "Thu nhỏ"}>
                  <IconMin />
                </button>
                <button onClick={handleClose} className="p-2 rounded hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/40" aria-label="Đóng">
                  <IconClose />
                </button>
              </div>
            </div>

            {!min && (
              <>
                {err && <div className="px-4 py-2 text-[13px] bg-amber-50 text-amber-900 border-b border-amber-200">{err}</div>}

                {/* Danh sách tin */}
                <div ref={listRef} className="relative h-[calc(100%-9.5rem)] overflow-y-auto px-3 py-3 space-y-3">
                  {/* Gợi ý nhanh khi trống */}
                  {messages.length === 0 && (
                    <div className="flex flex-wrap gap-2">
                      {quick.map((q) => (
                        <button
                          key={q}
                          onClick={() => { setInput(q); setTimeout(() => handleSubmit(), 0); }}
                          className="text-sm px-3 py-1.5 rounded-full border border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  )}

                  {messages.map((m) => (
                    <div key={m.id} className={`flex gap-2 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                      {m.role === "bot" && (
                        <div className="w-8 h-8 rounded-full bg-gray-900 text-white grid place-items-center shrink-0">
                          <IconChat className="w-4 h-4" />
                        </div>
                      )}
                      <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${m.role === "user" ? "bg-blue-600 text-white rounded-tr-md" : "bg-gray-100 text-gray-800 rounded-tl-md"}`}>
                        {m.role === "bot" ? (
                          <div className="prose prose-sm max-w-none prose-pre:my-2 prose-code:px-1 prose-code:bg-gray-200" dangerouslySetInnerHTML={renderMD(m.text)} />
                        ) : (
                          <pre className="whitespace-pre-wrap font-sans">{m.text}</pre>
                        )}
                        <div className="mt-1 text-[10px] opacity-60 select-none">{new Date(m.ts).toLocaleTimeString()}</div>
                        {m.role === "bot" && (
                          <div className="mt-1 flex gap-2 text-xs">
                            <button onClick={() => copyText(m.text)} className="inline-flex items-center gap-1 text-gray-600 hover:text-gray-800">
                              <IconCopy /> Copy
                            </button>
                            <button onClick={regenerate} className="inline-flex items-center gap-1 text-gray-600 hover:text-gray-800">
                              <IconRefresh /> Tạo lại
                            </button>
                          </div>
                        )}
                      </div>
                      {m.role === "user" && (
                        <div className="w-8 h-8 rounded-full bg-blue-600 text-white grid place-items-center shrink-0">
                          <span className="font-semibold text-[11px]">U</span>
                        </div>
                      )}
                    </div>
                  ))}

                  {(booting || sending) && (
                    <div className="flex items-center gap-2 text-gray-500 text-sm">
                      <span className="inline-flex -space-x-1">
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:120ms]" />
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:240ms]" />
                      </span>
                      <span>{booting ? "Đang khởi tạo phiên…" : "Trợ lý đang trả lời…"}</span>
                    </div>
                  )}

                  {/* Nút kéo xuống đáy */}
                  {showScrollBtn && (
                    <button
                      onClick={() => { listRef.current.scrollTop = listRef.current.scrollHeight + 400; atBottomRef.current = true; setShowScrollBtn(false); clearUnread(); }}
                      className="absolute right-3 bottom-3 text-xs px-2 py-1 rounded-full bg-gray-900 text-white/90 hover:text-white shadow"
                    >
                      Xuống cuối
                    </button>
                  )}
                </div>

                {/* Input */}
                <form onSubmit={handleSubmit} className="border-t bg-white p-3">
                  <div className="flex items-end gap-2">
                    <TextareaAutosize
                      minRows={1}
                      maxRows={6}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={onKeyDown}
                      placeholder="Nhập tin… (Enter gửi, Shift+Enter xuống dòng)"
                      className="flex-1 px-3 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={sending}
                    />
                    <button
                      type={sending ? "button" : "submit"}
                      onClick={sending ? stopSending : undefined}
                      disabled={(input.trim().length === 0) && !sending}
                      className={`px-3 py-2 rounded-xl text-white inline-flex items-center gap-1 ${sending ? "bg-red-500 hover:bg-red-600" : input.trim().length > 0 ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-400 cursor-not-allowed"}`}
                      title={sending ? "Dừng phản hồi" : "Gửi"}
                    >
                      {sending ? <><IconStop /> Dừng</> : <><IconSend /><span className="hidden sm:inline">Gửi</span></>}
                    </button>
                  </div>
                </form>
              </>
            )}
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
}
