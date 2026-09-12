/*
 * revealBoard(boardElement, items)
 *
 * items: [{ src, name, focus: [x, y], zoom }]
 *   focus  Fokuspunkt in Prozent des Fensters, um den herum vergrößert wird
 *   zoom   Vergrößerung im versteckten Zustand; Auflösen fährt auf 1.
 *          Ohne zoom liegt das Bild offen und nur der Name wird aufgelöst.
 *
 * Leertaste  schaltet frei, danach löst ein Klick ein Feld auf
 * Escape     setzt alles zurück
 * E          Justier-Modus: klicken setzt den Fokus, scrollen zoomt.
 *            Nur auf Seiten, die ein Feld für die Werte mitbringen.
 */
function revealBoard(board, items) {
	var stage = board.closest('.stage');
	var output = stage.querySelector('[data-values]');
	var armed = false;
	var adjusting = false;

	var tiles = items.map(function (item, index) {
		if (!item.focus) item.focus = [50, 50];
		if (!item.zoom) item.zoom = 1;

		var li = document.createElement('li');
		li.className = 'tile';
		li.innerHTML =
			'<button class="tile__window" type="button">' +
			'<span class="tile__frame"><img class="tile__art" alt="" src="' + item.src + '"></span>' +
			'<span class="tile__cross"></span><span class="tile__values"></span>' +
			'</button>' +
			'<p class="tile__answer"><span class="tile__mark"></span>' +
			'<span class="tile__name"></span></p>';

		var tile = {
			el: li,
			window: li.querySelector('.tile__window'),
			values: li.querySelector('.tile__values'),
			item: item
		};

		var mark = String.fromCharCode(65 + index);
		li.querySelector('.tile__mark').textContent = mark;
		li.querySelector('.tile__name').textContent = item.name;
		tile.window.setAttribute('aria-label', 'Feld ' + mark + ' auflösen');
		paint(tile);

		tile.window.addEventListener('click', function () {
			if (armed && !adjusting) li.dataset.revealed = '';
		});

		tile.window.addEventListener('pointerdown', function (event) {
			if (!adjusting) return;
			tile.window.setPointerCapture(event.pointerId);
			focusAt(tile, event);
		});

		tile.window.addEventListener('pointermove', function (event) {
			if (adjusting && event.buttons === 1) focusAt(tile, event);
		});

		tile.window.addEventListener('wheel', function (event) {
			if (!adjusting) return;
			event.preventDefault();
			item.zoom = clamp(item.zoom * (event.deltaY > 0 ? 0.94 : 1.064), 1, 20);
			paint(tile);
		}, { passive: false });

		board.append(li);
		return tile;
	});

	function focusAt(tile, event) {
		var box = tile.window.getBoundingClientRect();
		tile.item.focus = [
			round(clamp(((event.clientX - box.left) / box.width) * 100, 0, 100)),
			round(clamp(((event.clientY - box.top) / box.height) * 100, 0, 100))
		];
		paint(tile);
	}

	function paint(tile) {
		var item = tile.item;
		tile.window.style.setProperty('--fx', item.focus[0] + '%');
		tile.window.style.setProperty('--fy', item.focus[1] + '%');
		tile.window.style.setProperty('--zoom', item.zoom);
		tile.values.textContent = item.focus[0] + ' / ' + item.focus[1] + ' · ×' + round(item.zoom);
		writeValues();
	}

	function writeValues() {
		if (!output) return;
		output.value = items
			.map(function (item) {
				return (
					"\t{ src: '" + item.src + "', name: '" + item.name + "', focus: [" +
					item.focus[0] + ', ' + item.focus[1] + '], zoom: ' + round(item.zoom) + ' },'
				);
			})
			.join('\n');
	}

	document.addEventListener('keydown', function (event) {
		if (event.target.matches('textarea, input')) return;
		if (event.ctrlKey || event.metaKey || event.altKey) return;

		if (event.code === 'Space') {
			event.preventDefault();
			armed = !armed;
			stage.toggleAttribute('data-armed', armed);
		} else if (event.key === 'Escape') {
			armed = false;
			stage.removeAttribute('data-armed');
			tiles.forEach(function (tile) {
				delete tile.el.dataset.revealed;
			});
		} else if (event.key.toLowerCase() === 'e' && output) {
			adjusting = !adjusting;
			stage.toggleAttribute('data-adjust', adjusting);
		}
	});

	writeValues();
}

function clamp(value, low, high) {
	return Math.min(high, Math.max(low, value));
}

function round(value) {
	return Math.round(value * 10) / 10;
}
