# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Static HTML/CSS/JS, no build step, no framework. Confirmed: the user asked for "schon mal eine
passende Struktur" — a folder layout that can hold more quiz task types later, not a bundler setup.
Runs from the filesystem so it survives a venue with no wifi.

## Users

Two audiences on one screen, at the same moment:

- **The quizmaster**, operating the page from a laptop attached to a beamer or TV in a pub. Hands
  busy, often holding a microphone. Must be able to trigger the reveal without the room noticing
  that a control was touched.
- **The room** — teams at tables, several metres away, in low pub light, looking at a projection.
  They never touch the page. They read it, argue about it, and write an answer on paper.

## Product Purpose

Present one pub quiz round at a time as a projected screen. The first round: six company logos,
cropped so hard that they are not immediately recognizable. Teams guess the companies. On the
quizmaster's cue each crop opens up to the full logo with the company name beneath it, one at a
time, so the room can be walked through the answers.

Success: the round runs without the quizmaster explaining the screen, and the reveal lands as a
moment — the room reacts.

## Positioning

Built for one room on one evening, not for a quiz platform. There is no account, no scoring, no
team management, no network. The content is hand-curated by the quizmaster, including the crop of
each logo — which part of a mark is shown is the actual puzzle design work, and this tool treats
it as an editable value rather than an automatic one.

## Operating Context

- Projected or shown on a TV, viewing distance several metres, room lit low.
- Opened once at the start of the round and left alone; no scrolling during the round.
- Controlled by keyboard. Presentation remotes emit Space / Page Down / arrow keys.
- The quizmaster tunes the crops beforehand, at a desk, on a normal screen.
- Answers are said out loud and written on paper. The screen does not collect anything.

## Capabilities and Constraints

- Six logos per round, all visible at once, numbered so teams can write "3 = ...".
- Crop is defined per logo as a focal point plus a zoom factor, stored as data in the page.
- Reveal is two-staged and deliberate: a keystroke arms the round, then a click on a tile opens
  that tile. Nothing on screen announces that arming happened.
- An adjust mode lets the quizmaster drag the focal point and change the zoom, then copy the
  resulting values back into the page.
- The primary colour is a variable. Dark green base, yellow accent for now; the whole surface must
  re-colour from one place.
- Logo files are third-party trademarks used as quiz content. They are dark artwork drawn for
  white backgrounds and cannot be recoloured.
- Later rounds will use the same crop-and-reveal mechanic on map sections. Image is the medium
  throughout.

## Brand Commitments

- Dark green base with a yellow accent, in the register of a German political party's identity —
  explicitly without their logo, wordmark, slogan, or any other reference to them. The colour
  relationship is the reference; nothing else is.
- No party, sponsor, or venue branding of any kind.

## Evidence on Hand

- `assets/logos/` — six SVGs: Allianz, Freeletics, Helsing, Knorr-Bremse, MTU Aero Engines,
  Münchener Rück. All six are companies headquartered in Munich; the user has not confirmed
  whether that is the round's theme, so nothing on screen states it.
- No quiz name, venue name, date, round number, or house style exists yet. These must not be
  invented as if given.

## Product Principles

1. The puzzle is the screen. Chrome that competes with six cropped marks is chrome to delete.
2. Legible from the back table: type and tiles are sized for a room, not for a desk.
3. The quizmaster's controls are invisible to the room, and unmissable to the quizmaster.
4. Curation over automation: the crop is authored, and stays editable.
5. One place to change the colour, one place to change the logos.

## Accessibility & Inclusion

Low ambient light and long viewing distance make contrast and type size functional requirements,
not compliance ones. The reveal must not depend on colour alone — position and size carry it too.
Everything reachable by click is reachable by keyboard.
