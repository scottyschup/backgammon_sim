# Backgammon Lab — Codex handoff

## Goal and current phase

Build a mobile-first backgammon game that will become an explainable analysis tool.

The immediate foundation is:

- Working two-human play with correct legal moves.
- Free Setup for arranging arbitrary positions.
- Distance-to-goal diagnostics.
- Responsive board rendering, checker selection, and animation.

Future work will add **0, 1, or 2 human players**, an NHP (**non-human player**), and analysis that ranks legal plays. **Do not implement ranking or advanced decision weights yet.** The user wants increasingly sophisticated decision layers that can be toggled independently to adjust NHP skill.

The user is an experienced UI/UX engineer. Be direct, preserve explicit requirements, investigate before guessing, and distinguish tested behavior from assumptions.

## Authoritative instructions and deliverables

An adapted `AGENTS.md` was created from a similar project’s instructions. It combines reusable engineering principles with this app’s requirements and distinguishes future work from implemented behavior.

- [Backgammon-specific AGENTS.md](https://chatgpt.com/library?file_id=libfile_b87412eaab608191912a5aa07157b1b8&account_id=personal)
  - Library filename: `AGENTS(1).md`.
  - Intended repository filename: `AGENTS.md`.
  - **Explicitly excludes the terminal-workaround instructions**, which were Copilot-specific.
- [Full modular source ZIP](https://chatgpt.com/library?file_id=libfile_7e017a391054819194c2909b8e857def&account_id=personal)
  - `backgammon-lab-source.zip`
- [GitHub Pages export ZIP](https://chatgpt.com/library?file_id=libfile_d5bb58d1056c8191b72adb03a845d705&account_id=personal)
  - `backgammon-lab-github-pages.zip`

**Inspect the actual code supplied to Codex before modifying anything.** The user may have changed their repository after these exports.

## Deployment and vanilla JavaScript requirement

The user explicitly requires **vanilla HTML, CSS, and JavaScript served from GitHub Pages**.

They strongly objected to being given an export requiring a local server explanation or appearing to require a module/build environment.

The final Pages export contains these files directly at its root:

```text
index.html
app.js
style.css
.nojekyll
README.md
```

- `app.js` is an ordinary classic script, wrapped in an IIFE.
- It has no imports/exports, framework, module loader, runtime build step, or package-install requirement.
- `index.html` loads it with `<script src="app.js"></script>`.
- Asset paths are relative so deployment under a project subdirectory works.
- The Pages export was produced by combining the modular source files and stripping module declarations.
- Its syntax and ZIP integrity were checked, but the actual external deployment was **not successfully inspected**.

The current repository uses ordinary browser assets:

```text
backgammon-lab/
  README.md
  RUNNING.md
  test.js
  index.html
  scripts/
    app.js
    dice.js
    engine.js
    metrics.js
    motion.js
    view.js
  style/
    app.css
  icons/
```

Run `node test.js` and serve the repository root with `python3 -m http.server 8000`.

### URLs and verification limitations

User’s deployment:

```text
https://scottschupbach.com/backgammon_sim
```

The user reported that it did not render. Attempts to inspect it failed:

- Cloud browser: `ERR_HTTP2_PROTOCOL_ERROR`.
- HTTP source request: 503 from this environment.
- Connected browser access was unavailable/denied.

**No actual cause of the deployment failure was established. Do not claim it was diagnosed or fixed.** The user eventually said “Nevermind,” ending that investigation.

Earlier work was also published privately at:

```text
https://backgammon-shot-lab.chivalrousbox.chatgpt.site
```

Sites project ID:

```text
appgprj_6afa8c440f4881918f07fb4de48af4ba
```

Last source commit before export:

```text
131ca653df8d70d1fbebd44e9029ad58675c7e14
```

Do not include credentials in documentation or artifacts.

## Engineering and architecture requirements

Separate these responsibilities:

1. **Position model:** points, checker ownership/counts, bar, borne-off totals, turn, dice, opening state, winner.
2. **Rules engine:** complete legal turn generation and application.
3. **Diagnostics:** DTG and the five strategic checks below.
4. **Controllers:** human or NHP selecting from the same legal choices.
5. **View/animation:** geometry, rotation, selection, movement.
6. **Future evaluation/search:** independent, explainable decision layers.

Keep physical point identity stable. Rotation is presentation only.

Preserve manual/uncommitted changes. Read relevant code and tests before changing behavior. Do not guess tooling, versions, commands, or branch names.

Adapted style conventions include:

- Descriptive names and small coherent files.
- Source lines under 120 characters.
- “Rule of threes”: three or more comparable items go on separate lines.
- Alphabetize independent like-items, but preserve geometry, execution, dependency, script-loading, spread, and CSS override order.
- Consolidate CSS instead of accumulating override patches.
- Native title tooltips, accessible control names, keyboard access, visible focus.
- Use existing formatting/check commands; do not invent them.
- Prefer pnpm if package tooling is genuinely necessary.
- No build/runtime dependencies just to serve the game.
- Meaningful regression tests; do not claim browser verification when it did not occur.

The adapted AGENTS file suggests organized folders (`scripts/`, `style/`, `icons/`, `tests/`, `agent/`) but explicitly says not to restructure a working flat export during an unrelated fix.

## Board coordinates and rules

### Numbering

Each player’s point numbers count outward from their own home:

```text
Black p = Red (25 − p)
```

Examples:

- B24 = R1.
- B1 = R24.
- Each player moves toward decreasing numbers.
- Home board is their own points 1–6.
- Bar coordinate is **25**; borne off is 0.

The user originally said a barred checker should count as 24. This was corrected: entering with a 1 places it on its own 24-point, so its standard remaining distance is 25.

**Numbers are internal shorthand for code, strategy, tests, and analysis. Do not draw point numbers on board edges or highlighted destinations.**

### Legal move generation

Validate **whole turns**, then expose legal prefixes:

- Both dice orders.
- Maximum possible dice usage.
- Higher-die rule when either die can be used individually but both cannot.
- Doubles provide four uses.
- Bar-entry priority.
- Closed opposing points.
- Hits and movement of hit checkers to the bar.
- Legal intermediate landings for combined moves.
- Bearing-off eligibility, exact rolls, legal oversized rolls.
- Victory after all 15 checkers are borne off.

Each color has 15 checkers across board, bar, and home. Opposing colors cannot share a point.

Leaving a blot is legal; strategic exposure is separate from move legality.

Cube/match scoring and variants were not requested as part of this initial implementation.

## Selection and available-move hints

There is a **Show available moves** toggle.

### Individual checker highlighting

- Highlight only the checkers that can actually be moved, **not the entire stack**.
- Highlight multiple checkers only if that many distinct checkers from the point can legally move during the turn.
- Selecting the first available checker selects one.
- Selecting the second selects two, etc.
- Doubles can allow selecting up to four.
- Selecting a checker/group reveals legal destination regions.
- Do not put point numbers inside those regions.

One checker may use either die or a legal combined movement. Doubles can produce more than three destinations.

### Two selected checkers with unequal dice

If the user selects two checkers and dice differ:

- Highlight both legal split destinations.
- Clicking **either** destination executes the full split play.
- One checker goes to each destination.

Regression example:

```text
Roll 3–1; select two checkers from point 8.
Click either point 5 or point 7.
Result: one checker on 5, one on 7; both dice used.
```

### Grouped checkers with doubles

Clicking a destination must place **all selected checkers there**.

A previous bug chose the first plan where _any_ selected checker reached the clicked point, splitting the group. That was fixed.

Examples:

```text
Double twos; two checkers from 6 to 4:
Both land on 4, with two die uses remaining.

Double twos; two checkers from 6 to 2:
Both land on 2, using all four die uses.
```

Highlighting and click resolution must use consistent destination matching.

## Free Setup, history, and reset

Free Setup allows arranging either color among points, bar, and home without turn/dice restrictions.

- Preserve inventory.
- Reject or explain invalid placement instead of silently deleting checkers.
- Allow setting player to move and analysis dice.
- Play requires a valid position.

### Mode switching and manual rotation

**Switching between Play and Free Setup must not rotate the board.**

- Preserve the actual current angle.
- Free Setup has a **Rotate board** button beside Undo/Redo at the bottom.
- Manual rotation turns 180°.
- Returning to Play preserves that angle.
- Automatic player-facing orientation resumes through game actions, not the mode toggle itself.
- Keep the direction arrow correct for the actual angle.

### New game

New game must immediately:

- Reset the standard starting position.
- Clear dice and winner.
- Restore opening-roll state.
- Return to Play.
- Remove any known-first-player indication.

No confirmation dialog is needed.

**Undo must restore the previous game and relevant state/mode** if New game was clicked accidentally.

Preserve Undo/Redo through moves, setup edits, dice changes, bar entry, hits, bearing off, and reset.

## Dice and direction arrow

Dice and **Roll dice** are centered on the board.

### Opening

- Roll one Black die and one Red die.
- If tied, reroll **both** until unequal.
- Higher color goes first using that roll.
- Before this is determined, show **no direction arrow** and no “Black to move”/“Red to move” claim.
- A prior SVG hiding bug was fixed by toggling the actual `hidden` attribute rather than assigning an unsupported SVG `.hidden` property.

Subsequent dice use the current player’s color. Spent uses are visually distinguished.

### U-shaped arrow

Above Roll dice, show an arrow:

- In the current player’s color.
- Approximately half the Roll button’s width.
- Black at bottom: U opens **right**, arrowhead on **lower arm**.
- Red at bottom: U opens **left**, arrowhead on **lower arm**.
- Derive direction from the actual board angle and current player.
- It must work when the board remains stationary, is manually rotated, or is automatically rotating.

## Board rotation

For two humans:

1. New game starts at **90°**, before the opening roll.
2. Opening winner’s home rotates to the bottom.
3. End turn rotates to put the next player’s home at the bottom, normally a 180° turn.

### Animation timing and sizing

Current requested duration: approximately **1.4 seconds**.

The original implementation continuously fit the rotating rectangle, causing an unwanted expansion/contraction halfway through.

Correct sequence:

1. Shrink once to a safe size.
2. Rotate at a **constant size**.
3. Expand only at the final angle.

Implemented phases were approximately 15% shrink, 70% rotation, 15% expansion.

This applies to 180° turn handoffs and 90° opening adjustments.

### Upright labels

All text and numeric labels must remain upright:

- During rotation.
- At the final angle.

The implementation counter-rotates SVG text using the same animated angle. Centered HTML dice/buttons stay upright independently.

Respect reduced-motion preferences and avoid conflicting interaction during animation.

## Checker rendering

### Point stacks

- Draw **every checker**.
- No count badge replacing stacks beyond five.
- If all checkers do not fit, overlap them **evenly** within the available point length.

### Bar

- No visible “BAR” text.
- No visible numeric bar count.
- Multiple barred checkers sit **side by side**, not overlapping.
- Additional rows may be used to fit larger counts.
- The current layout uses two columns and scales checker size to fit.
- Preserve accessible descriptions and legal grouped selection.

### Home / borne-off regions

The user clarified that both homes share the **same physical edge**, in opposite halves.

In the base Black-facing view, both are on the **right edge**.

Final requirements:

- Home is a **selectable region**, like the other destinations.
- Highlight the correct home region when the selection can legally bear off.
- Clicking it performs the move.
- **No Bear Off button.**
- Do not require a bottom action-list button.
- No “OFF” text, numeric home counts, or labeled OFF sections.
- **Do show the borne-off checkers**, stacked on their sides.
- Each checker’s edge-on height is **1/24 of the distance from the edge to the sidebar’s middle**.
- Correct home half and shared edge rotate with the board.
- Clicking the opponent’s home must not bear off the current player’s checkers.
- Free Setup must retain access to these regions.

An earlier misunderstanding removed the borne-off checker display along with OFF labels. That was explicitly corrected.

## Checker movement animations

- Straight line from current position to **final position**.
- For a checker using multiple dice, do not stop at intermediate dice landings.
- Grouped checkers animate together.
- Hit checkers animate to the bar.
- Borne-off checkers animate into the actual edge-on home stack.

### Timing

The user requested faster short moves:

- Distance-sensitive duration.
- Approximately **180–1000 ms**.
- Long moves remain near one second.
- Normalize distance against board size so mobile and desktop feel consistent.

### Departure and arrival

Explicit requirement:

- Remove moving checkers from the initial stack **as movement begins**.
- Do **not** put them in the destination stack early.
- During transit, show only the moving checker visual.
- Add them to the final stack when movement completes.

The implementation tracks distinct checker identities across a selected plan, including hits.

During animation:

- Keep conflicting game actions disabled.
- Keep temporary departure state separate from the final complete state.
- Do not persist incomplete checker inventory.
- A reload during motion should retain the last stable position.
- Commit complete final state on arrival.

Browser verification observed an origin stack drop from five to four while destination remained empty, then destination gained the checker after arrival.

## Distance to goal (DTG)

Keep raw pip count separate from adjusted DTG and game/match score.

### Raw distance

```text
raw = Σ(player-relative point × own checker count)
      + 25 × own barred checker count
```

Borne-off checkers contribute zero.

### Exposure test

A checker is vulnerable if:

1. It is alone on its point.
2. An opposing checker can reach it geometrically in the opponent’s forward direction at one of these distances:

```text
1–12, 15, 16, 18, 20, 24
```

These include potential doubles landings. The user explicitly corrected the initial ≤11 limit.

The implementation also includes opposing barred checkers as starting from coordinate 25.

**This is a geometric heuristic**, currently excluding:

- Actual dice roll probability.
- Blocking points.
- Legal intermediate-route checks.
- Advanced strategic considerations.

Do not silently change this layer to a more elaborate exposure model.

### Adjustment formula

The user corrected the initial “count half the checker’s point value” explanation.

For each exposed checker on its own point `v`:

```text
adjustment = (25 − v) / 2

adjusted DTG = raw DTG + Σadjustments
displayed ± term = Σadjustments
```

Apply to **both colors**. The user explicitly selected symmetric exposure earlier.

The ± label is a heuristic adjustment range, **not** a statistical variance, confidence interval, or hit probability.

### Important example and arithmetic discrepancy

Position:

- Black: one checker on B5; two on B6.
- Red: one on R23 = B2.
- All others borne off.

Raw:

```text
Black = 5 + 2×6 = 17
Red = 23
```

Both singletons are vulnerable.

Following the formula:

```text
Black = 27 (±10)
Red = 24 (±1)
```

The user originally wrote `Red: 23 (±1)` in the correction. The arithmetic discrepancy was explicitly pointed out; implementation follows `23 + 1 = 24`. Do not invent a special exception to retain 23.

## Future NHP diagnostics

The user identified five checks:

1. Does the **absolute dice difference** equal a distance between two friendly occupied points?
2. Does the **dice sum** equal a distance that lets one checker traverse the full amount?
3. Does either **individual die** equal a relevant distance?
4. Is a checker free to move **without leaving another checker stranded**?
5. Is there an existing stranded checker that **can be covered**?

Working interpretation:

- “Stranded” initially means a singleton/blot.
- Keep that distinct from broader isolation/trapping unless clarified.
- Moving one from a pair leaves a blot.
- Moving one from three leaves a protected pair.
- Moving a singleton empties its origin; destination safety is separate.
- These are diagnostics, not legality rules or established ranking weights.
- A play can satisfy several simultaneously.
- Evaluate complete turns: a first move can expose a checker that the second covers.

## Handwritten opening analysis

Three photos were supplied, mostly different views of the same analysis sheet.

The assistant interpreted the main notation; **not all annotations were confirmed**.

Starting friendly occupied points:

```text
24: 2 checkers
13: 5
8: 3
6: 5
```

Relevant separations:

```text
8 ↔ 6   = 2
13 ↔ 8  = 5
13 ↔ 6  = 7
24 ↔ 13 = 11
```

There are 15 unordered unequal opening rolls.

### Δ: convergence

The dice difference can allow two checkers from different starting points to meet:

| Roll | Play      | New protected point |
| ---- | --------- | ------------------: |
| 3–1  | 8/5, 6/5  |                   5 |
| 4–2  | 8/4, 6/4  |                   4 |
| 5–3  | 8/3, 6/3  |                   3 |
| 6–4  | 8/2, 6/2  |                   2 |
| 6–1  | 13/7, 8/7 |                   7 |

The prominent `+5`, `+4`, etc. were interpreted as point numbers being established, **not evaluation bonuses**.

### Σ: connection with one checker

- Sum 5: 13/8.
- Sum 7: 13/6.
- Sum 11: 24/13.

Intermediate legality still matters.

Individual “TWO” and “FIVE” annotations appeared to refer to:

- Die 2 connecting 8/6.
- Die 5 connecting 13/8.

Unresolved:

- Exact meaning of `+`, `−`, and `×` classifications.
- Some bracketed positions.
- Precise “Best” ranking hierarchy.
- A handwritten reminder resembling “Leave the … open.”

Do not turn those uncertain annotations into NHP weights.

Photos:

- `libfile_002481a91e7c819193e066bcd276ca9d`
- `libfile_30a358ffc3a48191b4b019421589ca25`
- `libfile_7df4ed23d40481918b861386d27f9b87`

## Future analysis architecture

Eventually:

- Analyze a frozen position with specified dice.
- Enumerate complete legal plays.
- Rank resulting positions with explainable diagnostic contributions.
- Group equivalent final positions while retaining legal move sequences where useful.
- Explore alternatives as reversible branches, without advancing or corrupting the live game.
- Preserve view state.
- Allow reproducible dice/seeds for controller comparisons and zero-human simulations.
- Keep advanced skill layers independently switchable.

Do not present heuristic rankings as validated playing strength or win probability.

Raw pip reduction alone usually cannot distinguish opening plays that fully consume the same roll without hits or bearing off.

## Existing verification and cautions

The modular source included regression checks for:

- Initial pip counts of 167 per player.
- DTG formula/example and exposure distances.
- Bar entry priority.
- Hits.
- Exact/oversized bearing off.
- Higher-die requirement.
- Doubles and full-turn prefixes.
- All initial dice combinations.
- Twelve deterministic complete games.
- Grouped doubles placement and unused dice.
- Unequal-dice split destination selection.
- Opening full-pair rerolls and dice colors.
- Rotation endpoints and constant-size rotation phases.
- Upright label angle synchronization.
- Distinct-checker animation paths and hit tracking.
- Departure without early destination insertion.
- Legal grouped bearing off and victory.

Earlier browser checks covered mobile viewports around **390×844 portrait** and **844×390 landscape**. Later browser access became blocked, so **do not assume every subsequent UI change was browser-verified**.

The external GitHub Pages deployment failure remains undiagnosed. The user’s latest task before this handoff was creating the adapted AGENTS file and requesting this conversation compaction; no additional app feature is currently authorized by that request.
