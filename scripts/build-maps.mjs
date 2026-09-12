/*
 * Rechnet die vier Hexagon-Kartogramme für Aufgabe 4 einmal aus und legt sie
 * als SVG unter assets/maps/ ab. Die Seite lädt nur die fertigen Dateien.
 *
 * Braucht das Schwesterprojekt hexagonalmap daneben:
 *   Documents/GitHub/bagruber/{pubquiz,hexagonalmap}
 *
 *   node scripts/build-maps.mjs
 *
 * Zahlen in bezirke.json, Stand September 2026:
 *   Bevölkerung   fortgeschriebener Stand aus dem Datensatz von hexagonalmap
 *   PKW           Indikatorenatlas der LH München, Motorisierungsgrad 2025,
 *                 Basiswert "Personenkraftwagen (insgesamt)" je Stadtbezirk
 *   Trinkbrunnen  Geoportal München, WFS baug_wfs:trinkwasserbrunnen,
 *                 112 von 113 Punkten in einen Bezirk gefallen
 *   Spielplätze   opendata.muenchen.de, Öffentliche Spielplätze,
 *                 814 von 824 Punkten in einen Bezirk gefallen
 *
 * Die beiden Punktdatensätze sind über Punkt-in-Polygon gegen die
 * Bezirksgrenzen gezählt, nicht aus einer fertigen Tabelle übernommen.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { hexmap } from "../../hexagonalmap/src/core/hexmap.js";
import { toSVG } from "../../hexagonalmap/src/core/svg.js";
import { colourise } from "../../hexagonalmap/src/core/colour.js";
import { laea, project, centerOf, area } from "../../hexagonalmap/src/core/geo.js";

const HEX = "../../hexagonalmap/data/muenchen-stadt";
const areas = JSON.parse(readFileSync(new URL(`${HEX}/teile.geojson`, import.meta.url)));
const outline = JSON.parse(readFileSync(new URL(`${HEX}/grenze.geojson`, import.meta.url)));
const rows = JSON.parse(readFileSync(new URL("./bezirke.json", import.meta.url)));

const werte = new Map(rows.map((r) => [r.ags, r]));

// Grünstufen statt einer Wertskala: auf einem Kartogramm trägt schon die Fläche
// den Kennwert, die Farbe trennt hier nur Nachbarn voneinander.
const TONES = ["#22553d", "#7fa384", "#12362a", "#b9c9b2", "#4b7d5e", "#93b69a"];
const INK = "#0f2a1d";

// Ein fester Anker auf allen vier Karten: die Altstadt liegt immer in der
// Akzentfarbe. Sie verrät keinen Kennwert, gibt dem Raum aber einen Punkt,
// von dem aus sich die Karten überhaupt lesen lassen.
const ANKER = "09162-01";
const ANKER_TON = "#ffe600";

// Jede Karte etwa gleich viele Felder, sonst wirkt eine gröber als die andere.
const ZIEL = 340;

const karten = [
	{
		datei: "bevoelkerung", feld: "bevoelkerung", titel: "Bevölkerung",
		quelle: "Statistisches Amt München, Stand 31.12.2024",
	},
	{
		datei: "pkw", feld: "pkw", titel: "PKW",
		quelle: "Indikatorenatlas München, Motorisierungsgrad 2025",
	},
	{
		datei: "trinkbrunnen", feld: "trinkbrunnen", titel: "Trinkbrunnen",
		quelle: "Geoportal München, Baureferat, Abruf 2026",
	},
	{
		datei: "spielplaetze", feld: "spielplaetze", titel: "Spielplätze",
		quelle: "opendata.muenchen.de, Stand 26.08.2024",
	},
];

const zahl = (n) => n.toLocaleString("de-DE");

// Echte Fläche je Bezirk, aus der projizierten Geometrie. Sie trägt die
// Referenzkarte: dieselben Sechsecke, verteilt nach Quadratkilometern statt
// nach einem Kennwert.
const projektion = laea(...centerOf(outline));
const flaeche = new Map(project(areas, projektion).map((r) => [r.props.ags, area(r)]));

/** Alle Bezirke auf dem Höchst- oder Tiefstwert — Gleichstand kommt vor. */
function spitze(feld, richtung) {
	const werte = rows.map((r) => r[feld] || 0);
	const grenze = richtung === "max" ? Math.max(...werte) : Math.min(...werte);
	const treffer = rows.filter((r) => (r[feld] || 0) === grenze);
	return [treffer.map((r) => r.name).join(" und "), zahl(grenze)];
}

