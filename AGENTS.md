# Agent instructions — Backgammon Lab

## Start with evidence

- Read the relevant code, tests, documentation, and applicable repository instructions before proposing or making changes.
- Use repository files, tools, and connected context before asking the user for information already available there.
- Never guess configuration, dependencies, versions, branch names, available commands, or deployment settings. Inspect them.
- Use documentation matching the installed versions and distinguish observed facts from hypotheses.
- When a problem has just appeared, inspect working-tree changes and compare with the actual main branch before forming hypotheses.
- Preserve manual and uncommitted changes. Never revert unrelated work or overwrite it without authorization.
- Treat supplied examples, screenshots, and reference documents as evidence. Follow instructions the user explicitly adopts, while respecting instruction precedence.
- Later user corrections supersede earlier requirements. Record the final behavior, not every abandoned implementation.
- If examples conflict with an explicit formula, show the arithmetic and identify the discrepancy instead of silently inventing an exception.

## Scope and project direction

- Backgammon Lab is a mobile-first backgammon game, position editor, and foundation for an explainable analysis tool.
- Preserve working two-human play and Free Setup while adding future capabilities.
- Keep rule enforcement, board state, diagnostics, player decisions, animation, and presentation separate.
- Support eventual configurations with two, one, or zero human players through interchangeable player controllers using the same rules engine.
- NHP means non-human player. Its decision system will grow through independently switchable layers of increasing sophistication.
- Do not implement ranking weights, advanced strategy, NHP skill levels, or additional features merely because this file describes their intended architecture.
- Do not claim planned features are implemented. Verify the repository's current capabilities.
- Respect the requested phase and any explicit review checkpoint. Complete authorized work without inventing extra approval gates.

## Repository structure and deployment

- Keep the app usable as plain HTML, CSS, and vanilla JavaScript, without a runtime build step, framework, transpiler, package installation, or required `dist/` folder.
- GitHub Pages is the intended external hosting target. Keep `index.html` at the configured publishing root and use relative asset paths that work under a project subdirectory.
- Deliver browser-ready `.js` files. The requested distributable uses ordinary script loading; do not introduce `.mjs` requirements, module-loading requirements, or generated bundles the user must build.
- Keep script dependency order explicit. Separate concerns into coherent files when useful without introducing a framework.
- Preferred source organization is JavaScript in `scripts/`, CSS in `style/`, icons in `icons/`, tests in `tests/`, and reusable agent documentation in `agent/`.
- Keep global CSS in the main app stylesheet and page-area CSS with its corresponding area.
- Inspect the existing layout first. Do not reorganize a working flat export as part of an unrelated fix. Update all references together when a structural change is authorized.
- Keep scratch files and captured command output in ignored `tmp/`; exclude them, credentials, and Git internals from user-facing source archives.
- Read maintained refactor scope and decision documents when they exist. Link only to files that actually exist.
- When exporting code, include the current code and clear deployment instructions. Verify ZIP integrity and that every referenced local asset is included.
- Do not describe a successful syntax check or archive creation as proof that the user's deployment renders correctly.

## Code style

- Use descriptive names, standard JavaScript practices, small coherent files, and verified dead-code removal.
- Comment complex or unusual logic, especially full-turn legality, coordinate transforms, checker identity tracking, and animation state transitions.
- Keep source lines below 120 characters.
- Apply the rule of threes: with three or more attributes, arguments, parameters, array elements, object properties, or similar items, place each on its own line.
- Alphabetize comparable items only when their order is independent, including appropriate object keys, CSS declarations, attributes, and function groups.
- Preserve execution, dependency, semantic, override, coordinate, and geometry order. Do not blindly sort arrays, script loading, object spreads, side effects, CSS fallbacks, or shorthand/longhand declarations.
- Use blank lines between logical sections, initialization, event bindings, function groups, and major HTML regions.
- Consolidate repeated CSS selectors within the same media-query scope. Use meaningful state/context selectors for intentional overrides instead of accumulating source-order patches or `!important` rules.
- Use native `title` tooltips and accessible names for icon buttons. Do not add custom tooltip bubbles on click or focus.
- Run the repository's actual formatting command when one exists. Keep its configuration aligned with these conventions; do not assume `npm run format` exists.
- Prefer pnpm when package tooling is needed. Do not add tooling dependencies merely to serve the app.

## Work and verification

