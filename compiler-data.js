(function (root, factory) {
  const data = factory();
  if (typeof module === "object" && module.exports) module.exports = data;
  root.ActionCompilerData = data;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const FORM_PROFILES = [
    {
      id: "disaster", label: "Disaster", family: "Action Adventure", identity: "setting/nature plays villain",
      roleTerms: ["avalanche", "earthquake", "wildfire", "flood", "storm", "hurricane", "eruption", "runaway train", "collapsing", "nature attacks"],
      imbalanceTerms: ["route fails", "makes it worse", "strips away", "cannot stop the"], stateTerms: ["spreading", "rising water", "aftershock", "failing structure"], closureTerms: ["reach shelter", "escape the", "survive the", "rescue"],
      hooks: { settingAsVillain: "Setting-as-villain", coherentEnvironmentalAntagonism: "Coherent environmental antagonism" },
      axis: "environmental access", oppositionRole: "the antagonistic environment", strategy: "turn every direct route into a worsening physical hazard",
      heroTactic: "force the safest known route with normal rescue technique", immunity: "the same physical process consumes or closes that route", vulnerability: "no defense against the environment stripping mobility and shelter",
      resource: "a fixed maintenance structure outside the failing route",
      moves: [
        ["direct rescue", "pushes the known safe route using {means}", "the environmental process intensifies along that route", "the route fails and the victim is cut off from the nearest shelter", "the hazard is directional rather than random"],
        ["lateral reroute", "moves across the hazard instead of retreating from it", "a second effect destroys the return path", "retreat disappears, but {resource} becomes reachable", "{resource} remains fixed while the surrounding route fails"],
        ["load transfer", "uses the fixed structure to carry the victim around the active hazard", "the environment strips the hero's remaining protective gear", "hero power falls to minimum while the victim reaches the final crossing", "the hazard's own force can be redirected through the fixed structure"],
        ["force redirection", "channels the hazard's momentum through {resource}", "the final surge overloads the structure", "one irreversible crossing remains before total failure", "the overload opens a brief path to the exact objective"]
      ]
    },
    {
      id: "monster", label: "Monster", family: "Action Adventure", identity: "a beast plays villain",
      roleTerms: ["monster", "beast", "predator", "shark", "dragon", "theropod", "wolf pack", "creature hunts", "leviathan"],
      imbalanceTerms: ["tracks heat", "hunts by", "immune", "feeds on", "cannot outrun", "controls the territory"], stateTerms: ["trail", "territory", "hunting pattern", "pack closes"], closureTerms: ["reach shelter", "escape", "protect", "rescue"],
      hooks: { beastAsVillain: "Beast-as-villain", stableBeastBehavior: "Stable beast power / behavior" },
      axis: "predator contact", oppositionRole: "the hunting beast", strategy: "track the victim through a stable superior sense and attack from its home terrain",
      heroTactic: "hide the victim and drive directly for shelter", immunity: "the beast tracks a nonvisual signature and controls the direct approach", vulnerability: "no defense once the beast establishes contact at close range",
      resource: "a silent service channel with a controllable decoy source",
      moves: [
        ["concealment", "hides the victim and masks visible movement with {means}", "{opposition} follows the victim's nonvisual signature", "concealment fails and the beast reaches the shelter approach first", "the beast tracks signature, not sight"],
        ["signature break", "crosses through terrain that suppresses the tracked signature", "the beast circles to the channel mouth instead of following", "the direct pursuit stops, but the exit becomes a controlled ambush", "{resource} suppresses the tracked signature"],
        ["false target", "sends a stronger false signature away from the victim", "the beast attacks the decoy and then corrects", "the hero gains one crossing but loses the primary weapon", "the beast commits fully to the strongest moving signature"],
        ["territory inversion", "draws the committed beast across {resource}", "the beast uses its full speed and cannot turn inside the channel", "the beast's superior momentum becomes the opening to the objective", "the service gate can close only after a full-mass crossing"]
      ]
    },
    {
      id: "doomsday", label: "Doomsday", family: "Action Adventure", identity: "the living world plays victim through extinction",
      roleTerms: ["extinction", "last surviving", "last of the", "species", "ecosystem", "all life", "living world", "continuity of life"],
      imbalanceTerms: ["cannot protect every", "spreads faster", "self-replicating"], stateTerms: ["population falls", "habitat dies", "continuity"], closureTerms: ["prevent extinction", "save the species", "restore the ecosystem"],
      hooks: { livingWorldAsVictim: "Living-world-as-victim", trueExtinctionCondition: "True extinction / continuity condition" },
      axis: "living continuity", oppositionRole: "the extinction mechanism", strategy: "destroy the last self-sustaining link in the living system",
      heroTactic: "defend each threatened population directly", immunity: "the extinction process propagates across more sites than the hero can cover", vulnerability: "no defense against simultaneous loss of breeding and habitat continuity",
      resource: "the dormant seed and breeding vault beneath the primary habitat",
      moves: [
        ["site defense", "protects the largest surviving site with {means}", "the extinction process jumps to unguarded links", "one site survives while system-wide continuity worsens", "the threat propagates through the shared life-support chain"],
        ["continuity mapping", "abandons equal defense and traces the one indispensable reproductive link", "the opposition contaminates the route to that link", "the hero identifies {resource}, but access becomes lethal", "{resource} contains an uncontaminated continuity sample"],
        ["isolation", "cuts the vault away from the dying network", "the cut removes the hero's own safe return path", "the continuity sample survives while hero power reaches minimum", "the dormant stock can restart the living cycle if physically released"],
        ["cycle restart", "uses the remaining flow to release the dormant stock", "the extinction mechanism consumes the last active habitat", "the old habitat dies as a viable new cycle begins", "the release path reaches the exact surviving ecosystem"]
      ]
    },
    {
      id: "labyrinth", label: "Labyrinth", family: "Action Adventure", identity: "the setting becomes a weapon",
      roleTerms: ["labyrinth", "maze", "shifting corridors", "moving passages", "sealed passages", "tunnel network", "fortress routes", "setting as a weapon"],
      imbalanceTerms: ["route changes", "separates", "cuts off", "locks the path"], stateTerms: ["access", "separation", "alignment", "route"], closureTerms: ["reach", "open the route", "escape the maze"],
      hooks: { settingAsWeapon: "Setting-as-weapon", spatialState: "Spatial access / separation state" },
      axis: "spatial access and separation", oppositionRole: "the weaponized setting", strategy: "change access relationships so every direct move separates hero, victim, and objective",
      heroTactic: "navigate the mapped route toward the objective", immunity: "doors, barriers, and moving connections invalidate the map after each move", vulnerability: "no defense against being physically separated from the victim",
      resource: "a fixed utility spine that crosses the moving partitions",
      moves: [
        ["mapped approach", "follows the shortest mapped route using {means}", "the setting changes the next connection and seals the retreat", "the map becomes false and the victim moves farther from the objective", "the partitions move but the load-bearing spine does not"],
        ["fixed-reference route", "leaves the corridors and reaches {resource}", "the opposition removes the nearest branch from the spine", "the hero keeps orientation but loses direct access", "{resource} intersects every moving sector once per cycle"],
        ["separation control", "times movement to the next sector intersection", "the setting isolates the hero from all ordinary exits", "hero power reaches minimum, but victim and objective enter adjacent sectors", "one manual counterweight controls the final adjacency"],
        ["forced alignment", "releases the counterweight from {resource}", "the partitions begin their irreversible reset", "a single continuous path joins hero, victim, and exact objective", "the forced alignment lasts one traversal"]
      ]
    },
    {
      id: "rebellion", label: "Rebellion", family: "Action Epic", identity: "the institution itself is villain",
      roleTerms: ["corrupt regime", "tyrannical institution", "institution itself", "dictatorship", "occupation authority", "corporate lockout", "regime", "command orders"],
      imbalanceTerms: ["controls every", "official system reinforces", "authority owns", "chain of command"], stateTerms: ["hierarchy", "orders persist", "control passes"], closureTerms: ["free", "overthrow", "open the gate", "stop the execution"],
      hooks: { institutionAsVillain: "Institution-as-villain", hierarchicalPersistence: "Systemic / hierarchical persistence" },
      axis: "hierarchical control", oppositionRole: "the villainous institution", strategy: "make each official layer enforce the lethal order even when another layer fails",
      heroTactic: "use official procedure to cancel the lethal order", immunity: "the hierarchy treats the appeal as disobedience and routes around it", vulnerability: "no defense against authority controlling access, personnel, and infrastructure",
      resource: "a manual control below the command network",
      moves: [
        ["lawful appeal", "uses rank and procedure to challenge the order", "the hierarchy marks the hero disloyal and reissues the order below them", "official access is lost while the lethal program continues", "the order persists through delegated command, not one official"],
        ["control-path tracing", "follows the order from command to its physical actuator", "security seals the central control route", "the command path is exposed and {resource} becomes the only access", "{resource} acts without network permission"],
        ["distributed refusal", "gets one operational layer to delay enforcement", "the institution replaces that layer and accelerates the order", "the delay creates one opening but strips the hero of allies", "replacement takes longer than direct mechanical action"],
        ["physical override", "crosses outside the hierarchy and reaches {resource}", "the institution commits all remaining force to the actuator", "opposition advantage becomes maximum at the exact point of control", "the manual control cannot be countermanded once engaged"]
      ]
    },
    {
      id: "conspiracy", label: "Conspiracy", family: "Action Epic", identity: "a villain uses a substantially innocent institution as weapon",
      roleTerms: ["conspiracy", "hidden controller", "secret cabal", "compromised institution", "unwitting police", "innocent institution", "puppets", "inside the agency"],
      imbalanceTerms: ["frames the hero", "uses the police", "controls the system", "every report exposes"], stateTerms: ["control path", "compromised layer", "exposure"], closureTerms: ["expose", "disconnect", "recover proof", "stop the hidden plan"],
      hooks: { institutionAsWeapon: "Institution-as-weapon", institutionalInnocence: "Substantial institutional innocence", controlPath: "Control path" },
      axis: "hidden control path", oppositionRole: "the hidden controller", strategy: "turn innocent institutional responses into attacks on the hero while concealing the true command path",
      heroTactic: "report the threat and pursue the visible agents", immunity: "every official report reaches the hidden controller and mobilizes innocent force", vulnerability: "no defense against being identified as the threat by the institution",
      resource: "an offline physical relay that records the controller's commands",
      moves: [
        ["official report", "feeds evidence into the institution", "the controller edits the record and redirects enforcement at the hero", "the hero loses institutional protection and the visible agents remain innocent", "the false orders share one out-of-band timing signature"],
        ["control-path isolation", "traces the timing signature instead of fighting agents", "the controller cuts remote access and seals the archive", "the hidden path narrows to {resource}", "{resource} stores commands before institutional systems receive them"],
        ["nonlethal penetration", "evades innocent responders to reach the offline relay", "the controller orders a lethal purge of the relay room", "the institution remains salvageable while hero power reaches minimum", "the purge order itself proves external control"],
        ["command severance", "physically removes the relay from the control path", "the controller commits the exposed direct channel", "the innocent institution stops attacking and the villain loses its weapon", "the direct channel identifies the opposition consistently"]
      ]
    },
    {
      id: "vigilante", label: "Vigilante", family: "Action Epic", identity: "lawful attempt, demonstrated villain immunity, then extra-legal action",
      roleTerms: ["vigilante", "outside the law", "turns in the badge", "break the law", "law fails", "legal system", "legitimate authority"],
      imbalanceTerms: ["immune to prosecution", "authority cannot touch", "buys the police", "protected by law"], stateTerms: ["lawful attempt", "legal immunity", "extra-legal"], closureTerms: ["rescue", "stop", "bring down"],
      hooks: { lawfulAttempt: "Lawful attempt", authorityImmunity: "Villain immunity to authority", extraLegalCrossing: "Extra-legal crossing" },
      axis: "legal access and personal exposure", oppositionRole: "the legally immune villain", strategy: "use legal protection to continue the lethal act while punishing official interference",
      heroTactic: "invoke legitimate authority and preserve admissible evidence", immunity: "the villain's legal insulation neutralizes warrants, witnesses, and official force", vulnerability: "no defense against sanctions that remove the hero's lawful access",
      resource: "confiscated evidence held outside the compromised chain",
      moves: [
        ["lawful intervention", "uses legitimate authority to stop the act", "the villain invokes protection and has the intervention revoked", "the lawful attempt fails while the victim remains in immediate danger", "the villain is demonstrably immune to the available authority"],
        ["evidence recovery", "pursues {resource} through official channels", "the chain of custody is ordered destroyed", "legal access closes, but the evidence location becomes known", "{resource} physically survives outside the compromised chain"],
        ["extra-legal crossing", "abandons official status to recover the evidence and reach the victim", "the villain brands the hero a criminal and deploys private force", "hero power reaches minimum and legal safety is gone", "the private force answers directly to the villain"],
        ["unlicensed rescue", "uses the recovered evidence to locate the lethal mechanism", "the villain personally commits to finishing the act", "the villain loses legal distance but gains maximum tactical advantage", "the mechanism can be disabled only from the victim's location"]
      ]
    },
    {
      id: "savior", label: "Savior", family: "Action Epic", identity: "society or its institutions become victim",
      roleTerms: ["save the city", "save society", "public threat", "civilians", "population", "community", "hospital", "evacuation convoy", "hundreds of"],
      imbalanceTerms: ["mass casualty", "public systems", "panic", "cannot protect everyone"], stateTerms: ["evacuation", "collective survival", "public exposure"], closureTerms: ["save the city", "evacuate", "keep the public alive", "stop the attack"],
      hooks: { societyAsVictim: "Society / institution-as-victim", collectiveSurvival: "Collective survival condition" },
      axis: "collective survival capacity", oppositionRole: "the public-threat villain", strategy: "use public infrastructure to multiply casualties faster than direct rescue can contain them",
      heroTactic: "defend the largest visible group directly", immunity: "the lethal program shifts through interconnected public systems", vulnerability: "no defense against simultaneous failures across the population",
      resource: "a public-service bypass that reaches the threatened system",
      moves: [
        ["mass defense", "concentrates {means} around the largest exposed group", "the opposition activates a second public failure elsewhere", "direct defense saves some lives while collective exposure expands", "the failures share one infrastructure feed"],
        ["system isolation", "traces the shared feed instead of chasing each event", "the villain locks the normal control room", "the public threat narrows to {resource}", "{resource} bypasses the locked public controls"],
        ["evacuation conversion", "turns the bypass into a protected evacuation route", "the opposition overloads the remaining safe route", "the population concentrates at the objective while hero defenses fail", "the overload can be grounded at the bypass"],
        ["threat removal", "grounds the lethal feed through {resource}", "the villain commits the full system load", "maximum opposition power enters the one path the hero can physically break", "breaking that path ends the exact public threat"]
      ]
    },
    {
      id: "revenge", label: "Revenge", family: "Action Duel", identity: "the hero moves toward an active personal villain",
      roleTerms: ["revenge", "avenge", "personal violation", "dishonor", "murdered family", "killed her", "killed his", "vendetta"],
      imbalanceTerms: ["henchmen", "hostage", "active villain", "stays ahead"], stateTerms: ["distance to villain", "victim leverage", "honor"], closureTerms: ["confront", "bring the killer", "rescue the captive", "defeat"],
      hooks: { personalViolation: "Personal violation / honor motive", towardVillainVector: "Toward-villain vector", activeVillain: "Active villain" },
      axis: "distance to the active villain", oppositionRole: "the active personal villain", strategy: "keep acting against the hero's remaining attachments while layers of force absorb direct attacks",
      heroTactic: "drive straight through the villain's protectors", immunity: "the villain spends henchmen and hostages to stay active beyond direct reach", vulnerability: "no defense against the villain converting the hero's personal motive into victim leverage",
      resource: "the villain's moving command route",
      moves: [
        ["direct assault", "attacks the nearest layer protecting the villain", "the villain abandons that layer and acts against the victim", "the hero advances physically but loses time and victim safety", "the villain remains active through a moving command route"],
        ["route interception", "stops clearing henchmen and intercepts {resource}", "the villain sends the captive down a separate path", "the villain's movement is constrained while the rescue splits", "{resource} rejoins the captive route at one transfer point"],
        ["motive reversal", "prioritizes the captive over the clean attack", "the villain enters the transfer point to preserve leverage", "the hero forfeits the easy kill and draws the active villain close", "the villain personally controls the final transfer"],
        ["close confrontation", "uses the transfer mechanism to separate villain and captive", "the villain commits all remaining force face-to-face", "the personal duel begins only after victim leverage is removed", "the transfer lock prevents the villain from retreating"]
      ]
    },
    {
      id: "chase", label: "Chase", family: "Action Duel", identity: "an overdog pursuer drives the hero-victim away",
      roleTerms: ["chase", "pursued", "pursuer", "hunted by", "flee", "escape from", "tracker", "on their trail"],
      imbalanceTerms: ["faster", "reacquires", "cuts them off", "tracks"], stateTerms: ["distance", "escape route", "pursuit continuity"], closureTerms: ["reach shelter", "escape", "get the witness"],
      hooks: { heroAsVictim: "Hero-as-victim", overdogPursuer: "Overdog pursuer", awayVector: "Away vector", pursuitContinuity: "Pursuit continuity" },
      axis: "pursuit distance", oppositionRole: "the overdog pursuer", strategy: "reacquire the hero-victim across every obvious escape line",
      heroTactic: "outrun the pursuer on the fastest direct route", immunity: "the pursuer is faster and controls route prediction", vulnerability: "no defense after the pursuer closes to contact range",
      resource: "a slower route with a physically severable crossing",
      moves: [
        ["speed escape", "takes the fastest direct line with {means}", "the pursuer predicts the destination and cuts ahead", "distance collapses and the direct route is lost", "the pursuer predicts destinations, not unmarked terrain"],
        ["route break", "leaves the fast line for {resource}", "the pursuer parallels the route and searches for reentry", "speed falls, but prediction no longer supplies direct contact", "{resource} has one crossing the hero can sever after use"],
        ["false destination", "sends evidence of a different destination beyond the crossing", "the pursuer commits to the false line before correcting", "the hero gains separation but sacrifices the escape vehicle", "the pursuer must return through the same severable crossing"],
        ["pursuit severance", "crosses with the victim and destroys the connection behind them", "the pursuer reaches the far side at full momentum", "pursuit continuity ends at a physically established break", "the objective remains reachable on foot beyond the break"]
      ]
    },
    {
      id: "collision", label: "Collision", family: "Action Duel", identity: "hero versus hero",
      roleTerms: ["two heroes", "rival hero", "both heroes", "hero against hero", "each must save", "two rescuers", "opposing champions"],
      imbalanceTerms: ["equally capable", "power shifts", "cannot both", "one rescue kills"], stateTerms: ["power relationship", "advantage shifts", "two objectives"], closureTerms: ["save both", "resolve both", "stop the rival"],
      hooks: { twoHeroFunctions: "Two hero functions", credibleLethalMotivation: "Credible lethal motivation", nonStaticPower: "Non-static power relationship" },
      axis: "power between two hero functions", oppositionRole: "the rival hero", strategy: "force a mutually exclusive rescue choice that makes each hero lethal to the other's objective",
      heroTactic: "defeat the rival and claim the contested rescue resource", immunity: "the rival is heroic, equally committed, and counters force with force", vulnerability: "no defense against winning the duel while causing the other victims' deaths",
      resource: "the shared load-transfer junction between both rescue systems",
      moves: [
        ["heroic confrontation", "tries to overpower the rival for the contested resource", "the rival sacrifices position to preserve their victims", "power shifts, but neither hero can win without lethal collateral", "both hero functions are credibly committed to different lives"],
        ["objective mapping", "stops attacking long enough to trace both rescue loads", "the rival takes tactical control of the contested route", "the hero loses combat advantage but discovers {resource}", "{resource} physically links both rescue systems"],
        ["power sacrifice", "yields the dominant weapon to reach the junction", "the rival follows and disables the hero's retreat", "the power relationship reverses and hero power reaches minimum", "the junction can distribute capacity to both victim groups"],
        ["shared-load solution", "redirects the contested resource through {resource}", "the rival must choose whether to block it and kill both groups", "the lethal collision resolves through the exact shared physical state", "the redirected load sustains both objectives long enough to close"]
      ]
    },
    {
      id: "machiavellian", label: "Machiavellian", family: "Action Duel", identity: "two villains conflict while the hero struggles against both",
      roleTerms: ["two villains", "rival gangs", "two hostile factions", "both factions", "caught between", "warring villains", "two crime lords"],
      imbalanceTerms: ["attack one helps the other", "both converge", "shared prize"], stateTerms: ["faction balance", "three-way", "control object"], closureTerms: ["defeat both", "deny both", "save the town"],
      hooks: { twoVillainsConflict: "Two villains in conflict", sharedSpine: "Shared goal / MacGuffin / both", unifiedThreeWaySpine: "Unified three-way spine" },
      axis: "balance between two villain spines", oppositionRole: "the two hostile villains", strategy: "make every hero attack on one villain deliver the shared prize to the other",
      heroTactic: "commit against the stronger villain first", immunity: "the unattended villain inherits every opening the attack creates", vulnerability: "no defense if both villains identify the hero as the common obstacle",
      resource: "the single transfer channel for the shared prize",
      moves: [
        ["single-faction attack", "hits the stronger faction with {means}", "the second faction takes the abandoned approach", "one villain weakens while the other nears the shared goal", "both villains require the same prize path"],
        ["balance manipulation", "feeds each villain evidence that the other controls {resource}", "both redirect force toward the transfer channel", "the two spines converge without resolving either", "{resource} is the only route that can deliver the shared prize"],
        ["three-way compression", "blocks the transfer after both factions enter", "the villains expose the deception and combine against the hero", "opposition advantage becomes maximum, but both villains occupy one causal spine", "neither villain can withdraw without surrendering the prize"],
        ["mutual denial", "releases the prize away from both factions through {resource}", "both villains turn their full force on the transfer", "their conflict disables both control positions", "the hero can now resolve both villain outcomes and the victim objective together"]
      ]
    },
    {
      id: "fate", label: "Fate", family: "Action Thriller", identity: "time becomes villain",
      roleTerms: ["fate", "prophecy", "destined to die", "time erases", "inevitable future", "temporal rule", "correction hunts"],
      imbalanceTerms: ["every change causes", "inevitable", "cannot escape", "time corrects"], stateTerms: ["temporal necessity", "anchor", "erasure"], closureTerms: ["escape fate", "prevent the destined", "remain in history"],
      hooks: { timeAsVillain: "Time-as-villain", specificFate: "Specific fate", persistentTemporalRule: "Persistent temporal necessity / rule" },
      axis: "temporal necessity", oppositionRole: "time acting as villain", strategy: "correct every deviation toward one specific lethal fate",
      heroTactic: "avoid the predicted event directly", immunity: "the temporal rule reroutes each avoidance into the same fate", vulnerability: "no defense against erasure when the final anchor is removed",
      resource: "a causally prior anchor untouched by the correction",
      moves: [
        ["direct avoidance", "prevents the predicted event with {means}", "time transfers the lethal necessity to a new cause", "the surface event changes while the same fate moves closer", "the rule preserves outcome, not method"],
        ["rule testing", "changes one harmless precursor and observes the correction", "the correction removes the hero's nearest temporal anchor", "the rule becomes specific and {resource} is identified", "{resource} predates the correction's first causal branch"],
        ["anchor retreat", "moves identity and victim continuity onto the prior anchor", "time erases the safe present around them", "hero power reaches minimum inside a shrinking valid state", "the correction cannot erase its own originating cause"],
        ["necessity inversion", "makes the specific fate contradict its originating cause", "the temporal rule commits every remaining correction", "time must preserve the hero to preserve its own established cause", "the objective state now satisfies the rule without the lethal fate"]
      ]
    },
    {
      id: "unraveling", label: "Unraveling", family: "Action Thriller", identity: "time or Destiny becomes victim",
      roleTerms: ["unraveling", "timeline erased", "erases history", "history disappears", "restore the past", "destiny is destroyed", "future collapses", "cease to exist", "causal damage"],
      imbalanceTerms: ["every intervention erases", "damage spreads downstream", "present disappears"], stateTerms: ["timeline", "causal trace", "downstream continuity", "history"], closureTerms: ["restore", "repair history", "save the future", "founding pact"],
      hooks: { timeAsVictim: "Time / Destiny-as-victim", causalDamage: "Causal damage", downstreamContinuity: "Downstream continuity at risk" },
      axis: "downstream continuity", oppositionRole: "the agent damaging history", strategy: "erase upstream causes so the safe present loses the facts that sustain it",
      heroTactic: "repair the visible present directly", immunity: "each present-day repair vanishes when its upstream cause is erased", vulnerability: "no defense against losing personal history as downstream continuity collapses",
      resource: "a timestamped physical record from before the first erasure",
      moves: [
        ["present repair", "rebuilds the missing present state with {means}", "the opposition erases the upstream cause again", "the repair disappears and more descendants lose continuity", "damage propagates downstream from one earlier causal cut"],
        ["causal tracing", "moves upstream from the vanished effect to the first damaged cause", "the erasure spreads into the archive", "the visible record dies, but {resource} remains", "{resource} was stamped before the first altered event"],
        ["trace preservation", "isolates the timestamped record from the changing network", "the opposition removes the hero's own downstream identity", "hero power reaches minimum, but one valid causal trace survives", "the preserved trace contains the exact pre-damage state"],
        ["root restoration", "reopens the pre-damage state through {resource}", "the erasure consumes the last derivative copy", "the root cause returns before downstream continuity reaches zero", "restoring the root regenerates the exact threatened continuity"]
      ]
    },
    {
      id: "deadline", label: "Deadline", family: "Action Thriller", identity: "the villain weaponizes a precise time limit",
      roleTerms: ["deadline", "countdown", "detonates at", "at midnight", "in ninety seconds", "in 90 seconds", "within two minutes", "before the timer", "villain gives"],
      imbalanceTerms: ["no retry", "no time for", "too little time", "cuts the time", "locks the timer"], stateTerms: ["seconds remain", "countdown", "choices disappear"], closureTerms: ["before it explodes", "before detonation", "before it enters", "disarm", "stop"],
      hooks: { villainSetPreciseLimit: "Villain-set precise limit", expiryConsequence: "Expiry consequence", choiceCompression: "Choice / retry compression", clockIntegrity: "Clock integrity" },
      axis: "remaining choices before expiry", oppositionRole: "the villain wielding the clock", strategy: "set a precise lethal limit and make each failed attempt consume an irreplaceable retry",
      heroTactic: "attack the timed mechanism through its normal control path", immunity: "the villain locks and backs up the timer against normal control", vulnerability: "no defense against the clock removing every chance to diagnose or retry",
      resource: "a manual physical actuator outside the timed control network",
      moves: [
        ["normal shutdown", "uses {means} on the timed system's normal controls", "the villain transfers the final trigger to an isolated backup", "the normal shutdown fails and one retry window disappears", "the clock continues consistently on the isolated backup"],
        ["timer bypass", "traces the trigger to its physical consequence", "the opposition seals the direct actuator route", "time compresses, but {resource} becomes the only remaining control", "{resource} acts downstream of the backed-up timer"],
        ["single-pass access", "abandons diagnosis and commits to the manual actuator", "the villain burns the return route and accelerates enforcement", "hero power reaches minimum with no retry remaining", "the actuator can physically prevent the expiry consequence"],
        ["irreversible interruption", "engages {resource} before expiry", "the villain commits the full timed load", "the clock reaches its final interval with opposition advantage at maximum", "the manual interruption severs the exact lethal output"]
      ]
    },
    {
      id: "holdout", label: "Holdout", family: "Action Thriller", identity: "prolonged lethal time becomes an endurance setting",
      roleTerms: ["holdout", "hold out", "siege", "until rescue", "until the ferry", "prolonged assault", "prolonged lethal condition", "endure", "trapped for hours", "survive until"],
      imbalanceTerms: ["dwindling", "ration", "running out", "drain power", "supplies", "ammunition", "oxygen falls"], stateTerms: ["attrition", "capacity", "remaining supplies", "endurance"], closureTerms: ["keep alive", "survive", "last until", "hold the"],
      hooks: { prolongedLethalCondition: "Prolonged lethal condition", dwindlingCapacity: "Dwindling survival capacity", causalAttrition: "Causal attrition" },
      axis: "remaining survival capacity", oppositionRole: "the prolonged lethal condition", strategy: "consume shelter, power, medicine, and mobility faster than the hero can replace them",
      heroTactic: "hold the widest defensible perimeter with existing supplies", immunity: "the prolonged threat can spend time and bodies while every defense consumes finite capacity", vulnerability: "no defense after the last shelter and life-support reserve are exhausted",
      resource: "a reinforced service housing with a manual barrier",
      moves: [
        ["wide perimeter", "defends every access point with {means}", "the threat probes continuously until each defense consumes supplies", "the perimeter holds while medicine, power, and ammunition fall", "attrition is caused by each defended access point"],
        ["perimeter contraction", "moves the victims into {resource}", "the opposition cuts power and attacks the new life-support dependency", "mobility is lost, but the defended surface shrinks", "{resource} has a manual barrier independent of power"],
        ["reserve conversion", "uses the last mobile reserve to sustain the manual barrier", "the prolonged condition removes the final escape route", "hero power reaches minimum and only one survival function remains", "the barrier can hold if all remaining capacity serves it"],
        ["final endurance", "abandons personal escape and commits every reserve to {resource}", "the opposition applies maximum pressure at the single barrier", "capacity reaches its terminal margin without introducing a new resource", "the objective becomes reachable when the established relief route opens"]
      ]
    }
  ];

  const FAMILY_QUESTIONS = {
    "Action Adventure": "What role does the physical or living world play?",
    "Action Epic": "What is the relationship between hero and society or institution?",
    "Action Duel": "Who moves against whom?",
    "Action Thriller": "What structural role does time play?"
  };

  const EXAMPLES = {
    monster: "A marine biologist must get an injured diver to the harbor shelter before an intelligent shark hunts them through flooded docks, or both will be killed.",
    unraveling: "A causality investigator must restore the town's founding pact after a saboteur erases it from history, or the surviving present and every descendant will cease to exist.",
    neighbor: "A port engineer must keep injured evacuees alive through a prolonged assault until the ferry arrives in ninety minutes while attackers drain power, water, medicine, and ammunition; if the ramp falls, everyone dies.",
    asm: "A rail-yard rebel mechanic must stop the execution train before it enters the sealed tunnel in ninety seconds, while the rail authority remotely locks every switch; hundreds of prisoners will die."
  };

  const ASM_PROVENANCE = {
    note: "Physical construction patterns and optional feature-level movie machines are adapted from ASM v3.0.4, preserving ASM v2.5's authored counter and matched-solution discoveries.",
    seeds: ["port_ferry_hold", "rail_switch", "derelict_bio", "citadel_founding"]
  };

  return { FORM_PROFILES, FAMILY_QUESTIONS, EXAMPLES, ASM_PROVENANCE };
});
