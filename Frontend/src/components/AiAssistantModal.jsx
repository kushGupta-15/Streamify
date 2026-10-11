import { useState } from "react";
import {
  BookOpenIcon,
  CheckCircle2Icon,
  CheckIcon,
  CopyIcon,
  HelpCircleIcon,
  LanguagesIcon,
  LightbulbIcon,
  Loader2Icon,
  SparklesIcon,
  Wand2Icon,
  XIcon,
} from "lucide-react";
import { getAiLanguageHelp } from "../lib/api";
import { LANGUAGES } from "../constants";
import toast from "react-hot-toast";

const AiAssistantModal = ({ isOpen, onClose, partnerUser, currentUser }) => {
  const [activeTab, setActiveTab] = useState("translate");
  const [loading, setLoading] = useState(false);
  const [copiedKey, setCopiedKey] = useState(null);

  // Translation State
  const [translateText, setTranslateText] = useState("");
  const [targetLang, setTargetLang] = useState(
    partnerUser?.nativeLanguage || currentUser?.learningLanguage || "Spanish"
  );
  const [translationResult, setTranslationResult] = useState(null);

  // Grammar Check State
  const [grammarText, setGrammarText] = useState("");
  const [grammarLang, setGrammarLang] = useState(
    currentUser?.learningLanguage || partnerUser?.nativeLanguage || "Spanish"
  );
  const [grammarResult, setGrammarResult] = useState(null);

  // Icebreakers State
  const [icebreakerLang, setIcebreakerLang] = useState(
    currentUser?.learningLanguage || partnerUser?.nativeLanguage || "Spanish"
  );
  const [icebreakersResult, setIcebreakersResult] = useState(null);

  if (!isOpen) return null;

  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleTranslate = async (e) => {
    e.preventDefault();
    if (!translateText.trim()) return;

    setLoading(true);
    try {
      const res = await getAiLanguageHelp({
        action: "translate",
        text: translateText.trim(),
        targetLanguage: targetLang,
        nativeLanguage: currentUser?.nativeLanguage || "English",
      });
      setTranslationResult(res.data);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Translation failed. Check Gemini API key.");
    } finally {
      setLoading(false);
    }
  };

  const handleGrammarCheck = async (e) => {
    e.preventDefault();
    if (!grammarText.trim()) return;

    setLoading(true);
    try {
      const res = await getAiLanguageHelp({
        action: "grammar-check",
        text: grammarText.trim(),
        targetLanguage: grammarLang,
        nativeLanguage: currentUser?.nativeLanguage || "English",
      });
      setGrammarResult(res.data);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Grammar check failed. Check Gemini API key.");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateIcebreakers = async () => {
    setLoading(true);
    try {
      const res = await getAiLanguageHelp({
        action: "icebreakers",
        targetLanguage: icebreakerLang,
        nativeLanguage: currentUser?.nativeLanguage || "English",
        partnerName: partnerUser?.fullName || "your language partner",
      });
      setIcebreakersResult(res.data);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to generate starters. Check Gemini API key.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="card bg-base-100 w-full max-w-2xl max-h-[90vh] shadow-2xl border border-base-300 flex flex-col overflow-hidden">
        {/* MODAL HEADER */}
        <div className="p-4 sm:p-5 border-b border-base-300 flex items-center justify-between bg-base-200/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <SparklesIcon className="size-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight flex items-center gap-2">
                Gemini AI Language Assistant
                <span className="badge badge-primary badge-xs">Flash 3.8</span>
              </h3>
              <p className="text-xs opacity-70">
                {partnerUser?.fullName
                  ? `Practicing with ${partnerUser.fullName} (${partnerUser.nativeLanguage || "Partner"})`
                  : "Smart translation, grammar feedback, and conversation starters"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="btn btn-ghost btn-sm btn-square rounded-full"
            aria-label="Close modal"
          >
            <XIcon className="size-4" />
          </button>
        </div>

        {/* TAB BUTTONS */}
        <div className="tabs tabs-boxed bg-base-200/80 p-1 mx-4 mt-4 rounded-lg flex">
          <button
            onClick={() => setActiveTab("translate")}
            className={`tab flex-1 gap-1.5 text-xs sm:text-sm ${
              activeTab === "translate" ? "tab-active font-semibold shadow-sm" : ""
            }`}
          >
            <LanguagesIcon className="size-4" />
            Translate
          </button>
          <button
            onClick={() => setActiveTab("grammar")}
            className={`tab flex-1 gap-1.5 text-xs sm:text-sm ${
              activeTab === "grammar" ? "tab-active font-semibold shadow-sm" : ""
            }`}
          >
            <BookOpenIcon className="size-4" />
            Grammar Check
          </button>
          <button
            onClick={() => setActiveTab("icebreakers")}
            className={`tab flex-1 gap-1.5 text-xs sm:text-sm ${
              activeTab === "icebreakers" ? "tab-active font-semibold shadow-sm" : ""
            }`}
          >
            <LightbulbIcon className="size-4" />
            Icebreakers
          </button>
        </div>

        {/* MODAL CONTENT */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {/* TAB 1: TRANSLATE */}
          {activeTab === "translate" && (
            <form onSubmit={handleTranslate} className="space-y-4">
              <div className="flex items-center justify-between gap-2">
                <label className="text-xs font-semibold uppercase tracking-wider opacity-70">
                  Target Language
                </label>
                <select
                  value={targetLang}
                  onChange={(e) => setTargetLang(e.target.value)}
                  className="select select-bordered select-xs"
                >
                  {LANGUAGES.map((lang) => (
                    <option key={lang} value={lang}>
                      {lang}
                    </option>
                  ))}
                </select>
              </div>

              <textarea
                value={translateText}
                onChange={(e) => setTranslateText(e.target.value)}
                placeholder="Type or paste text you want to translate..."
                className="textarea textarea-bordered w-full h-24 text-sm"
              />

              <button
                type="submit"
                disabled={loading || !translateText.trim()}
                className="btn btn-primary btn-sm w-full gap-2"
              >
                {loading ? (
                  <>
                    <Loader2Icon className="size-4 animate-spin" />
                    Translating with Gemini...
                  </>
                ) : (
                  <>
                    <Wand2Icon className="size-4" />
                    Translate into {targetLang}
                  </>
                )}
              </button>

              {/* TRANSLATION RESULT CARD */}
              {translationResult && (
                <div className="bg-base-200 p-4 rounded-xl space-y-3 border border-base-300">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="badge badge-primary badge-sm mb-1">Translation</span>
                      <p className="text-base font-semibold">{translationResult.translation}</p>
                      {translationResult.phonetic && (
                        <p className="text-xs opacity-70 italic mt-0.5">
                          Pronunciation: {translationResult.phonetic}
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(translationResult.translation, "trans-main")}
                      className="btn btn-ghost btn-xs btn-square"
                      title="Copy translation"
                    >
                      {copiedKey === "trans-main" ? (
                        <CheckIcon className="size-4 text-success" />
                      ) : (
                        <CopyIcon className="size-4" />
                      )}
                    </button>
                  </div>

                  {translationResult.explanation && (
                    <div className="text-xs bg-base-100 p-2.5 rounded-lg border border-base-300/60 opacity-90">
                      <span className="font-semibold text-primary">Context & Nuance: </span>
                      {translationResult.explanation}
                    </div>
                  )}

                  {translationResult.alternatives?.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-xs font-semibold opacity-70">Alternatives:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {translationResult.alternatives.map((alt, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleCopy(alt, `alt-${idx}`)}
                            className="badge badge-outline text-xs gap-1 py-2 cursor-pointer hover:badge-primary"
                          >
                            {alt}
                            {copiedKey === `alt-${idx}` ? (
                              <CheckIcon className="size-3 text-success" />
                            ) : (
                              <CopyIcon className="size-3" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </form>
          )}

          {/* TAB 2: GRAMMAR CHECK */}
          {activeTab === "grammar" && (
            <form onSubmit={handleGrammarCheck} className="space-y-4">
              <div className="flex items-center justify-between gap-2">
                <label className="text-xs font-semibold uppercase tracking-wider opacity-70">
                  Practicing Language
                </label>
                <select
                  value={grammarLang}
                  onChange={(e) => setGrammarLang(e.target.value)}
                  className="select select-bordered select-xs"
                >
                  {LANGUAGES.map((lang) => (
                    <option key={lang} value={lang}>
                      {lang}
                    </option>
                  ))}
                </select>
              </div>

              <textarea
                value={grammarText}
                onChange={(e) => setGrammarText(e.target.value)}
                placeholder="Draft your message here to inspect grammar and natural phrasing..."
                className="textarea textarea-bordered w-full h-24 text-sm"
              />

              <button
                type="submit"
                disabled={loading || !grammarText.trim()}
                className="btn btn-primary btn-sm w-full gap-2"
              >
                {loading ? (
                  <>
                    <Loader2Icon className="size-4 animate-spin" />
                    Checking Grammar...
                  </>
                ) : (
                  <>
                    <BookOpenIcon className="size-4" />
                    Inspect & Polish Phrasing
                  </>
                )}
              </button>

              {/* GRAMMAR RESULT CARD */}
              {grammarResult && (
                <div className="bg-base-200 p-4 rounded-xl space-y-3 border border-base-300">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`badge badge-sm font-semibold ${
                            grammarResult.hasErrors ? "badge-warning" : "badge-success"
                          }`}
                        >
                          {grammarResult.hasErrors ? "Suggested Improvements" : "Looks Great!"}
                        </span>
                      </div>
                      <p className="text-base font-semibold">{grammarResult.corrected}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(grammarResult.corrected, "grammar-main")}
                      className="btn btn-ghost btn-xs btn-square"
                      title="Copy corrected sentence"
                    >
                      {copiedKey === "grammar-main" ? (
                        <CheckIcon className="size-4 text-success" />
                      ) : (
                        <CopyIcon className="size-4" />
                      )}
                    </button>
                  </div>

                  {grammarResult.explanation && (
                    <div className="text-xs bg-base-100 p-2.5 rounded-lg border border-base-300/60 opacity-90">
                      <span className="font-semibold text-primary">Feedback: </span>
                      {grammarResult.explanation}
                    </div>
                  )}

                  {grammarResult.suggestions?.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-xs font-semibold opacity-70">Natural Alternatives:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {grammarResult.suggestions.map((sug, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleCopy(sug, `sug-${idx}`)}
                            className="badge badge-outline text-xs gap-1 py-2 cursor-pointer hover:badge-primary"
                          >
                            {sug}
                            {copiedKey === `sug-${idx}` ? (
                              <CheckIcon className="size-3 text-success" />
                            ) : (
                              <CopyIcon className="size-3" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </form>
          )}

          {/* TAB 3: ICEBREAKERS */}
          {activeTab === "icebreakers" && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold opacity-70">Target Language:</span>
                  <select
                    value={icebreakerLang}
                    onChange={(e) => setIcebreakerLang(e.target.value)}
                    className="select select-bordered select-xs"
                  >
                    {LANGUAGES.map((lang) => (
                      <option key={lang} value={lang}>
                        {lang}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={handleGenerateIcebreakers}
                  disabled={loading}
                  className="btn btn-primary btn-sm w-full sm:w-auto gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2Icon className="size-4 animate-spin" />
                      Generating Starters...
                    </>
                  ) : (
                    <>
                      <SparklesIcon className="size-4" />
                      Generate Conversation Prompts
                    </>
                  )}
                </button>
              </div>

              {!icebreakersResult && !loading && (
                <div className="text-center py-8 bg-base-200/50 rounded-xl border border-dashed border-base-300 p-6 space-y-2">
                  <LightbulbIcon className="size-8 mx-auto opacity-50 text-warning" />
                  <p className="font-semibold text-sm">Need ideas to start chatting?</p>
                  <p className="text-xs opacity-70 max-w-sm mx-auto">
                    Click the button above to generate 4 culturally rich conversation prompts tailored
                    for {icebreakerLang} practice!
                  </p>
                </div>
              )}

              {icebreakersResult?.icebreakers && (
                <div className="space-y-3">
                  {icebreakersResult.icebreakers.map((item, index) => (
                    <div
                      key={index}
                      className="bg-base-200 p-3.5 rounded-xl border border-base-300 space-y-2 hover:border-primary/40 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="badge badge-sm badge-secondary font-semibold">
                          {item.topic}
                        </span>
                        <button
                          onClick={() => handleCopy(item.prompt, `ice-${index}`)}
                          className="btn btn-ghost btn-xs gap-1 text-xs"
                        >
                          {copiedKey === `ice-${index}` ? (
                            <>
                              <CheckCircle2Icon className="size-3.5 text-success" />
                              Copied
                            </>
                          ) : (
                            <>
                              <CopyIcon className="size-3.5" />
                              Copy Prompt
                            </>
                          )}
                        </button>
                      </div>

                      <p className="text-sm font-bold text-base-content leading-snug">
                        {item.prompt}
                      </p>
                      <p className="text-xs opacity-70">{item.translation}</p>

                      {item.tip && (
                        <div className="text-xs bg-base-100 p-2 rounded-lg opacity-85 flex items-start gap-1.5 border border-base-300/60">
                          <HelpCircleIcon className="size-3.5 text-info shrink-0 mt-0.5" />
                          <span>{item.tip}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AiAssistantModal;
