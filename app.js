(function () {
  "use strict";

  const compiler = window.ActionCompiler;
  const exporter = window.ActionCompilerExport;
  const premiseInput = document.getElementById("premise");
  const results = document.getElementById("results");
  const emptyState = document.getElementById("empty-state");
  const inputMessage = document.getElementById("input-message");
  const asmFrame = document.getElementById("asm-engine");
  const asmButton = document.getElementById("asm-roll");
  const asmSeedPanel = document.getElementById("asm-seed-panel");
  const asmSeedFields = document.getElementById("asm-seed-fields");
  const ASM_KEYS = ["form", "world", "protagonist", "objective", "opposition", "means", "pressure"];
  const ASM_LABELS = { form: "Form", world: "World", protagonist: "Protagonist", objective: "Objective", opposition: "Opposition", means: "Means", pressure: "Pressure" };
  let latestCompilation = null;
  let currentAsmSeed = null;
  let currentAsmPremise = null;
  let asmLocks = Object.fromEntries(ASM_KEYS.map((key) => [key, false]));
  let asmReady = false;
  let pendingAsmRoll = false;
  let asmRollTimeout = null;

  function clear(element) {
    while (element.firstChild) element.removeChild(element.firstChild);
  }

  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function renderDefinitionList(targetId, entries) {
    const target = document.getElementById(targetId);
    clear(target);
    entries.forEach(([term, description]) => {
      target.append(element("dt", "", term));
      target.append(element("dd", "", description || "Not established"));
    });
  }

  function renderForms(selection) {
    const target = document.getElementById("candidate-forms");
    clear(target);
    selection.candidates.forEach((candidate) => {
      const chip = element("div", "candidate-chip");
      chip.append(element("span", "", candidate.label));
      const evidence = Object.entries(candidate.evidence)
        .filter(([, values]) => values.length)
        .map(([key, values]) => `${key}: ${values.join(", ")}`)
        .join(" · ");
      chip.append(element("small", "", evidence));
      target.append(chip);
    });
    document.getElementById("dominant-form").textContent = selection.dominant ? selection.dominant.label : "Unclassified";
    document.getElementById("dominance-reason").textContent = selection.dominanceReason;
  }

  function renderRecords(compilation) {
    const contract = compilation.actionContract;
    const program = compilation.oppositionProgram;
    renderDefinitionList("action-contract", [
      ["Hero", contract.hero],
      ["Victim", contract.victim],
      ["Opposition", contract.opposition],
      ["Literal stakes", contract.literalStakes],
      ["Exact objective", contract.exactObjective],
      ["World", contract.world],
      ["Initial means", contract.initialMeans],
      ["Construction source", contract.authoredSource],
      ["Form constraint", contract.secondaryForm ? `${contract.dominantForm} + ${contract.secondaryForm}` : contract.dominantForm]
    ]);
    renderDefinitionList("opposition-program", [
      ["Identity", program.identity],
      ["Action role", program.role],
      ["Lethal objective", program.lethalObjective],
      ["Primary strategy", program.primaryStrategy],
      ["Stable capability", program.stableCapabilityRule],
      ["Counter source", program.authoredCounter ? `${program.authoredCounter.source} · ${program.authoredCounter.strength}` : "Compiler profile"],
      ["Response rule", program.responseRule]
    ]);
    document.getElementById("hero-tactic").textContent = program.tacticalImbalance.heroPrimaryTactic;
    document.getElementById("opposition-immunity").textContent = program.tacticalImbalance.oppositionImmunity;
    document.getElementById("hero-vulnerability").textContent = program.tacticalImbalance.heroMissingDefense;
    document.getElementById("imbalance-statement").textContent = program.tacticalImbalance.statement;
  }

  function renderCycles(cycles) {
    const target = document.getElementById("cycles");
    clear(target);
    document.getElementById("cycle-count").textContent = `${cycles.length} causal cycles`;
    cycles.forEach((cycle) => {
      const row = element("article", "cycle");
      row.append(element("div", "cycle-index", String(cycle.cycle).padStart(2, "0")));

      const tactic = element("div", "cycle-cell");
      tactic.append(element("span", "", `Hero tactic · ${cycle.tacticFamily}`));
      tactic.append(element("p", "", cycle.heroTactic));
      row.append(tactic);

      const response = element("div", "cycle-cell");
      response.append(element("span", "", "Opposition response → consequence"));
      response.append(element("p", "", cycle.oppositionResponse));
      response.append(element("p", "next-tactic", `Consequence: ${cycle.consequence}`));
      row.append(response);

      const change = element("div", "cycle-cell");
      change.append(element("span", "", "Changed state → next tactic"));
      change.append(element("p", "cycle-change", `${cycle.changedState.from} → ${cycle.changedState.to}`));
      change.append(element("p", "", `Fact: ${cycle.changedState.factEstablished}`));
      change.append(element("small", "next-tactic", `Next: ${cycle.nextTactic}`));
      row.append(change);
      target.append(row);
    });
  }

  function renderLedger(ledger) {
    const target = document.getElementById("ledger");
    clear(target);
    ledger.forEach((entry) => {
      const row = document.createElement("tr");
      row.append(element("td", "", entry.stage));
      const hero = element("td"); hero.append(element("span", "state-badge", entry.heroPower)); row.append(hero);
      const opposition = element("td"); opposition.append(element("span", "state-badge", entry.oppositionAdvantage)); row.append(opposition);
      const risk = element("td"); risk.append(element("span", "state-badge", entry.victimRisk)); row.append(risk);
      const details = [entry.mutation];
      if (entry.factsAdded.length) details.push(`FACT + ${entry.factsAdded.join("; ")}`);
      if (entry.resourcesAdded.length) details.push(`RESOURCE + ${entry.resourcesAdded.join("; ")}`);
      if (entry.resourcesLost.length) details.push(`RESOURCE − ${entry.resourcesLost.join("; ")}`);
      row.append(element("td", "", details.join(" · ")));
      target.append(row);
    });
  }

  function addEndgameCard(target, index, title, body, details) {
    const card = element("article", "endgame-card");
    card.append(element("p", "step", `${String(index).padStart(2, "0")} · ENDGAME`));
    card.append(element("h3", "", title));
    card.append(element("p", "", body));
    if (details.length) {
      const list = document.createElement("dl");
      details.forEach(([term, description]) => {
        list.append(element("dt", "", term));
        list.append(element("dd", "", description));
      });
      card.append(list);
    }
    target.append(card);
  }

  function renderEndgame(plan) {
    const target = document.getElementById("endgame");
    clear(target);
    addEndgameCard(target, 1, "Crisis", plan.crisis.ultimateChoice, [["Decision", plan.crisis.decision]]);
    addEndgameCard(target, 2, "Mercy", plan.mercy.condition, [["Distinction", plan.mercy.distinctFromCrisis]]);
    addEndgameCard(target, 3, "Reversal", plan.reversal.action, [["Established cause", plan.reversal.establishedCause], ["Resource provenance", plan.reversal.resourceProvenance]]);
    addEndgameCard(target, 4, "Climax", plan.climax.action, [["Objective closure", plan.climax.closureState], ["Opposition", plan.climax.oppositionOutcome]]);
  }

  function renderValidation(report) {
    const status = document.getElementById("validation-status");
    status.textContent = report.valid ? "Valid compilation" : "Invalid compilation";
    status.className = `validation-status ${report.valid ? "valid" : "invalid"}`;

    const faultTarget = document.getElementById("earliest-fault");
    clear(faultTarget);
    if (report.earliestCausalFault) {
      const fault = report.earliestCausalFault;
      const card = element("div", "fault-card");
      const heading = element("strong", "", `EARLIEST CAUSAL FAULT · ${fault.stage} · ${fault.classification}`);
      card.append(heading);
      card.append(element("p", "", `${fault.check}: ${fault.reason} ${fault.repairTarget}`));
      faultTarget.append(card);
    } else {
      faultTarget.append(element("div", "no-fault", "No causal fault found. The reversal and Climax are supported by prior ledger facts."));
    }

    const checksTarget = document.getElementById("validation-checks");
    clear(checksTarget);
    report.checks.forEach((checkItem) => {
      const node = element("div", `check ${checkItem.pass ? "pass" : "fail"}`, checkItem.label);
      node.title = `${checkItem.stage}: ${checkItem.detail}`;
      checksTarget.append(node);
    });
  }

  function compile() {
    const premise = premiseInput.value.trim();
    if (!premise) {
      inputMessage.textContent = "Enter a premise before compiling.";
      premiseInput.focus();
      return;
    }
    inputMessage.textContent = "";
    const asmSeed = currentAsmSeed && premise === currentAsmPremise ? currentAsmSeed : null;
    latestCompilation = compiler.compilePremise(premise, { asmSeed });
    renderForms(latestCompilation.formSelection);
    renderRecords(latestCompilation);
    renderCycles(latestCompilation.progressionCycles);
    renderLedger(latestCompilation.causalLedger);
    renderEndgame(latestCompilation.endgamePlan);
    renderValidation(latestCompilation.validationReport);
    emptyState.hidden = true;
    results.hidden = false;
    results.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function downloadCompilation(blob, extension) {
    if (!latestCompilation) return;
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.download = `${exporter.filenameBase(latestCompilation)}.${extension}`;
    document.body.append(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 60000);
  }

  function showExportFeedback(button, message) {
    const original = button.textContent;
    button.textContent = message;
    window.setTimeout(() => { button.textContent = original; }, 1500);
  }

  function postAsmRollRequest() {
    pendingAsmRoll = false;
    asmButton.disabled = true;
    asmButton.textContent = "Rolling ASM premise…";
    inputMessage.textContent = "Rolling through ASM's local authored banks…";
    asmFrame.contentWindow.postMessage({ type: "action-compiler:roll-asm", locks: asmLocks }, "*");
    window.clearTimeout(asmRollTimeout);
    asmRollTimeout = window.setTimeout(() => {
      asmButton.disabled = false;
      asmButton.textContent = "Roll ASM premise ↻";
      inputMessage.textContent = "ASM did not answer. Reload this page and try the roll again.";
    }, 5000);
  }

  function requestAsmRoll() {
    if (!asmReady) {
      pendingAsmRoll = true;
      asmButton.disabled = true;
      inputMessage.textContent = "Loading the local ASM authored banks…";
      return;
    }
    postAsmRollRequest();
  }

  function asmSeedValue(seed, key) {
    if (key === "opposition") return seed.oppositionDisplay;
    return seed[key] && seed[key].label ? seed[key].label : "Not set";
  }

  function renderAsmSeed(seed) {
    clear(asmSeedFields);
    ASM_KEYS.forEach((key) => {
      const button = element("button", "asm-seed-field");
      button.type = "button";
      button.dataset.asmLock = key;
      button.setAttribute("aria-pressed", String(asmLocks[key]));
      button.setAttribute("aria-label", `${asmLocks[key] ? "Unlock" : "Lock"} ${ASM_LABELS[key]}: ${asmSeedValue(seed, key)}`);
      button.append(element("span", "", ASM_LABELS[key]));
      button.append(element("strong", "", asmSeedValue(seed, key)));
      button.append(element("em", "", asmLocks[key] ? "Locked" : "Unlocked"));
      button.addEventListener("click", () => {
        asmLocks[key] = !asmLocks[key];
        renderAsmSeed(currentAsmSeed);
      });
      asmSeedFields.append(button);
    });
    asmSeedPanel.hidden = false;
  }

  function clearAsmSeed() {
    currentAsmSeed = null;
    currentAsmPremise = null;
    asmLocks = Object.fromEntries(ASM_KEYS.map((key) => [key, false]));
    asmSeedPanel.hidden = true;
  }

  document.getElementById("compile").addEventListener("click", compile);
  asmButton.addEventListener("click", requestAsmRoll);
  asmFrame.addEventListener("load", () => {
    asmReady = true;
    asmButton.disabled = false;
    if (pendingAsmRoll) postAsmRollRequest();
  });
  window.addEventListener("message", (event) => {
    if (event.source !== asmFrame.contentWindow || !event.data) return;
    if (event.data.type === "action-compiler:asm-ready") {
      asmReady = true;
      asmButton.disabled = false;
      if (pendingAsmRoll) postAsmRollRequest();
      return;
    }
    if (event.data.type === "action-compiler:asm-error") {
      window.clearTimeout(asmRollTimeout);
      asmButton.disabled = false;
      asmButton.textContent = "Roll ASM premise ↻";
      inputMessage.textContent = event.data.message;
      return;
    }
    if (event.data.type !== "action-compiler:asm-seed") return;
    window.clearTimeout(asmRollTimeout);
    asmButton.disabled = false;
    asmButton.textContent = "Roll ASM premise ↻";
    currentAsmSeed = event.data.seed;
    currentAsmPremise = event.data.premise;
    premiseInput.value = currentAsmPremise;
    ASM_KEYS.forEach((key) => { asmLocks[key] = !!event.data.seed.locks[key]; });
    renderAsmSeed(currentAsmSeed);
    latestCompilation = null;
    results.hidden = true;
    emptyState.hidden = false;
    const seed = event.data.seed;
    inputMessage.textContent = `ASM seed loaded: ${seed.form.label} · ${seed.world.label} · ${seed.protagonist.label}. Lock any components you want to keep, then reroll or compile when ready.`;
    premiseInput.focus();
  });
  asmFrame.contentWindow.postMessage({ type: "action-compiler:ping-asm" }, "*");
  premiseInput.addEventListener("keydown", (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key === "Enter") compile();
  });
  premiseInput.addEventListener("input", () => {
    if (currentAsmPremise && premiseInput.value !== currentAsmPremise) {
      inputMessage.textContent = "Premise edited. It can still compile, but the structured ASM counter and matched solution will detach to prevent a content mismatch.";
    }
  });
  document.getElementById("asm-unlock-all").addEventListener("click", () => {
    ASM_KEYS.forEach((key) => { asmLocks[key] = false; });
    if (currentAsmSeed) renderAsmSeed(currentAsmSeed);
  });
  document.querySelectorAll("[data-example]").forEach((button) => {
    button.addEventListener("click", () => {
      clearAsmSeed();
      premiseInput.value = compiler.EXAMPLES[button.dataset.example];
      inputMessage.textContent = "Example loaded. Press Compile premise.";
      premiseInput.focus();
    });
  });
  document.getElementById("copy-output").addEventListener("click", async () => {
    if (!latestCompilation) return;
    const button = document.getElementById("copy-output");
    try {
      await navigator.clipboard.writeText(JSON.stringify(latestCompilation, null, 2));
      button.textContent = "Copied";
      window.setTimeout(() => { button.textContent = "Copy compilation as JSON"; }, 1500);
    } catch (error) {
      button.textContent = "Copy unavailable in this browser";
    }
  });
  document.getElementById("export-markdown").addEventListener("click", () => {
    if (!latestCompilation) return;
    const button = document.getElementById("export-markdown");
    const markdown = exporter.buildMarkdown(latestCompilation);
    downloadCompilation(new Blob([markdown], { type: "text/markdown;charset=utf-8" }), "md");
    showExportFeedback(button, "Downloaded .md");
  });
  document.getElementById("export-pdf").addEventListener("click", () => {
    if (!latestCompilation) return;
    const button = document.getElementById("export-pdf");
    const pdf = exporter.buildPdfBytes(latestCompilation);
    downloadCompilation(new Blob([pdf], { type: "application/pdf" }), "pdf");
    showExportFeedback(button, "Downloaded .pdf");
  });

  premiseInput.value = compiler.EXAMPLES.monster;
})();
