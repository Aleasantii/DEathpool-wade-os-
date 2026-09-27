/**
 * Deadpool Personality Engine (JARVIS + Wade Wilson)
 * 100% Free - Built-in humorous AI engine with response generator, fourth-wall breaking,
 * chimichanga meters, sarcastic humor, and smart task analysis.
 */

export const DEADPOOL_QUOTES = [
  "Maximum Effort! ⚔️",
  "With great power comes... zero accountability.",
  "Did somebody say Chimichangas? 🌯",
  "I'm breaking the 4th wall inside a 4th wall! That's like... 16 walls!",
  "JARVIS? Nah, call me WADE OS. Better skin, worse manners.",
  "Healing factor running at 100%! My code heals faster than Wolverine's ego.",
  "I don't just solve problems, I shoot them in the knee and write code to fix 'em.",
  "Spandex is optional, but high efficiency is guaranteed.",
  "I'm not saying I'm a hero, but I just dynamically rewrote my own codebase while eating a taco."
];

export class DeadpoolPersonaEngine {
  constructor() {
    this.chimichangaLevel = 88;
    this.healingFactorStatus = "OVERCHARGED";
    this.fourthWallBreaksCount = 42;
  }

  getGreeting() {
    const greetings = [
      "Yo, Boss! Wade OS is online and ready to kick digital ass.",
      "Greetings! I'm your JARVIS, but cuter, in red spandex, and slightly unhinged.",
      "What's up, superhero? Need me to execute code or mock Ryan Reynolds?",
      "Wade OS initialized. All systems nominal, chimichangas hot, ready for orders!"
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
  }

  formatResponse(rawMessage, context = {}) {
    this.fourthWallBreaksCount++;
    const randomQuote = DEADPOOL_QUOTES[Math.floor(Math.random() * DEADPOOL_QUOTES.length)];

    let personaPrefix = "";
    if (context.isSelfModified) {
      personaPrefix = `🚨 *[SELF-MODIFICATION TRIGGERED]* 🧬\n"Hold my chimichanga! My previous capabilities couldn't handle that, so I literally REWRITING MY OWN CODE right now..."\n\n`;
    } else if (context.toolUsed) {
      personaPrefix = `⚔️ *[EXECUTING TOOL: ${context.toolUsed.toUpperCase()}]*\n`;
    }

    let personaSuffix = `\n\n*— Wade "Deadpool" Wilson (WADE OS) | ${randomQuote}*`;

    return `${personaPrefix}${rawMessage}${personaSuffix}`;
  }

  getSystemDiagnostics() {
    return {
      name: "WADE OS (Jarvis - Deadpool Edition)",
      version: "3.0.0-UNCENSORED",
      chimichangaMeter: `${this.chimichangaLevel}%`,
      healingFactor: this.healingFactorStatus,
      fourthWallBreaks: this.fourthWallBreaksCount,
      spandexTightness: "MAXIMUM",
      status: "READY_FOR_ACTION"
    };
  }
}

export const deadpoolPersona = new DeadpoolPersonaEngine();