- Use the repository's verification instructions and commands when present. Do not invent missing skills or scripts.
- Run applicable linting, syntax checks, and type checking when configured. Resolve failures before presenting work as ready.
- Add meaningful regression coverage for rule changes and behavioral bugs. Avoid tests that only restate implementation details.
- Run relevant existing checks after behavior or structural changes. Repeat or broaden checks only when new changes, failures, or unresolved concerns justify it.
- Keep browser verification in the background when supported. Do not refocus or disrupt the user's browser without a task-related need.
- Check mobile portrait and landscape, not just desktop. Verify that the board and primary controls remain visible and reachable.
- Distinguish automated checks, browser checks, and assistive-technology checks. Never claim a check occurred when it was blocked or not performed.
- For visual changes, verify geometry, orientation, clipping, text readability, and interaction targets in the actual rendered UI when available.
- For style-only changes, preserve game rules, diagnostics, randomness, and selected position.
- If verification is blocked, state the concrete limitation and continue other applicable checks. Do not infer the cause of a failed deployment without evidence.
- Look for repeated workflows worth documenting under `agent/`. Keep instructions scoped and discoverable; avoid duplicating maintained implementation details.

## General product and interface conventions

- Design mobile first. Maximize usable board area with readable text, compact padding, aligned controls, and easy-to-reach actions.
- Avoid page scrolling when the board and controls can fit. Do not solve one viewport by making another orientation unusable.
- Use checkboxes or explicit pairs of buttons for two-state choices; avoid binary dropdowns. Show both alternatives when one checkbox would be ambiguous.
- Minimize interaction steps and preserve stable control sizes and positions as their state changes.
- Keep related adjustments aligned, with values adjacent to the controls they describe.
- Keep essential scores and status close to the board without covering playable regions.
- Give interactive controls appropriate semantics, accessible names, keyboard support, visible focus, and usable touch targets.
- Label form controls properly. Expose validation and status changes accessibly without excessive announcements.
- Noninteractive icons may have native titles and accessible descriptions, but must not look like clickable buttons.
- Do not rely on color alone to communicate selection, legality, warnings, or player identity.
- Preserve the user's view, position, selection, and history unless the requested action requires changing them.
- Reversible actions should have reliable Undo behavior. Prefer direct, reversible interaction over unnecessary confirmation dialogs.
- Keep labels and terminology consistent. Internal shorthand does not automatically belong on the visible board.
- Present metrics with their meaning and perspective. Do not assume that a positive number is favorable; for distance, smaller normally means less remaining travel.
- Future tables should use content-appropriate column widths, compact headings, aligned comparisons, and their own scrolling region when needed.
- If future filters select multiple outcome classes, use explicit union semantics and compute combined values from the underlying results.
- If future position libraries or imports are added, use versioned data, validate before writing, preserve conflicts, handle quota failures atomically, and expose any actual limits clearly. Do not inherit another app's record limits.
- Animation, replay, zoom, filtering, and analysis must not silently reroll dice, regenerate a position, or change the underlying result.

## Board model and numbering

- Use one stable physical model of the 24 points. Derive player-relative labels from it rather than maintaining two independent boards.
- Black point `p` is Red point `25 - p`; Black 24 is Red 1, and Black 1 is Red 24.
- Each player travels toward decreasing values in their own coordinate system, ending at their own point 1 and then bearing off.
- Track each color's checkers on points, on the bar, and borne off separately.
- A normal position contains exactly 15 checkers per color across those locations. Keep opposing colors from sharing a point.
- Keep turn, opening-roll state, rolled dice, remaining die uses, winner, and relevant controller/view state explicit.
- Board rotation changes presentation only. Never change point identity, checker ownership, direction of travel, or legal moves by rotating the view.
- Retain point numbers for code, tests, notation, and future analysis. Do not draw point numbers along board edges or inside highlighted destinations.

## Rules and legal move generation

- Generate complete legal turns before exposing selectable prefixes. Individually legal movements can still prevent required use of the dice.
- Consider both dice orders and enforce maximum possible dice usage.
- If either die can be played individually but both cannot be played, enforce the higher die where required.
- Doubles provide four uses of the rolled value; use as many as legally possible.
- Enforce bar-entry priority, closed points, hits, entry restrictions, home-board eligibility, exact and legal oversized bearing off, and victory.
- A checker on the bar has relative coordinate 25. Entry with a 1 lands on the player's 24-point.
- A point containing two or more opposing checkers is closed. Landing on a single opposing checker hits it to the bar.
- Intermediate landings must be legal when one checker uses multiple dice. A matching total distance alone is insufficient.
- Leaving a blot is legal. Distinguish strategic exposure from a rules violation.
- Do not add cube decisions, match scoring, or variants without a separate request and verified requirements.

