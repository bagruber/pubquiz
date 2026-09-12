# Pubquiz

Einzelne Pubquiz-Aufgaben als projizierbare Seiten. Statisches HTML, kein Build,
kein Server — die Dateien laufen auch vom Stick, wenn die Kneipe kein WLAN hat.

**[bagruber.github.io/pubquiz](https://bagruber.github.io/pubquiz/)**

## Bedienung

Auf jeder Aufgabenseite gilt dasselbe:

| Taste | Wirkung |
|---|---|
| `Leer` | schaltet das Auflösen frei. Auf der Projektion ändert sich dabei nichts außer einem kleinen Quadrat oben rechts. |
| Klick | öffnet ein Feld, sobald freigeschaltet ist |
| `Esc` | setzt alles zurück |
| `E` | Justier-Modus, nur bei Aufgabe 2 |

Die Tastenlegende unten blendet sich nach sieben Sekunden aus, bevor der Raum
hinschaut.

## Aufgaben

**2 — Logo-Ausschnitte.** Sechs Unternehmen, so stark vergrößert, dass die Marke
nicht sofort dasteht. Auflösen fährt den Ausschnitt auf das ganze Logo zurück
und schreibt den Namen auf die Antwortlinie.

`E` öffnet den Justier-Modus: Klick ins Fenster setzt den Fokuspunkt, Scrollen
zoomt, und unten steht die fertige Werteliste zum Kopieren. Sie ersetzt das
Array am Ende von `rounds/logos.html`.

Das Fensterformat ist fest verdrahtet (`--tile-ratio`), damit ein am Laptop
eingestellter Ausschnitt am Beamer derselbe ist.

**4 — Kartogramme der Münchner Bezirke.** Vier Hexagon-Kartogramme, die
verschiedene Dinge zählen. Ein Sechseck steht für eine feste Menge, ein Bezirk
bekommt so viele, wie sein Wert hergibt — die Fläche ist die Zahl. Die Altstadt
liegt auf allen vier Karten in der Akzentfarbe; ohne diesen Anker lassen sich
die Karten nicht gegeneinander lesen.

## Farben

Drei Werte in `assets/css/base.css`: `--brand`, `--accent`, `--paper`. Alles
andere wird daraus gemischt, eine neue Hauptfarbe ist eine geänderte Zeile.

Die Kartogramme haben ihre eigene Palette in `scripts/build-maps.mjs` und müssen
nach einer Farbänderung neu gebaut werden.

## Karten neu bauen

Braucht das Schwesterprojekt [hexagonalmap](https://github.com/bagruber/hexagonalmap)
daneben im selben Ordner:

```
node scripts/build-maps.mjs
```

Schreibt die vier SVGs nach `assets/maps/`. Die Zahlen stehen in
`scripts/bezirke.json`; Herkunft und Stichtag im Kopf des Skripts.

## Schriften

Arvo Bold für Überschriften und Marken, Archivo für den Kleinkram. Beide liegen
als woff2 unter `assets/fonts/` — nichts wird zur Laufzeit nachgeladen.
