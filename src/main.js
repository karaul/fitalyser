'use strict';

document.addEventListener('DOMContentLoaded', function () {

	//console.log('Hi there');


	function guessDelimiters(text, possibleDelimiters) {
		return possibleDelimiters.filter(weedOut);

		function weedOut(delimiter) {
			var cache = -1;
			return text.split('\n').every(checkLength);

			function checkLength(line) {
				if (!line) {
					return true;
				}

				var length = line.split(delimiter).length;
				if (cache < 0) {
					cache = length;
				}
				return cache === length && length > 1;
			}
		}
	}

	function sortByColumn({ target }) {
		const order = (target.dataset.order = -(target.dataset.order || -1));
		const { cellIndex: index } = target;
		const collator = new Intl.Collator(["en", "ru"], {
			numeric: true
		});
		const comparator = (index, order) => (a, b) => order * collator.compare(
			a.children[index].textContent,
			b.children[index].textContent
		);
		for(const tBody of target.closest("table").tBodies)
			tBody.append(...[...tBody.rows].sort(comparator(index, order)));

		for(const cell of target.parentNode.cells)
			cell.classList.toggle("sorted", cell === target);
	}



	var csvReader = new FileReader();
	var readtable = document.getElementById('read_table');

	var csvfilename, data, headers;

	var tableHeadersFlag;
	try {
		tableHeaders = tableHeaders;
		tableHeadersFlag = true;
	} catch (err) {
		tableHeadersFlag = false;
	}


	/*
  var fitParser = new FitParser({
	force: true,
	speedUnit: 'km/h',
	lengthUnit: 'm',
	temperatureUnit: 'celsius',
	elapsedRecordField: true,
	mode: 'list',
  });
  */


	readtable.onchange = function (e) {
		var file = this.files[0];
		//console.log(file);
		csvfilename = file.name;
		csvReader.readAsText(file);
	}


	csvReader.onload = function (e) {
		var text = e.target.result;
		//console.log(text);
		var lines = text.split(/[\r\n]+/g); // tolerate both Windows and Unix linebreaks
		for (var i = linestart; i < lines.length; i++) {
			lines[i] = lines[i].trim().replace(/\s{2,}/g, ' ');
		}
		data = [];
		var linestart = 0;
		var possibleDelimiters = guessDelimiters(lines[linestart] + '\n' + lines[linestart + 1], [' ', ',', '\t']).sort();
		//console.log(possibleDelimiters);	
		//var delimiter = ","; 
		var delimiter = possibleDelimiters[0];
		headers = lines[linestart].split(delimiter);
		//console.log(headers);
		for (var i = linestart + 1; i < lines.length; i++) {
			var r = {};
			var linedata = lines[i].split(delimiter);
			//console.log(linedata);
			for (var k = 0; k < linedata.length; k++) {
				//console.log(headers[k]);			
				//console.log(linedata[k]);
				if (tableHeadersFlag) {
					if (headers[k] in tableHeaders || headers[k] === "filename") {
						r[headers[k]] = linedata[k];
					}
				} else {
					r[headers[k]] = linedata[k];
				}
			}
			data.push(r);
		}

		// sort out headers accoreing to tableHeaders
		if (tableHeadersFlag) {
			var kput = 0;
			for (const [key, value] of Object.entries(tableHeaders)) {
				for (k = 0; k < headers.length; k++) {
					if (key === headers[k]) {
						var h = headers[kput];
						headers[kput] = headers[k];
						headers[k] = h;
						kput++;
						break;
					}
				}
			}
		};
		//  remove unnecessary entries from the headers
		for (k = headers.length - 1; k >= kput; k--) {
			headers.pop();
		}

		// add header for the Plot button
		headers.push("Plot");
		if (tableHeadersFlag) tableHeaders.Plot = {
			name: "Plot",
			style: "width: 30px"
		};

		var row, cell;
		const table = document.createElement("table");
		const tHead = table.createTHead();
		row = tHead.insertRow();
		var w = 100 / (headers.length);
		row.style = "color: #fff; background-color: #555";
		headers.forEach(p => {
			if (tableHeadersFlag) {
				if (p in tableHeaders) {
					cell = row.insertCell();
					cell.textContent = tableHeaders[p].name;
					cell.style = "text-align:right; word-wrap:break-word; " + tableHeaders[p].style;
					cell.tabIndex = 0;
				}
			} else {
				cell = row.insertCell();
				cell.textContent = p;
				cell.style = "text-align:right; word-wrap:break-word; "
				cell.tabIndex = 0;
			}
		});
		tHead.addEventListener("click", sortByColumn);
		tHead.addEventListener("keyup", sortByColumn);


		const tBody = table.createTBody();
		for (const d of data) {
			row = tBody.insertRow();
			headers.forEach(p => {
				cell = row.insertCell();
				if (p === "Plot") {
					cell.innerHTML = "<button id=" + d["filename"] + " style='width: 39px; height: 20px;'>Plot</button>";
					cell.addEventListener("click", plotdata);
				} else {
					var v = isNaN(d[p]) ? (d[p] === "undefined" ? " " : d[p]) :
						parseFloat(d[p]).toFixed(2); // toPrecision(6).
					cell.textContent = v;
				}
				cell.style = "text-align:right; word-wrap:break-word; "
			});
		}
		document.body.appendChild(table);
		//resizableGrid(table);
	}

	var windowFitplotter = null;

	function plotdata(e) {
		// https://www.codemag.com/article/1511031/CRUD-in-HTML-JavaScript-and-jQuery
		var filename = e.target.id;
		if (windowFitplotter == null || windowFitplotter.closed) {
			filename = filename.replace("+", "plus");
			windowFitplotter = window.open('fitplotter.html?file=' + encodeURI(filename));
		} else {
			var windowFitplotterFiles = windowFitplotter.document.getElementById("files");
			windowFitplotterFiles.options.add(new Option(filename, filename));
			windowFitplotterFiles.value = filename;
			windowFitplotterFiles.dispatchEvent(new Event('change'));
			windowFitplotterFiles.focus();
		}

	}

	function resizableGrid(table) {
		var row = table.getElementsByTagName('tr')[0],
			cols = row ? row.children : undefined;
		if (!cols) return;

		table.style.overflow = 'hidden';

		var tableHeight = table.offsetHeight;

		for (var i = 0; i < cols.length; i++) {
			var div = createDiv(tableHeight);
			cols[i].appendChild(div);
			cols[i].style.position = 'relative';
			setListeners(div);
		}

		function setListeners(div) {
			var pageX, curCol, nxtCol, curColWidth, nxtColWidth;

			div.addEventListener('mousedown', function (e) {
				curCol = e.target.parentElement;
				nxtCol = curCol.nextElementSibling;
				pageX = e.pageX;

				var padding = paddingDiff(curCol);

				curColWidth = curCol.offsetWidth - padding;
				if (nxtCol)
					nxtColWidth = nxtCol.offsetWidth - padding;
			});

			div.addEventListener('mouseover', function (e) {
				e.target.style.borderRight = '2px solid #0000ff';
			})

			div.addEventListener('mouseout', function (e) {
				e.target.style.borderRight = '';
			})

			document.addEventListener('mousemove', function (e) {
				if (curCol) {
					var diffX = e.pageX - pageX;

					if (nxtCol)
						nxtCol.style.width = (nxtColWidth - (diffX)) + 'px';

					curCol.style.width = (curColWidth + diffX) + 'px';
				}
			});

			document.addEventListener('mouseup', function (e) {
				curCol = undefined;
				nxtCol = undefined;
				pageX = undefined;
				nxtColWidth = undefined;
				curColWidth = undefined
			});
		}

		function createDiv(height) {
			var div = document.createElement('div');
			div.style.top = 0;
			div.style.right = 0;
			div.style.width = '5px';
			div.style.position = 'absolute';
			div.style.cursor = 'col-resize';
			div.style.userSelect = 'none';
			div.style.height = height + 'px';
			return div;
		}

		function paddingDiff(col) {

			if (getStyleVal(col, 'box-sizing') == 'border-box') {
				return 0;
			}

			var padLeft = getStyleVal(col, 'padding-left');
			var padRight = getStyleVal(col, 'padding-right');
			return (parseInt(padLeft) + parseInt(padRight));

		}

		function getStyleVal(elm, css) {
			return (window.getComputedStyle(elm, null).getPropertyValue(css))
		}
	};


})