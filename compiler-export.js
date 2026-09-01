(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.ActionCompilerExport = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const PAGE_WIDTH = 612;
  const PAGE_HEIGHT = 792;
  const MARGIN = 54;
  const BOTTOM_MARGIN = 48;

  function clean(value) {
    return String(value ?? "").replace(/\s+/g, " ").trim();
  }

  function markdownValue(value) {
    return clean(value).replace(/\\/g, "\\\\").replace(/\*/g, "\\*");
  }

  function detail(lines, label, value) {
    lines.push(`- **${label}:** ${markdownValue(value || "Not established")}`);
  }

  function evidenceText(candidate) {
    const evidence = Object.entries(candidate.evidence || {})
      .filter(([, values]) => values && values.length)
      .map(([key, values]) => `${key}: ${values.join(", ")}`)
      .join("; ");
    return evidence ? ` (${evidence})` : "";
  }

  function buildMarkdown(compilation) {
    const contract = compilation.actionContract;
    const program = compilation.oppositionProgram;
    const imbalance = program.tacticalImbalance;
    const endgame = compilation.endgamePlan;
    const report = compilation.validationReport;
    const lines = [
      `# Action Compiler: ${markdownValue(contract.exactObjective)}`,
      "",
      `> ${report.valid ? "VALID" : "INVALID"} COMPILATION`,
      "",
      "## Premise",
      "",
      markdownValue(contract.premise),
      "",
      "## Form Selection",
      ""
    ];

    detail(lines, "Dominant form", compilation.formSelection.dominant ? compilation.formSelection.dominant.label : "Unclassified");
    detail(lines, "Secondary form", compilation.formSelection.secondary ? compilation.formSelection.secondary.label : "None");
    detail(lines, "Dominance reason", compilation.formSelection.dominanceReason);
    lines.push("", "### Candidate Forms", "");
    compilation.formSelection.candidates.forEach((candidate) => {
      lines.push(`- **${markdownValue(candidate.label)}:** ${markdownValue(evidenceText(candidate) || "Matched discriminator")}`);
    });

    if (contract.blockbusterContext) {
      const blockbuster = contract.blockbusterContext;
      lines.push("", "## Feature-level Blockbuster Movie Machine", "");
      detail(lines, "Tradition", blockbuster.tradition);
      detail(lines, "Motifs", blockbuster.motifs.join(" + "));
      detail(lines, "Hero fantasy", blockbuster.heroFantasy);
      detail(lines, "Core / team dynamic", blockbuster.dynamic);
      detail(lines, "Feature engine", blockbuster.engine);
      detail(lines, "Hero arc", blockbuster.arc);
      detail(lines, "Setpiece promise", blockbuster.setpiece);
      detail(lines, "Sequence contribution", blockbuster.sequence.engineContribution);
    }

    lines.push("", "## Action Contract", "");
    detail(lines, "Hero", contract.hero);
    detail(lines, "Hero function", contract.heroFunction);
    detail(lines, "Victim", contract.victim);
    detail(lines, "Victim function", contract.victimFunction);
    detail(lines, "Opposition", contract.opposition);
    detail(lines, "Villain function", contract.villainFunction);
    detail(lines, "Literal stakes", contract.literalStakes);
    detail(lines, "Exact objective", contract.exactObjective);
    detail(lines, "World", contract.world);
    detail(lines, "Initial means", contract.initialMeans);
    detail(lines, "Construction source", contract.authoredSource);

    lines.push("", "## Opposition Program", "");
    detail(lines, "Identity", program.identity);
    detail(lines, "Action role", program.role);
    detail(lines, "Lethal objective", program.lethalObjective);
    detail(lines, "Primary strategy", program.primaryStrategy);
    detail(lines, "Stable capability", program.stableCapabilityRule);
    detail(lines, "Response rule", program.responseRule);
    detail(lines, "Counter source", program.authoredCounter ? `${program.authoredCounter.source}; ${program.authoredCounter.strength}` : "Compiler profile");

    lines.push("", "## Tactical Imbalance", "");
    detail(lines, "Hero primary tactic", imbalance.heroPrimaryTactic);
    detail(lines, "Opposition immunity", imbalance.oppositionImmunity);
    detail(lines, "Hero missing defense", imbalance.heroMissingDefense);
    detail(lines, "Imbalance statement", imbalance.statement);

    lines.push("", "## Causal Progression Cycles", "");
    compilation.progressionCycles.forEach((cycle) => {
      lines.push(`### Cycle ${cycle.cycle}: ${markdownValue(cycle.tacticFamily)}`, "");
      detail(lines, "Hero tactic", cycle.heroTactic);
      detail(lines, "Opposition response", cycle.oppositionResponse);
      detail(lines, "Consequence", cycle.consequence);
      detail(lines, "Changed state", `${cycle.changedState.from} -> ${cycle.changedState.to}`);
      detail(lines, "Fact established", cycle.changedState.factEstablished);
      if (cycle.changedState.resourceIntroduced) detail(lines, "Resource introduced", cycle.changedState.resourceIntroduced);
      if (cycle.changedState.resourceLost) detail(lines, "Resource lost", cycle.changedState.resourceLost);
      detail(lines, "Next tactic", cycle.nextTactic);
      lines.push("");
    });

    lines.push("## Causal Ledger", "");
    compilation.causalLedger.forEach((entry) => {
      lines.push(`### ${markdownValue(entry.stage)}`, "");
      detail(lines, "Hero power", entry.heroPower);
      detail(lines, "Opposition advantage", entry.oppositionAdvantage);
      detail(lines, "Victim risk", entry.victimRisk);
      detail(lines, "State mutation", entry.mutation);
      if (entry.factsAdded.length) detail(lines, "Facts added", entry.factsAdded.join("; "));
      if (entry.resourcesAdded.length) detail(lines, "Resources added", entry.resourcesAdded.join("; "));
      if (entry.resourcesLost.length) detail(lines, "Resources lost", entry.resourcesLost.join("; "));
      lines.push("");
    });

    lines.push("## Endgame", "", "### Crisis", "");
    detail(lines, "Ultimate choice", endgame.crisis.ultimateChoice);
    detail(lines, "Decision", endgame.crisis.decision);
    lines.push("", "### Mercy", "");
    detail(lines, "Condition", endgame.mercy.condition);
    detail(lines, "Distinction", endgame.mercy.distinctFromCrisis);
    lines.push("", "### Reversal", "");
    detail(lines, "Action", endgame.reversal.action);
    detail(lines, "Established cause", endgame.reversal.establishedCause);
    detail(lines, "Resource", endgame.reversal.resource);
    detail(lines, "Resource provenance", endgame.reversal.resourceProvenance);
    lines.push("", "### Climax", "");
    detail(lines, "Action", endgame.climax.action);
    detail(lines, "Objective closure", endgame.climax.closureState);
    detail(lines, "Victim outcome", endgame.climax.victimOutcome);
    detail(lines, "Opposition outcome", endgame.climax.oppositionOutcome);

    lines.push("", "## Validation Report", "");
    detail(lines, "Status", report.valid ? "VALID COMPILATION" : "INVALID COMPILATION");
    report.checks.forEach((check) => {
      lines.push(`- **${check.pass ? "PASS" : "FAIL"}:** ${markdownValue(check.label)} (${markdownValue(check.stage)})`);
    });
    lines.push("");
    if (report.earliestCausalFault) {
      const fault = report.earliestCausalFault;
      lines.push("### Earliest Causal Fault", "");
      detail(lines, "Stage", fault.stage);
      detail(lines, "Classification", fault.classification);
      detail(lines, "Check", fault.check);
      detail(lines, "Reason", fault.reason);
      detail(lines, "Repair target", fault.repairTarget);
    } else {
      lines.push("### Earliest Causal Fault", "", "No causal fault found. The reversal and Climax are supported by prior ledger facts.");
    }

    return `${lines.join("\n").replace(/\n{3,}/g, "\n\n").trim()}\n`;
  }

  function toPdfAscii(value) {
    const replacements = {
      "\u2018": "'", "\u2019": "'", "\u201c": "\"", "\u201d": "\"",
      "\u2013": "-", "\u2014": "-", "\u2212": "-", "\u2192": "->",
      "\u00b7": "-", "\u2022": "*", "\u00a0": " "
    };
    return String(value)
      .replace(/[\u2018\u2019\u201c\u201d\u2013\u2014\u2212\u2192\u00b7\u2022\u00a0]/g, (character) => replacements[character])
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^\x20-\x7e]/g, "?");
  }

  function plainMarkdown(value) {
    return toPdfAscii(value)
      .replace(/\\([*\\])/g, "$1")
      .replace(/\*\*/g, "")
      .replace(/`/g, "");
  }

  function wrapText(text, maxCharacters) {
    const words = text.split(/\s+/).filter(Boolean);
    if (!words.length) return [""];
    const lines = [];
    let line = "";
    words.forEach((word) => {
      if (word.length > maxCharacters) {
        if (line) lines.push(line);
        for (let index = 0; index < word.length; index += maxCharacters) lines.push(word.slice(index, index + maxCharacters));
        line = "";
      } else if (!line) line = word;
      else if (`${line} ${word}`.length <= maxCharacters) line += ` ${word}`;
      else {
        lines.push(line);
        line = word;
      }
    });
    if (line) lines.push(line);
    return lines;
  }

  function markdownBlocks(markdown) {
    return markdown.split("\n").map((line) => {
      if (!line.trim()) return { type: "blank", text: "" };
      if (line.startsWith("# ")) return { type: "title", text: line.slice(2) };
      if (line.startsWith("## ")) return { type: "heading", text: line.slice(3) };
      if (line.startsWith("### ")) return { type: "subheading", text: line.slice(4) };
      if (line.startsWith("> ")) return { type: "status", text: line.slice(2) };
      if (line.startsWith("- ")) return { type: "bullet", text: line.slice(2) };
      return { type: "body", text: line };
    });
  }

  const PDF_STYLES = {
    title: { font: "F2", size: 18, leading: 23, before: 0, after: 10, color: "0.55 0.13 0.10" },
    heading: { font: "F2", size: 14, leading: 18, before: 10, after: 5, color: "0.14 0.33 0.84" },
    subheading: { font: "F2", size: 11, leading: 14, before: 7, after: 3, color: "0.09 0.10 0.11" },
    status: { font: "F2", size: 10, leading: 14, before: 2, after: 5, color: "0.10 0.45 0.30" },
    bullet: { font: "F1", size: 9, leading: 12, before: 0, after: 1, color: "0.09 0.10 0.11", indent: 10 },
    body: { font: "F1", size: 9, leading: 12, before: 0, after: 3, color: "0.09 0.10 0.11" },
    blank: { font: "F1", size: 9, leading: 7, before: 0, after: 0, color: "0 0 0" }
  };

  function layoutPdf(markdown) {
    const pages = [[]];
    let page = pages[0];
    let y = PAGE_HEIGHT - MARGIN;

    function newPage() {
      page = [];
      pages.push(page);
      y = PAGE_HEIGHT - MARGIN;
    }

    markdownBlocks(markdown).forEach((block) => {
      const style = PDF_STYLES[block.type];
      if (block.type === "blank") {
        y -= style.leading;
        if (y < BOTTOM_MARGIN + 12) newPage();
        return;
      }
      if ((block.type === "heading" || block.type === "subheading") && y < BOTTOM_MARGIN + 64) newPage();
      y -= style.before;
      const indent = style.indent || 0;
      const prefix = block.type === "bullet" ? "- " : "";
      const availableWidth = PAGE_WIDTH - (MARGIN * 2) - indent;
      const maxCharacters = Math.max(24, Math.floor(availableWidth / (style.size * 0.51)));
      const wrapped = wrapText(`${prefix}${plainMarkdown(block.text)}`, maxCharacters);
      wrapped.forEach((line, index) => {
        if (y < BOTTOM_MARGIN + style.leading) newPage();
        page.push({
          text: line,
          x: MARGIN + (index ? indent + (block.type === "bullet" ? 8 : 0) : indent),
          y,
          font: style.font,
          size: style.size,
          color: style.color
        });
        y -= style.leading;
      });
      y -= style.after;
    });
    return pages;
  }

  function escapePdfString(value) {
    return toPdfAscii(value).replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
  }

  function buildPdfBytes(compilation) {
    const markdown = buildMarkdown(compilation);
    const pages = layoutPdf(markdown);
    const pageCount = pages.length;
    const regularFontId = 3 + (pageCount * 2);
    const boldFontId = regularFontId + 1;
    const infoId = boldFontId + 1;
    const objects = [];
    const pageIds = pages.map((_, index) => 3 + index);
    const contentIds = pages.map((_, index) => 3 + pageCount + index);

    objects[0] = "<< /Type /Catalog /Pages 2 0 R >>";
    objects[1] = `<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pageCount} >>`;

    pages.forEach((lines, index) => {
      const pageId = pageIds[index];
      const contentId = contentIds[index];
      objects[pageId - 1] = `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}] /Resources << /Font << /F1 ${regularFontId} 0 R /F2 ${boldFontId} 0 R >> >> /Contents ${contentId} 0 R >>`;
      const commands = lines.map((line) => `BT /${line.font} ${line.size} Tf ${line.color} rg 1 0 0 1 ${line.x.toFixed(1)} ${line.y.toFixed(1)} Tm (${escapePdfString(line.text)}) Tj ET`);
      commands.push(`BT /F1 8 Tf 0.40 0.44 0.47 rg 1 0 0 1 ${MARGIN} 26 Tm (Action Compiler) Tj ET`);
      commands.push(`BT /F1 8 Tf 0.40 0.44 0.47 rg 1 0 0 1 ${PAGE_WIDTH - MARGIN - 66} 26 Tm (Page ${index + 1} of ${pageCount}) Tj ET`);
      const stream = commands.join("\n");
      objects[contentId - 1] = `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`;
    });

    objects[regularFontId - 1] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>";
    objects[boldFontId - 1] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>";
    objects[infoId - 1] = `<< /Title (${escapePdfString(`Action Compiler: ${compilation.actionContract.exactObjective}`)}) /Creator (Action Compiler) /Producer (Local static JavaScript PDF exporter) >>`;

    let pdf = "%PDF-1.4\n%ASCII\n";
    const offsets = [0];
    objects.forEach((object, index) => {
      offsets[index + 1] = pdf.length;
      pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
    });
    const xrefOffset = pdf.length;
    pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
    for (let index = 1; index <= objects.length; index += 1) pdf += `${String(offsets[index]).padStart(10, "0")} 00000 n \n`;
    pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R /Info ${infoId} 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;
    return new TextEncoder().encode(pdf);
  }

  function filenameBase(compilation) {
    const form = compilation.formSelection.dominant ? compilation.formSelection.dominant.id : "unclassified";
    const objective = clean(compilation.actionContract.exactObjective)
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 52);
    return `action-compiler-${form}${objective ? `-${objective}` : ""}`;
  }

  return { buildMarkdown, buildPdfBytes, filenameBase, version: "1.0.0" };
});
