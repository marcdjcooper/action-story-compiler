(function (root, factory) {
  const data = typeof module === "object" && module.exports
    ? require("./compiler-data.js")
    : root.ActionCompilerData;
  const api = factory(data);
  if (typeof module === "object" && module.exports) module.exports = api;
  root.ActionCompiler = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function (data) {
  "use strict";

  if (!data) throw new Error("Action Compiler data did not load.");

  const { FORM_PROFILES, FAMILY_QUESTIONS, EXAMPLES, ASM_PROVENANCE } = data;
  const PROFILE_BY_ID = Object.fromEntries(FORM_PROFILES.map((profile) => [profile.id, profile]));

  const HERO_POWER = ["operational", "strained", "reduced", "minimal", "minimal"];
  const OPPOSITION_POWER = ["advantaged", "expanded", "dominant", "maximum", "maximum"];
  const VICTIM_RISK = ["exposed", "immediate", "critical", "terminal", "terminal"];
  const LETHAL_PATTERN = /\b(die|dies|death|dead|killed?|suffocat\w*|extinct\w*|annihilat\w*|cease to exist|fatal|lethal|destroy(?:ed|s)?|perish(?:es)?|mass casualty|will be lost)\b/i;
  const PRECISE_TIME_PATTERN = /\b(?:in|within|at|by|before)\s+(?:\d+|one|two|three|four|five|ten|twenty|thirty|sixty|ninety|midnight|noon)\s*(?:seconds?|minutes?|hours?|o'clock)?\b/i;

  function hasPreciseLimit(text) {
    return PRECISE_TIME_PATTERN.test(text) || /\bprecise\s+(?:countdown|time limit|limit)\b/i.test(text);
  }

  function normalize(text) {
    return String(text || "").replace(/\s+/g, " ").trim();
  }

  function hashText(text) {
    let hash = 2166136261;
    for (let index = 0; index < text.length; index += 1) {
      hash ^= text.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
  }

  function sentenceCase(text) {
    const value = normalize(text).replace(/[.;,]+$/, "");
    return value ? value.charAt(0).toUpperCase() + value.slice(1) : value;
  }

  function includesTerm(text, term) {
    const escaped = term.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return new RegExp(`\\b${escaped}\\b`).test(text);
  }

  function evidenceFor(profile, lowerText) {
    const collect = (terms) => terms.filter((term) => includesTerm(lowerText, term));
    const evidence = {
      role: collect(profile.roleTerms),
      imbalance: collect(profile.imbalanceTerms),
      state: collect(profile.stateTerms),
      closure: collect(profile.closureTerms)
    };

    if (profile.id === "deadline" && hasPreciseLimit(lowerText) && !evidence.role.length) {
      evidence.role.push((lowerText.match(PRECISE_TIME_PATTERN) || ["precise countdown"])[0]);
    }
    if (profile.id === "deadline") {
      const villainMarker = /\b(?:villain|saboteur|authority|controller|attackers?|regime)\b/.test(lowerText);
      const weaponMarker = /\b(?:sets?|gives?|detonates?|countdown|timed|final trigger)\b/.test(lowerText);
      if (!(villainMarker && weaponMarker)) {
        const bareClockEvidence = evidence.role.filter((term) => PRECISE_TIME_PATTERN.test(term));
        evidence.role = evidence.role.filter((term) => !PRECISE_TIME_PATTERN.test(term));
        evidence.state.push(...bareClockEvidence);
      }
    }
    if (profile.id === "savior" && /\b(?:people|passengers|crew|prisoners|evacuees|public)\b/.test(lowerText)) {
      evidence.closure.push("collective lives");
    }
    if (profile.id === "rebellion" && /\b(?:authority|command|regime|institution)\b/.test(lowerText) && /\b(?:orders?|locks?|controls?|executes?)\b/.test(lowerText)) {
      evidence.role.push("institutional authority enforces the lethal act");
    }
    if (profile.id === "unraveling" && /\b(?:history|timeline|past|future|descendant)\w*\b/.test(lowerText) && /\b(?:erase|restore|unravel|cease)\w*\b/.test(lowerText)) {
      evidence.role.push("damaged downstream continuity");
    }
    if (profile.id === "holdout" && /\b(?:until|through)\b/.test(lowerText) && /\b(?:supplies|power|water|medicine|ammunition|oxygen)\b/.test(lowerText)) {
      evidence.imbalance.push("prolonged time consumes finite capacity");
    }
    return evidence;
  }

  function candidateForms(premise) {
    const lowerText = normalize(premise).toLowerCase();
    const candidates = FORM_PROFILES.map((profile, sourceOrder) => {
      const evidence = evidenceFor(profile, lowerText);
      const totalEvidence = Object.values(evidence).reduce((sum, values) => sum + values.length, 0);
      return {
        id: profile.id,
        label: profile.label,
        family: profile.family,
        identity: profile.identity,
        familyQuestion: FAMILY_QUESTIONS[profile.family],
        evidence,
        totalEvidence,
        sourceOrder
      };
    }).filter((candidate) => candidate.totalEvidence > 0);

    if (!candidates.length && LETHAL_PATTERN.test(lowerText)) {
      const fallback = PROFILE_BY_ID.savior;
      candidates.push({
        id: fallback.id,
        label: fallback.label,
        family: fallback.family,
        identity: fallback.identity,
        familyQuestion: FAMILY_QUESTIONS[fallback.family],
        evidence: { role: [], imbalance: [], state: [], closure: ["unclassified collective Life/Death threat"] },
        totalEvidence: 1,
        sourceOrder: FORM_PROFILES.indexOf(fallback),
        fallback: true
      });
    }
    return candidates;
  }

  function compareByDominance(left, right) {
    for (const key of ["role", "imbalance", "state", "closure"]) {
      const difference = right.evidence[key].length - left.evidence[key].length;
      if (difference) return difference;
    }
    return left.sourceOrder - right.sourceOrder;
  }

  function selectDominant(candidates) {
    if (!candidates.length) return { dominant: null, secondary: null, reason: "No Action-form discriminator was found." };
    const ordered = [...candidates].sort(compareByDominance);
    const dominant = ordered[0];
    const secondary = ordered[1] && ordered[1].evidence.role.length > 0 ? ordered[1] : null;
    let decidingKey = "closure";
    if (dominant.evidence.role.length) decidingKey = "role";
    else if (dominant.evidence.imbalance.length) decidingKey = "imbalance";
    else if (dominant.evidence.state.length) decidingKey = "state";
    const reasonMap = {
      role: "most directly defines villain, victim, or weapon in the Life/Death problem",
      imbalance: "most directly explains the Tactical Imbalance",
      state: "supplies the form-specific state that progression must change",
      closure: "most directly defines what exact-objective closure requires"
    };
    return {
      dominant,
      secondary,
      reason: `${dominant.label} ${reasonMap[decidingKey]}. Removing its ${dominant.identity} mechanism collapses the causal spine.`
    };
  }

  function extractHero(premise) {
    const match = premise.match(/^(?:when\s+)?(?:a|an|the)\s+(.+?)\s+must\b/i);
    if (match) return sentenceCase(match[1]);
    const mustIndex = premise.toLowerCase().indexOf(" must ");
    if (mustIndex > 0) return sentenceCase(premise.slice(0, mustIndex).replace(/^(?:a|an|the)\s+/i, ""));
    return "Unspecified hero";
  }

  function extractObjective(premise) {
    const lower = premise.toLowerCase();
    const marker = lower.indexOf(" must ");
    if (marker < 0) return "Unspecified exact objective";
    const start = marker + 6;
    const remainder = premise.slice(start);
    const boundary = remainder.search(/(?:,?\s+while\b|,?\s+because\b|,?\s+otherwise\b|,?\s+or\s+(?:both|the|they|everyone|hundreds|all|every)\b|;)/i);
    return sentenceCase(boundary >= 0 ? remainder.slice(0, boundary) : remainder);
  }

  function extractVictim(premise) {
    const patterns = [
      /\binjured\s+(?:[a-z-]+\s+){0,2}(?:diver|evacuees|crew|people|pilot|researcher|miners|guide|child)\b/i,
      /\b(?:evacuation convoy|passengers|prisoners|evacuees|descendants|civilians|population|community|crew|victim|hostages|city|society|ecosystem|species|public)\b/i
    ];
    for (const pattern of patterns) {
      const match = premise.match(pattern);
      if (match) return match[0].toLowerCase();
    }
    return "the people whose lives depend on the objective";
  }

  function extractOpposition(premise, profile) {
    const patterns = [
      /\b(?:an?\s+)?intelligent shark\b/i,
      /\b(?:the\s+)?rail authority\b/i,
      /\b(?:a\s+)?saboteur\b/i,
      /\battackers\b/i,
      /\b(?:the\s+)?(?:corrupt regime|hidden controller|predator|monster|beast|villain|pursuer|conspiracy|authority|storm|avalanche|wildfire|flood)\b/i
    ];
    for (const pattern of patterns) {
      const match = premise.match(pattern);
      if (match) return match[0].replace(/^(?:a|an|the)\s+/i, "").toLowerCase();
    }
    return profile ? profile.oppositionRole : "unspecified opposition";
  }

  function extractWorld(premise) {
    const known = premise.match(/\b(?:flooded docks|harbor|sealed tunnel|mountain rail compound|town|city|station|fortress|hospital|desert|colony|ship|aircraft|jungle|island|mine|labyrinth|timeline)\b/i);
    if (known) return known[0].toLowerCase();
    const match = premise.match(/\b(?:inside|aboard|across|through|in)\s+([^,;.]+?)(?=\s+(?:while|before|after|or)\b|[,;.])/i);
    return match ? normalize(match[1]).toLowerCase() : "the premise's physical domain";
  }

  function inferMeans(hero) {
    const lower = hero.toLowerCase();
    if (/engineer|mechanic|technician/.test(lower)) return "technical tools and systems knowledge";
    if (/biologist|ranger|keeper/.test(lower)) return "field knowledge and rescue gear";
    if (/investigator|detective|agent/.test(lower)) return "investigative equipment and causal records";
    if (/pilot|driver|rider/.test(lower)) return "vehicle control and route knowledge";
    if (/soldier|guard|marshal|fighter/.test(lower)) return "tactical training and carried equipment";
    return "practical tools and domain expertise";
  }

  function extractStakes(premise) {
    const clauses = premise.split(/[.;]/).map(normalize).filter(Boolean);
    const clause = clauses.find((item) => LETHAL_PATTERN.test(item));
    return clause ? sentenceCase(clause) : "No literal Life/Death consequence stated";
  }

  function interpolate(template, context) {
    return template.replace(/\{(\w+)\}/g, (_, key) => context[key] || `{${key}}`);
  }

  function isStructuredAsmSeed(seed) {
    return !!(seed && seed.source === "ASM v2.0" && seed.form && seed.world && seed.protagonist && seed.objective && seed.opposition && seed.means && seed.pressure && seed.counter && seed.solution);
  }

  function buildActionContract(premise, selection, asmSeed) {
    const profile = selection.dominant ? PROFILE_BY_ID[selection.dominant.id] : null;
    const structured = isStructuredAsmSeed(asmSeed);
    const hero = structured ? sentenceCase(asmSeed.protagonist.label) : extractHero(premise);
    const exactObjective = structured ? sentenceCase(asmSeed.objective.label) : extractObjective(premise);
    const victim = extractVictim(premise);
    const opposition = structured ? asmSeed.oppositionDisplay : extractOpposition(premise, profile);
    const world = structured ? asmSeed.world.label : extractWorld(premise);
    const means = structured ? asmSeed.means.label : inferMeans(hero);
    const literalStakes = extractStakes(premise);
    const viable = hero !== "Unspecified hero" && exactObjective !== "Unspecified exact objective" && LETHAL_PATTERN.test(premise) && !!profile;
    return {
      recordType: "Action Contract",
      premise,
      viablePremise: viable,
      hero,
      heroFunction: "altruistic actor who must risk life for another",
      victim,
      victimFunction: "cannot complete the rescue without the hero",
      opposition,
      villainFunction: profile ? profile.identity : "unclassified",
      exactObjective,
      literalStakes,
      world,
      initialMeans: means,
      authoredSource: structured ? "ASM v2.0 structured seed" : "Premise parser",
      dominantForm: profile ? profile.label : "Unclassified",
      secondaryForm: selection.secondary ? selection.secondary.label : null
    };
  }

  function buildOppositionProgram(contract, profile, asmSeed) {
    const structured = isStructuredAsmSeed(asmSeed);
    const primaryTactic = structured
      ? `use ${asmSeed.means.label} through its ${asmSeed.counter.strength.toLowerCase().replaceAll("_", " ")} advantage`
      : profile.heroTactic;
    const immunity = structured ? asmSeed.counter.text : profile.immunity;
    const tacticalImbalance = {
      heroPrimaryTactic: primaryTactic,
      oppositionImmunity: immunity,
      heroMissingDefense: profile.vulnerability,
      statement: `${sentenceCase(contract.opposition)} is immune to the hero's attempt to ${primaryTactic}; the hero has no defense when ${profile.vulnerability}.`
    };
    return {
      recordType: "Opposition Program",
      identity: contract.opposition,
      role: profile.oppositionRole,
      lethalObjective: `${sentenceCase(contract.opposition)} intends to make the stated lethal consequence inevitable by preventing: ${contract.exactObjective}.`,
      primaryStrategy: structured ? asmSeed.oppositionSetup : profile.strategy,
      stableCapabilityRule: immunity,
      responseRule: "Respond causally to each hero tactic without introducing a new capability.",
      authoredCounter: structured ? { strength: asmSeed.counter.strength, source: "ASM v2.0 opposition counter" } : null,
      tacticalImbalance
    };
  }

  function buildContext(contract, profile, resource) {
    return {
      hero: contract.hero.toLowerCase(),
      victim: contract.victim,
      opposition: contract.opposition,
      objective: contract.exactObjective.toLowerCase(),
      means: contract.initialMeans,
      world: contract.world,
      resource
    };
  }

  function buildProgression(contract, oppositionProgram, profile, asmSeed) {
    const structured = isStructuredAsmSeed(asmSeed);
    const authoredResource = structured ? asmSeed.solution.resource : profile.resource;
    const context = buildContext(contract, profile, authoredResource);
    const cycleTarget = 3 + (hashText(contract.premise) % 2);
    const chosenMoves = profile.moves.slice(0, cycleTarget);
    const effectiveMoves = chosenMoves.map((move, index) => {
      if (!structured) return move;
      const next = [...move];
      if (index === 0) {
        next[0] = "authored primary means";
        next[1] = `uses ${asmSeed.means.label} as the direct solution to ${contract.exactObjective.toLowerCase()}`;
        next[2] = asmSeed.counter.text;
        next[3] = asmSeed.means.failure || next[3];
        next[4] = `the opposition specifically counters ${asmSeed.counter.strength.toLowerCase().replaceAll("_", " ")}`;
      } else if (index === 1) {
        next[0] = "authored tactical adaptation";
        next[1] = asmSeed.solution.adapt;
        next[2] = asmSeed.opposition.adaptation || next[2];
        next[4] = `${authoredResource} is physically established as the alternate route to the objective`;
      } else if (index === 2) {
        next[0] = "authored escalation response";
        next[2] = asmSeed.solution.escalation;
        next[4] = `the escalation leaves ${authoredResource} as the final established endgame resource`;
      }
      return next;
    });
    const facts = [];
    const resources = [{ name: contract.initialMeans, provenance: "Action Contract", status: "available" }];
    const ledger = [{
      sequence: 0,
      stage: "CONTRACT",
      heroPower: HERO_POWER[0],
      oppositionAdvantage: OPPOSITION_POWER[0],
      victimRisk: VICTIM_RISK[0],
      axis: profile.axis,
      mutation: `Exact objective locked: ${contract.exactObjective}.`,
      factsAdded: [`${contract.opposition} causes the literal Life/Death problem`],
      resourcesAdded: [contract.initialMeans],
      resourcesLost: []
    }];

    const cycles = effectiveMoves.map((move, index) => {
      const [tacticFamily, tactic, response, consequence, fact] = move;
      const establishedFact = interpolate(fact, context);
      facts.push(establishedFact);
      const resourceIntroduced = index === 1 ? authoredResource : null;
      if (resourceIntroduced) resources.push({ name: resourceIntroduced, provenance: `Progression Cycle ${index + 1}`, status: "available" });
      const resourceLost = index === 2 ? contract.initialMeans : null;
      if (resourceLost) resources[0].status = "exhausted";
      const changedState = interpolate(consequence, context);
      const cycle = {
        recordType: "Progression Cycle",
        cycle: index + 1,
        tacticFamily,
        heroTactic: interpolate(tactic, context),
        oppositionId: oppositionProgram.identity,
        oppositionResponse: interpolate(response, context),
        consequence: changedState,
        changedState: {
          axis: profile.axis,
          from: index === 0 ? "initial imbalance" : cyclesStateLabel(index - 1),
          to: cyclesStateLabel(index),
          factEstablished: establishedFact,
          resourceIntroduced,
          resourceLost
        },
        nextTactic: effectiveMoves[index + 1] ? interpolate(effectiveMoves[index + 1][1], context) : "enter Crisis with ordinary tactics exhausted"
      };
      ledger.push({
        sequence: ledger.length,
        stage: `CYCLE ${index + 1}`,
        heroPower: HERO_POWER[index + 1],
        oppositionAdvantage: OPPOSITION_POWER[index + 1],
        victimRisk: VICTIM_RISK[index + 1],
        axis: profile.axis,
        mutation: changedState,
        factsAdded: [establishedFact],
        resourcesAdded: resourceIntroduced ? [resourceIntroduced] : [],
        resourcesLost: resourceLost ? [resourceLost] : []
      });
      return cycle;
    });

    return { cycles, ledger, facts, resources, endgameResource: authoredResource, authoredSolution: structured ? asmSeed.solution : null };
  }

  function cyclesStateLabel(index) {
    return ["primary tactic defeated", "alternate route established", "ordinary power stripped", "irreversible final position"][index] || "changed causal state";
  }

  function buildEndgame(contract, oppositionProgram, profile, progression) {
    const resourceName = progression.endgameResource;
    const resource = progression.resources.find((item) => item.name === resourceName);
    const sourceCycle = resource ? resource.provenance : "not established";
    const causalFact = progression.facts.find((fact) => fact.includes(resourceName)) || progression.facts[progression.facts.length - 1];
    const matchedEnd = progression.authoredSolution ? sentenceCase(progression.authoredSolution.end) : null;
    const crisis = {
      ultimateChoice: `${contract.hero} can preserve personal survival by abandoning ${contract.victim}, or accept near-certain death and continue the exact objective: ${contract.exactObjective}.`,
      decision: `${contract.hero} chooses the objective and the victim over personal survival.`,
      maximumPressure: true,
      personalEscapeRejected: true
    };
    const mercy = {
      condition: `${sentenceCase(contract.opposition)} now has maximum effective advantage. ${contract.hero} has minimum effective power, no ordinary tactic left, and remains physically committed to ${contract.victim}.`,
      oppositionAdvantage: "maximum",
      heroPower: "minimal",
      ordinaryTacticsExhausted: true,
      distinctFromCrisis: "The choice has already been made; this is the resulting state of helpless confrontation."
    };
    const reversal = {
      establishedCause: causalFact,
      resource: resourceName,
      resourceProvenance: sourceCycle,
      action: matchedEnd
        ? `Because ${causalFact}, ${contract.hero.toLowerCase()} uses ${resourceName} to execute the matched physical reversal: ${matchedEnd}.`
        : `Because ${causalFact}, ${contract.hero.toLowerCase()} uses ${resourceName} to turn the opposition's established strategy against its own final commitment.`,
      matchedSolutionId: progression.authoredSolution ? progression.authoredSolution.id : null,
      earned: !!resource && progression.ledger.some((entry) => entry.factsAdded.includes(causalFact))
    };
    const climax = {
      action: matchedEnd
        ? `${contract.hero} uses ${resourceName}: ${matchedEnd}. This resolves the locked objective: ${contract.exactObjective}.`
        : `${contract.hero} completes the reversal through ${resourceName} and resolves the locked objective: ${contract.exactObjective}.`,
      exactObjective: contract.exactObjective,
      exactObjectiveResolved: true,
      victimOutcome: `${sentenceCase(contract.victim)} survive the lethal program.`,
      oppositionOutcome: `${sentenceCase(contract.opposition)} can no longer cause the contract's lethal consequence.`,
      closureState: `COMPLETE: ${contract.exactObjective}`
    };

    const ledger = progression.ledger;
    ledger.push({ sequence: ledger.length, stage: "CRISIS", heroPower: "minimal", oppositionAdvantage: "maximum", victimRisk: "terminal", axis: profile.axis, mutation: crisis.decision, factsAdded: ["hero rejects personal survival"], resourcesAdded: [], resourcesLost: [] });
    ledger.push({ sequence: ledger.length, stage: "MERCY", heroPower: "minimal", oppositionAdvantage: "maximum", victimRisk: "terminal", axis: profile.axis, mutation: mercy.condition, factsAdded: ["ordinary tactics exhausted"], resourcesAdded: [], resourcesLost: [] });
    ledger.push({ sequence: ledger.length, stage: "REVERSAL", heroPower: "converted established cause", oppositionAdvantage: "broken by own commitment", victimRisk: "falling", axis: profile.axis, mutation: reversal.action, factsAdded: ["earned reversal executed"], resourcesAdded: [], resourcesLost: [] });
    ledger.push({ sequence: ledger.length, stage: "CLIMAX", heroPower: "objective-capable", oppositionAdvantage: "ended", victimRisk: "resolved", axis: profile.axis, mutation: climax.closureState, factsAdded: ["exact objective resolved"], resourcesAdded: [], resourcesLost: [] });
    return { recordType: "Endgame Plan", crisis, mercy, reversal, climax };
  }

  function formHookState(profile, contract, premise, cycles) {
    const lower = premise.toLowerCase();
    const state = {};
    Object.keys(profile.hooks).forEach((key) => { state[key] = true; });
    if (profile.id === "deadline") {
      const villainMarker = /\b(?:villain|saboteur|authority|controller|attackers?|regime)\b/.test(lower);
      const weaponMarker = /\b(?:sets?|gives?|detonates?|locks?|countdown|timed|execution train|final trigger)\b/.test(lower);
      state.villainSetPreciseLimit = hasPreciseLimit(lower) && villainMarker && weaponMarker;
      state.expiryConsequence = LETHAL_PATTERN.test(lower);
      state.choiceCompression = hasPreciseLimit(lower);
      state.clockIntegrity = cycles.every((cycle) => /clock|timer|time|retry|timed|interval|expiry/i.test(`${cycle.oppositionResponse} ${cycle.consequence} ${cycle.changedState.factEstablished}`));
    }
    if (profile.id === "vigilante") {
      state.lawfulAttempt = /\b(?:law|legal|authority|badge|police|official)\b/.test(lower);
      state.authorityImmunity = /\b(?:immune|cannot touch|protected|fails?|revoked)\b/.test(lower);
      state.extraLegalCrossing = /\b(?:outside the law|breaks? the law|vigilante|turns? in the badge|extra-legal)\b/.test(lower);
    }
    if (profile.id === "collision") {
      state.credibleLethalMotivation = LETHAL_PATTERN.test(lower);
      state.nonStaticPower = new Set(cycles.map((cycle) => cycle.changedState.to)).size === cycles.length;
    }
    if (profile.id === "holdout") {
      state.prolongedLethalCondition = /\b(?:hold|siege|until|prolonged|endure|hours?)\b/.test(lower);
      state.dwindlingCapacity = /\b(?:dwindling|ration|running out|drain|supplies|power|water|medicine|ammunition|oxygen)\b/.test(lower);
      state.causalAttrition = cycles.some((cycle) => /consum|fall|lost|exhaust|attrition/i.test(`${cycle.consequence} ${cycle.changedState.factEstablished}`));
    }
    if (profile.id === "unraveling") {
      state.causalDamage = /\b(?:erase|damage|unravel|remove|destroy)\w*\b/.test(lower);
      state.downstreamContinuity = /\b(?:present|future|descendant|history|timeline|continuity)\w*\b/.test(lower);
    }
    return state;
  }

  function check(id, label, stage, classification, pass, detail) {
    return { id, label, stage, classification, pass: !!pass, detail };
  }

  function validateCompilation(compilation, profile, premise) {
    const { actionContract: contract, oppositionProgram, progressionCycles: cycles, causalLedger: ledger, endgamePlan } = compilation;
    const tacticFamilies = cycles.map((cycle) => cycle.tacticFamily);
    const progressionLedgerEntries = ledger.filter((entry) => entry.stage.startsWith("CYCLE"));
    const ledgerFacts = ledger.flatMap((entry) => entry.factsAdded);
    const knownResources = progressionLedgerEntries.flatMap((entry) => entry.resourcesAdded).concat(ledger[0].resourcesAdded);
    const hookState = formHookState(profile, contract, premise, cycles);
    const checks = [
      check("viable-premise", "Viable premise", "INPUT", "bad input/content", contract.viablePremise, "State a hero who must complete an exact objective against literal lethal opposition."),
      check("life-death", "Literal Life / Death", "ACTION CONTRACT", "bad input/content", LETHAL_PATTERN.test(contract.literalStakes), "The stakes must state literal death, extinction, or equivalent loss of life."),
      check("cast", "Hero / Villain / Victim functions", "ACTION CONTRACT", "bad input/content", contract.hero !== "Unspecified hero" && contract.victim && contract.opposition !== "unspecified opposition", "All three Action functions must be constructible, even if roles merge."),
      check("form", "Dominant form discriminator", "FORM SELECTOR", "wrong form classification", !!compilation.formSelection.dominant && !compilation.formSelection.dominant.fallback, "The dominant form must follow a canonical family discriminator."),
      check("opposition-causality", "Opposition causality", "OPPOSITION PROGRAM", "causal progression failure", oppositionProgram.primaryStrategy && cycles.every((cycle) => cycle.oppositionResponse), "Opposition must cause the lethal problem and respond to every tactic."),
      check("tactical-imbalance", "Specific Tactical Imbalance", "OPPOSITION PROGRAM", "weak authored counter", oppositionProgram.tacticalImbalance.heroPrimaryTactic && oppositionProgram.tacticalImbalance.oppositionImmunity && oppositionProgram.tacticalImbalance.heroMissingDefense, "Immunity and missing defense must be specific."),
      check("progression", "Progression, not repetition", "PROGRESSION CYCLE 1", "causal progression failure", cycles.length >= 3 && new Set(tacticFamilies).size === tacticFamilies.length, "Each cycle needs a genuinely different tactic family."),
      check("changed-state", "Changed state in every cycle", "PROGRESSION CYCLES", "causal progression failure", cycles.every((cycle) => cycle.changedState.from !== cycle.changedState.to && cycle.changedState.factEstablished), "Every cycle must mutate a significant fact."),
      check("ledger", "Ledger updated and consulted", "CAUSAL LEDGER", "validator failure", progressionLedgerEntries.length === cycles.length && cycles.every((cycle) => ledgerFacts.includes(cycle.changedState.factEstablished)), "Every progression fact must be recorded once in the ledger."),
      check("opposition-consistency", "Opposition consistency", "PROGRESSION CYCLES", "causal progression failure", cycles.every((cycle) => cycle.oppositionId === oppositionProgram.identity), "No arbitrary new opposition identity or capability may appear."),
      check("crisis", "Crisis is ultimate choice", "CRISIS", "endgame failure", endgamePlan.crisis.maximumPressure && endgamePlan.crisis.personalEscapeRejected && endgamePlan.crisis.ultimateChoice.includes(contract.exactObjective), "Crisis must test altruism under maximum pressure."),
      check("mercy", "Mercy state", "MERCY", "endgame failure", endgamePlan.mercy.oppositionAdvantage === "maximum" && endgamePlan.mercy.heroPower === "minimal" && endgamePlan.mercy.ordinaryTacticsExhausted, "Mercy requires maximum opposition, minimum hero power, and exhausted ordinary tactics."),
      check("earned-reversal", "Earned reversal", "REVERSAL", "endgame failure", endgamePlan.reversal.earned && ledgerFacts.includes(endgamePlan.reversal.establishedCause), "Reversal must execute an established cause from the ledger."),
      check("resource-provenance", "Resource provenance", "REVERSAL", "endgame failure", knownResources.includes(endgamePlan.reversal.resource) && /^Progression Cycle \d+$/.test(endgamePlan.reversal.resourceProvenance), "Every late resource must have a prior ledger provenance."),
      check("physical-continuity", "Physical continuity and noun identity", "REVERSAL", "validator failure", endgamePlan.reversal.action.includes(endgamePlan.reversal.resource) && endgamePlan.climax.action.includes(endgamePlan.reversal.resource), "The same established physical resource must carry through reversal and climax."),
      check("no-deus", "No deus ex machina", "REVERSAL", "endgame failure", endgamePlan.reversal.earned && !/suddenly appears|unexpected rescue|miracle/i.test(endgamePlan.reversal.action), "The final action cannot rely on luck or an unestablished rescuer."),
      check("exact-closure", "Exact objective closure", "CLIMAX", "endgame failure", endgamePlan.climax.exactObjectiveResolved && endgamePlan.climax.exactObjective === contract.exactObjective && endgamePlan.climax.closureState.includes(contract.exactObjective), "The Climax must resolve the exact contracted objective.")
    ];

    Object.entries(profile.hooks).forEach(([key, label]) => {
      checks.push(check(`form-${key}`, `${profile.label}: ${label}`, "FORM-SPECIFIC HOOKS", "wrong form classification", hookState[key], `Missing minimum ${profile.label} hook: ${label}.`));
    });

    const earliest = checks.find((item) => !item.pass) || null;
    return {
      recordType: "Validation Report",
      valid: !earliest,
      checks,
      formHookState: hookState,
      earliestCausalFault: earliest ? {
        stage: earliest.stage,
        check: earliest.label,
        classification: earliest.classification,
        reason: earliest.detail,
        repairTarget: `Return to ${earliest.stage}; do not patch a later record.`
      } : null
    };
  }

  function compilePremise(rawPremise, options = {}) {
    const premise = normalize(rawPremise);
    const asmSeed = isStructuredAsmSeed(options.asmSeed) ? options.asmSeed : null;
    const candidates = candidateForms(premise);
    const selection = selectDominant(candidates);
    const fallbackProfile = PROFILE_BY_ID.savior;
    const profile = selection.dominant ? PROFILE_BY_ID[selection.dominant.id] : fallbackProfile;
    const actionContract = buildActionContract(premise, selection, asmSeed);
    const oppositionProgram = buildOppositionProgram(actionContract, profile, asmSeed);
    const progression = buildProgression(actionContract, oppositionProgram, profile, asmSeed);
    const endgamePlan = buildEndgame(actionContract, oppositionProgram, profile, progression);
    const compilation = {
      compilerVersion: "0.1.0",
      deterministic: true,
      externalInference: false,
      sourceBoundary: ASM_PROVENANCE.note,
      sourceSeed: asmSeed ? {
        source: asmSeed.source,
        fingerprint: asmSeed.fingerprint,
        formId: asmSeed.form.id,
        worldId: asmSeed.world.id,
        protagonistId: asmSeed.protagonist.id,
        objectiveId: asmSeed.objective.id,
        oppositionId: asmSeed.opposition.id,
        meansId: asmSeed.means.id,
        pressureId: asmSeed.pressure.id,
        counterStrength: asmSeed.counter.strength,
        matchedSolutionId: asmSeed.solution.id
      } : null,
      formSelection: {
        candidates: [...candidates].sort(compareByDominance),
        dominant: selection.dominant,
        secondary: selection.secondary,
        dominanceReason: selection.reason
      },
      actionContract,
      oppositionProgram,
      causalLedger: progression.ledger,
      progressionCycles: progression.cycles,
      endgamePlan,
      validationReport: null
    };
    compilation.validationReport = validateCompilation(compilation, profile, premise);
    return compilation;
  }

  return {
    compilePremise,
    candidateForms,
    selectDominant,
    FORM_PROFILES,
    EXAMPLES,
    version: "0.1.0"
  };
});