## Selection, hints, and grouped moves

- Provide a Show available moves toggle.
- Highlight only the individual checkers that can be moved, not every checker in their stack.
- Highlight multiple checkers only when that many distinct checkers from the point can legally move in the same turn.
- Selecting the first available checker selects one; selecting the second selects two, and so on, up to four with doubles.
- After selection, highlight legal destination regions without drawing their point numbers.
- One selected checker may use either die or a legal combined route. Doubles may create additional reachable destinations.
- With unequal dice and two selected checkers, clicking either highlighted split destination moves both checkers, one to each destination, through a complete legal plan.
- With doubles, clicking a destination for multiple selected checkers must place all of them at that destination. Never select a split plan just because one checker lands there.
- Use the same destination-matching logic for highlighting and click handling.
- Validate grouped moves against legal turn prefixes and preserve unused dice correctly.
- Do not let selection or animation bypass bar priority or full-turn obligations.

## Free Setup, reset, and history

- Free Setup permits moving either color among points, the bar, and home without dice or turn restrictions.
- Preserve checker inventory and reject or clearly explain invalid transitions rather than silently destroying checkers.
- Allow setting the player to move and dice for inspection. Entering Play requires a valid position.
- Switching between Play and Free Setup must not rotate the board.
- Provide Rotate board in Free Setup beside Undo/Redo at the bottom. Manual rotation is a 180-degree turn.
- Preserve the chosen orientation when returning to Play. Resume automatic player-facing orientation through the relevant game actions, not the mode toggle itself.
- New game clears the current game and restores the normal starting board, opening-roll state, dice, turn-related state, and Play mode immediately.
- New game must be undoable. Undo restores the pre-reset position and relevant mode/state.
- Keep Undo/Redo consistent across moves, hits, bar entry, bearing off, setup edits, dice changes, and reset.
- Save complete stable positions. Never persist a temporary animation state with moving checkers missing from inventory.

## Opening roll, dice, and direction indicator

- Place dice and Roll dice at the center of the board.
- For the opening roll, roll one Black die and one Red die. If tied, reroll both until unequal; the higher color moves first using that roll.
- After the opening roll, dice use the current player's color. Distinguish spent die uses without changing their values.
- Before the opening winner is known, show neither a direction arrow nor a claim that a particular color is to move.
- Afterward, display a U-shaped arrow in the current player's color above Roll dice, approximately half the button's width.
- With Black at the bottom, Black's arrow opens right, with its arrowhead on the lower arm.
- With Red at the bottom, Red's arrow opens left, with its arrowhead on the lower arm.
- Derive the arrow's orientation from the actual board angle and current player. It must remain correct with a stationary or manually rotated board as well as during automatic rotation.

## Rotation and checker rendering

- In two-human play, start a new game with the board rotated 90 degrees before the opening roll.
- After the opening roll, rotate to put the winner's home half at the bottom.
- On End turn, orient the board for the next player, normally through a 180-degree rotation.
- Rotation lasts approximately 1.4 seconds. Shrink once to a safe size, rotate at a constant size, then expand at the final angle.
- Do not expand and shrink again around the halfway point. The opening adjustment may be only 90 degrees.
- Keep all text and numeric labels upright throughout rotation and afterward. Center controls and dice stay readable.
- Respect reduced-motion preferences and avoid conflicting input while movement is in progress.
- Render every checker on a point. Do not replace larger stacks with a numeric badge.
- When a point stack does not fit, overlap its checkers evenly within the available space.
- Do not draw BAR text or a numeric bar count. Multiple barred checkers sit beside each other, using additional rows as necessary rather than an overlapping stack.
- Preserve accessible location and inventory descriptions even when visible labels are omitted.

## Home regions and bearing off

