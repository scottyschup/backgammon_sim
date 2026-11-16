# Backgammon Lab

Buildless, mobile-first local two-player backgammon and position editor.

- `dist/engine.mjs`: pure board model, legal complete-turn generation, move prefixes, pip count, exposure-adjusted DTG.
- `dist/app.mjs`: SVG board, player interaction, setup mode, local persistence, undo/redo.
- `dist/style.css`: responsive portrait / landscape layouts.
- `node test.mjs`: rule cases, all initial dice combinations, 12 deterministic complete games, exposure distances.

Physical point index 0 is Black 1 / Red 24. Relative labels are derived. Bar coordinate is 25 and off is 0.

Exposure DTG: raw pip count plus (25 − v) / 2 for each exposed singleton on its own point v. The sum of those additions is shown as ± variance. Opposing on-board or bar checkers trigger geometric exposure at distances 1–12, 15, 16, 18, 20, 24. Blocks/intermediate legality are intentionally excluded from this heuristic. This is not a probability or confidence interval.

The legal move engine examines full turns before enabling a prefix; enforces bar entry, hitting, closed points, maximum dice usage, forced higher die, four uses for doubles, exact/oversize bearing off, and victory. NHP evaluation and ranking layers are deferred. Cube and match scoring are outside this initial checker-play version.

QA: 390×844 portrait and 844×390 landscape in real iframe viewports. Completed 3–1 as 8/5 6/5 through mobile UI; DTG follows the revised exposure penalty; turn advanced. Revised DTG example verified as Black 27 ±10 / Red 24 ±1. The requested Red 23 ±1 conflicts with raw 23 plus adjustment 1; implementation follows the formula.


## Interaction update

No visible point labels. Checker outlines show only the maximum legally selectable count from that source. Clicking the outermost selectable checker chooses one, the next chooses two, up to four; legal destination taps or plan buttons apply a validated prefix involving that many distinct checkers. Bar batches follow the same rules.

Dice and roll button sit at board center. Opening rolls reroll both dice on ties, show one Black and one Red die, and give the higher color the opening turn. Subsequent dice use the active color. Borne-off checkers render on edge; each height is 1/24 the tray-edge-to-center distance. New game resets position, turn, dice, winner, opening flag, and play mode without a confirmation dialog. Undo restores the pre-reset position and mode.

Verified reset/undo through UI, four-checker move with double twos, revised DTG and off tray, and both mobile viewport layouts.

## Automatic two-human orientation

The physical board geometry stays fixed. A view transform starts at 90° for a new game's opening roll, faces Black at 0° or Red at 180° after the roll, and advances by 180° on each turn handoff. Animations last 1000 ms, fit every intermediate angle into the board viewport, and temporarily disable board input. Reduced-motion preferences skip animation. Dice stay centered and upright. Setup retains manual Flip; play uses automatic orientation. Undo/redo derive orientation from restored turn/opening state.

Board and bar stacks render every checker, without count badges. Point stacks overlap evenly when their full height exceeds the available triangle length. Verified a six-checker stack in browser (six discs, no text badge).

Board text counter-rotates using the same animated angle as the board transform. BAR/OFF labels and all numeric text remain upright at rest and during the one-second rotation; centered HTML dice and controls remain upright independently. Verified the Red-facing endpoint and an intermediate rotation frame in the browser.

Doubles batch placement fix: destination clicks require every selected checker's final destination to match the clicked point. Doubles plan buttons likewise exclude split destinations. Regression tests reproduce double twos with two checkers from 6 to 4 (two dice remain), and from 6 to 2 (all four dice consumed), plus group sizes 2–4.

## Direction indicator and off-section removal

Removed both graphical OFF sections. Bearing off uses explicit move buttons, including when hints are disabled; setup has controls to retrieve a checker from off or remove a selected checker. Internal off totals and game rules remain unchanged.

Centered U-shaped turn-color arrow is approximately half the Roll button width. In physical Black-facing coordinates, Black's arrow opens right with its head at bottom; Red's opens right with head at top. Applying the actual board rotation makes Red-facing presentation open left with head at bottom. The arrow follows board angle in play, setup and manual flips, including one-second animation, while text stays upright. Hidden before the opening winner is decided.

## Checker movement animation

Selected moves animate each distinct checker for 1000 ms in a straight line from its current screen position to its final screen position, skipping intermediate dice landings. Grouped checkers and hit checkers animate concurrently. Works in free setup, on rotated boards, for bar entries, and bearing off; reduced-motion preference skips animation. Board inputs pause until completion. Pure motion tracking tests cover groups, multi-die paths and hits; setup movement and final position were verified in browser.

Rotation sizing now has three phases within the one-second animation: shrink for 15%, rotate for 70% at a constant scale that fits all angles, expand for the final 15% after reaching the target angle. This avoids the previous halfway expansion/contraction. Tests cover 90° and 180° turns, constant middle scale, endpoints, label angles and viewport bounds.

Animation timing update: board rotation is 1400 ms total, retaining shrink/rotate/expand phases. Checker duration scales with straight-line screen distance relative to board diagonal, bounded to 180–1000 ms. Short moves finish faster; long moves remain about one second. Verified monotonic timing and consistent duration for proportionally scaled mobile/desktop moves.

Checker departure/arrival update: during animation, the board state omits moving checkers from origin stacks and does not insert them at destinations. Final state and persistence commit only on arrival; reloading during motion retains the last complete saved position. Only the in-transit ghost represents each moving checker until then. Regression verifies grouped departure without early destination insertion.

Bar presentation: removed all visible BAR text and numeric counts. Two checkers occupy side-by-side positions; larger counts use additional rows, adapting checker size to fit without overlap. Accessible checker counts and batch selection remain available. Verified nonoverlapping placement and bounds for all 1–15 checker counts.

Mode-switch update: entering or leaving Free Setup freezes the current board angle instead of rotating. Free Setup exposes Rotate board next to Undo/Redo, applying a 180° turn and preserving that angle when switching back to Play. Automatic orientation resumes on roll/turn handoff or new game. The view override persists across reloads.

For unequal dice and two selected checkers, either highlighted split destination chooses the full legal split play. Highlighting and destination resolution use the same predicate. Doubles retain the shared-destination restriction. Regression tests verify 3–1 from 8 lands one checker on 5 and one on 7 when either point is clicked. Browser QA was blocked by browser access policy for this update.

Home-region interaction: the correct home half of the right edge is a selectable destination, with no Bear off button and no OFF labels/counts. It highlights when the selected checker/group has a legal all-off move. Clicking it applies that legal plan. Borne-off checkers render on edge along the same physical edge in opposite halves, each thickness 1/24 the edge-to-middle distance. Motion ends at the actual edge-on rectangle and commits the stack only on arrival. Free setup can select home regions to add/remove checkers directly. Clicking the opponent's home cannot bear off the current player's checkers.