const eintraege = {};

// Die Farbzuordnung entsteht einmal auf der Bevölkerungskarte und gilt dann für
// alle vier: nur so bleibt ein Bezirk über die Karten hinweg wiedererkennbar.
let farbeJeBezirk = null;

for (const { datei, feld, titel, quelle } of karten) {
	const summe = rows.reduce((a, r) => a + (r[feld] || 0), 0);
	const layout = hexmap({
		areas,
		outline,
		value: (p) => werte.get(p.ags)?.[feld] ?? 0,
		valuePerHex: summe / ZIEL,
		fidelity: 0.6,
		orientation: "pointy",
	});

	if (!farbeJeBezirk) {
		const tones = colourise(layout, TONES);
		farbeJeBezirk = new Map(layout.regions.map((r, i) => [r.id, tones[i]]));
	}

	const svg = toSVG(layout, {
		width: 900,
		padding: 2,
		gap: 0.09,
		fill: (region) => (region.id === ANKER ? ANKER_TON : farbeJeBezirk.get(region.id) ?? TONES[0]),
		stroke: INK,
		strokeWidth: 3,
	});

	writeFileSync(new URL(`../assets/maps/${datei}.svg`, import.meta.url), svg);

	eintraege[datei] = {
		src: `../assets/maps/${datei}.svg`,
		name: `${titel} · ${zahl(summe)}`,
		facts: [
			["Meiste", ...spitze(feld, "max")],
			["Wenigste", ...spitze(feld, "min")],
		],
		quelle,
	};

	const felder = layout.regions.reduce((a, r) => a + r.count, 0);
	const leer = layout.regions.filter((r) => r.count === 0).map((r) => r.name);
	const gross = [...layout.regions].sort((a, b) => b.count - a.count).slice(0, 3);
	console.log(
		`${datei.padEnd(14)} Summe ${String(summe).padStart(9)}  ` +
		`${String(felder).padStart(4)} Felder  je Feld ${(summe / felder).toFixed(2)}
` +
		`               größte: ${gross.map((r) => `${r.name} ${r.count}`).join(", ")}` +
		(leer.length ? `
               ohne Feld: ${leer.join(", ")}` : "")
	);
}

// Referenzkarte: gleiche Auflösung, aber die Fläche steht für sich selbst.
{
	const summe = [...flaeche.values()].reduce((a, b) => a + b, 0);
	const layout = hexmap({
		areas,
		outline,
		value: (p) => flaeche.get(p.ags) ?? 0,
		valuePerHex: summe / ZIEL,
		fidelity: 1,
		orientation: "pointy",
	});

	writeFileSync(
		new URL("../assets/maps/flaeche.svg", import.meta.url),
		toSVG(layout, {
			width: 900,
			padding: 2,
			gap: 0.09,
			fill: (region) => (region.id === ANKER ? ANKER_TON : farbeJeBezirk.get(region.id) ?? TONES[0]),
			stroke: INK,
			strokeWidth: 3,
		})
	);

	const felder = layout.regions.reduce((a, r) => a + r.count, 0);
	const gross = [...layout.regions].sort((a, b) => b.count - a.count)[0];
	console.log(`flaeche        ${String(felder).padStart(30)} Felder  größte: ${gross.name} ${gross.count}`);
}

// Die Seite bindet diese Datei als normales Script ein — fetch() scheitert an
// file://, und die Aufgabe soll auch ohne Server vom Stick laufen.
writeFileSync(
	new URL("../assets/maps/karten.js", import.meta.url),
	[
		"/* Erzeugt von scripts/build-maps.mjs — nicht von Hand ändern. */",
		"var KARTEN = " + JSON.stringify(eintraege, null, "\t") + ";",
		"",
	].join("\n")
);