- Both home regions share one physical board edge, in opposite halves. In the base Black-facing view, that is the right edge.
- Home is a selectable board region, like another destination. Highlight it when the selected checker or group can legally bear off.
- Clicking the correct home region applies the legal move. Do not require a Bear off button, a bottom action list, or an OFF section.
- Do not show OFF text, numeric home counts, or separate labeled trays.
- Show borne-off checkers stacked on their sides along that shared edge beside their own home half.
- Each edge-on checker is 1/24 of the distance from its edge to the middle of the sidebar in height.
- Keep home-region identity correct under rotation. Clicking the opponent's home must not bear off the current player's checkers.
- Preserve access to borne-off checkers in Free Setup without restoring unnecessary visible labels.

## Checker animation

- Animate checkers in a straight line from current position to final position. Do not animate intermediate dice landings for a combined move.
- Short moves finish faster; use distance-sensitive timing, approximately 180–1000 ms, with long moves around one second.
- Normalize timing appropriately for board size so equivalent moves feel consistent across devices.
- Grouped checkers move together. Track distinct checker identities through multi-die paths so one checker does not become two animations.
- Animate hit checkers to the bar and bearing-off moves into the actual edge-on home stack.
- Remove moving checkers from their origin as soon as movement starts. During transit, represent them only with the moving visual.
- Do not insert a moving checker into its destination stack until movement completes.
- Prevent conflicting game actions while an animation is incomplete. Commit the complete final state on arrival.
- Reloading during motion must retain or recover a complete stable position rather than lose checkers.

## Distance to goal (DTG)

- Keep raw pip count and exposure-adjusted DTG distinct from game or match score.
- For a player, raw distance is the sum of `point number × checker count`, plus 25 per barred checker. Borne-off checkers contribute zero.
- An exposed checker must be a singleton and reachable geometrically in the opponent's direction of travel at a threat distance.
- Threat distances are 1–12, 15, 16, 18, 20, and 24, accounting for ordinary rolls and possible doubles landings.
- Include opposing barred checkers as starting from relative coordinate 25.
- This exposure layer is geometric. Do not silently add block checks, intermediate-route legality, dice probabilities, or strategic weights to it.
- For each exposed checker on its own point `v`, add `(25 - v) / 2` to raw DTG and add the same amount to the displayed ± term.
- Apply the rule to both colors. Sum contributions across exposed checkers.
- The displayed ± term is a heuristic adjustment range, not a standard deviation, confidence interval, or hit probability.
- Regression example: Black has one checker on B5 and two on B6; Red has one on R23/B2; all others are borne off.
- Raw totals are Black 17 and Red 23. Both singletons are geometrically vulnerable.
- Adjusted totals are Black `27 (±10)` and Red `24 (±1)`, following the explicit formula. The earlier Red `23 (±1)` example was arithmetically inconsistent.

## Future diagnostics, NHP, and analysis

- Keep the five requested diagnostics independently inspectable:
  1. The absolute dice difference matches a distance between friendly occupied points, permitting convergence.
  2. The dice sum matches a distance one checker can traverse through legal intermediate landings.
  3. An individual die matches a relevant distance, including friendly connection, covering, or a potential hit.
  4. Moving a checker does not leave another checker alone at its origin.
  5. An existing stranded singleton can be covered.
- Initially interpret stranded as a blot unless the user defines a broader isolation concept. Keep that distinction explicit.
- Record all applicable diagnostics; do not force a move into only one category.
- Evaluate completed plays as well as intermediate states. A temporary blot may be covered by the remainder of the turn.
- Opening examples for difference matches: 3–1 makes point 5, 4–2 makes 4, 5–3 makes 3, 6–4 makes 2, and 6–1 can make 7.
- Opening connection distances among friendly starting points include 2, 5, 7, and 11. Use them as regression examples, not fixed rules for all positions.
- Treat handwritten plus/minus/cross annotations and unclear abbreviations as unresolved unless their meaning is confirmed. Do not invent ranking weights from them.
- Separate legal candidate generation from feature extraction, evaluation, search, and player control.
- Future skill layers must be independently toggleable and explain their effects. Keep baseline behavior reproducible for comparisons.
- Future Analysis mode should operate on a position snapshot, enumerate complete legal plays for specified dice, and rank resulting positions with inspectable explanations.
- Group equivalent resulting positions while retaining their legal move sequences where useful.
- Keep analysis branches reversible and separate from the live game. Preserve view state while inspecting alternatives.
- Do not present a custom heuristic score as established playing strength or a win probability without validation.
- Pip reduction alone usually cannot distinguish non-hitting opening plays that fully use the same dice. Preserve structural diagnostics for those comparisons.
