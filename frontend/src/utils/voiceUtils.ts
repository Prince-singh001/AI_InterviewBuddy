/**
 * Deterministic Voice Selection & Speech Utilities
 * Guarantees consistent Male vs Female voice selection for AI Interviewers (Jenny & Samm).
 */

const FEMALE_NAMES = [
  "zira",
  "jenny",
  "samantha",
  "victoria",
  "hazel",
  "susan",
  "heera",
  "karen",
  "moira",
  "fiona",
  "tessa",
  "female",
  "woman",
  "google us english",
  "google uk english female",
  "eva",
  "aria",
];

const MALE_NAMES = [
  "david",
  "mark",
  "george",
  "ravi",
  "samm",
  "sam",
  "alex",
  "daniel",
  "fred",
  "oliver",
  "arthur",
  "guy",
  "male",
  "man",
  "google uk english male",
  "ryan",
  "guy",
];

export interface VoiceProfile {
  voice: SpeechSynthesisVoice | null;
  pitch: number;
  rate: number;
  gender: "male" | "female";
  voiceName: string;
}

/**
 * Loads available browser voices reliably, waiting for `voiceschanged` if necessary.
 */
export function getBrowserVoices(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      resolve([]);
      return;
    }

    const immediate = window.speechSynthesis.getVoices();
    if (immediate && immediate.length > 0) {
      resolve(immediate);
      return;
    }

    let resolved = false;

    const handleVoicesChanged = () => {
      if (resolved) return;
      resolved = true;
      try {
        window.speechSynthesis.removeEventListener(
          "voiceschanged",
          handleVoicesChanged,
        );
      } catch {
        // Safe fallback
      }
      resolve(window.speechSynthesis.getVoices());
    };

    window.speechSynthesis.addEventListener("voiceschanged", handleVoicesChanged);

    // Timeout safety in case event never fires
    setTimeout(() => {
      if (resolved) return;
      resolved = true;
      resolve(window.speechSynthesis.getVoices());
    }, 600);
  });
}

/**
 * Deterministically finds the best voice for the chosen gender and language.
 */
export async function resolveVoiceProfile(
  gender: "male" | "female",
  preferredLang: string = "en",
): Promise<VoiceProfile> {
  const voices = await getBrowserVoices();
  const langPrefix = preferredLang.toLowerCase().split("-")[0] || "en";

  // Filter voices by language first
  const langVoices = voices.filter(
    (v) =>
      v.lang.toLowerCase().startsWith(langPrefix) ||
      v.lang.toLowerCase().startsWith("en"),
  );

  const pool = langVoices.length > 0 ? langVoices : voices;

  let chosenVoice: SpeechSynthesisVoice | null = null;

  if (gender === "female") {
    // 1. Explicitly check for preferred deterministic profile: Microsoft Heera (India)
    chosenVoice =
      voices.find((v) => {
        const name = v.name.toLowerCase();
        return name.includes("heera") || name.includes("microsoft heera");
      }) || null;

    // 2. Look for female match in lang
    if (!chosenVoice) {
      chosenVoice =
        pool.find((v) => {
          const name = v.name.toLowerCase();
          const isExcluded = MALE_NAMES.some((m) => name.includes(m));
          if (isExcluded) return false;
          return FEMALE_NAMES.some((f) => name.includes(f));
        }) || null;
    }

    // 3. Fallback to any voice with 'female' or 'woman' in global list
    if (!chosenVoice) {
      chosenVoice =
        voices.find((v) => {
          const name = v.name.toLowerCase();
          return (
            (name.includes("female") || name.includes("woman") || name.includes("zira") || name.includes("samantha")) &&
            !MALE_NAMES.some((m) => name.includes(m))
          );
        }) || null;
    }

    // 4. Fallback: select first non-male voice in language
    if (!chosenVoice) {
      chosenVoice =
        pool.find((v) => {
          const name = v.name.toLowerCase();
          return !MALE_NAMES.some((m) => name.includes(m));
        }) || pool[0] || null;
    }

    return {
      voice: chosenVoice,
      pitch: 1.08, // Subtle pitch lift for feminine resonance
      rate: 0.96,  // Clear, composed interview pace
      gender: "female",
      voiceName: chosenVoice ? chosenVoice.name : "Microsoft Heera (Default Female)",
    };
  } else {
    // 1. Explicitly check for preferred deterministic profile: Microsoft David (US)
    chosenVoice =
      voices.find((v) => {
        const name = v.name.toLowerCase();
        return name.includes("david") || name.includes("microsoft david");
      }) || null;

    // 2. Look for explicit male match in lang
    if (!chosenVoice) {
      chosenVoice =
        pool.find((v) => {
          const name = v.name.toLowerCase();
          const isExcluded = FEMALE_NAMES.some((f) => name.includes(f));
          if (isExcluded) return false;
          return MALE_NAMES.some((m) => name.includes(m));
        }) || null;
    }

    // 3. Fallback to any voice with 'male' or known male names in global list
    if (!chosenVoice) {
      chosenVoice =
        voices.find((v) => {
          const name = v.name.toLowerCase();
          return (
            (name.includes("male") || name.includes("david") || name.includes("mark") || name.includes("george")) &&
            !FEMALE_NAMES.some((f) => name.includes(f))
          );
        }) || null;
    }

    // 4. Fallback: select first non-female voice in language
    if (!chosenVoice) {
      chosenVoice =
        pool.find((v) => {
          const name = v.name.toLowerCase();
          return !FEMALE_NAMES.some((f) => name.includes(f));
        }) || pool[0] || null;
    }

    return {
      voice: chosenVoice,
      pitch: 0.90, // Deeper masculine resonance
      rate: 0.94,  // Measured, professional technical interviewer pace
      gender: "male",
      voiceName: chosenVoice ? chosenVoice.name : "Default Male Profile",
    };
  }
}
