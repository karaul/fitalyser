'use strict'

document.addEventListener('DOMContentLoaded', function () {

	//console.log('Hi there');

	//------------------  utilities -----------------------------//
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
	//------------------  utilities -----------------------------//

	//var csvReader = new FileReader();
	//var readtable = document.getElementById('read_table');
	var pathname;
	var data;
	var headers;
	var table;
	//var numberDiv = 0;

	var tableHeadersFlag;
	try {
		tableHeaders = tableHeaders;
		tableHeadersFlag = true;
	} catch (err) {
		tableHeadersFlag = false;
	}

	function errorNoFile(error,file, errorId) {
		console.log(error);
		switch (errorId) {
			case 1:
				alert("ERROR\nProbably file:\n" + file + "\ndoes not exist");
				break;
			case 2:
				alert("ERROR\nProbably file:\n" + file + "\ncorrupted");
				break;
			default:
				alert("ERROR\nfile:\n" + file);
				break;
		}
	}

	document.getElementById('fileauto').onchange = function (e) {
		document.getElementById('file').value = this.value;
		document.getElementById('file').style.width = ((this.value.length + 1) * 8) + 'px';
		table.remove();
		document.getElementById('openFile').dispatchEvent(new Event('click'));
	}
			
	document.getElementById('openFile').onclick = function (e) {
		const file = document.getElementById('file').value;
		const filenamexhr = file.indexOf("../") < 0 ? file:
			file.replace(/\.\./g, 'LevelUp').
			replace(/LevelUp\//g, 'LevelUp').replace(/\/LevelUp/g, 'LevelUp');
		//console.log(filenamexhr);
		let xhr = new XMLHttpRequest();			
		xhr.onload = function() {
			if (this.readyState  === 4) {
			   if (this.status === 200) {
					const text = this.response;
					//console.log(text);
					// store pathname for future access
					let i = filenamexhr.indexOf("/");
					let idx = i;
					while (i != -1) { idx = i; i = filenamexhr.indexOf("/", idx + 1) }
					pathname = filenamexhr.slice(0,idx) || "LevelUpfitalyser";
					//console.log(pathname);
					parseTable(text);
				}			
				if (this.status === 404) {
					errorNoFile("status 404",file, 1);	
				}
			}
		}
		xhr.open('GET', decodeURI(filenamexhr), true);
		//xhr.responseType = 'arraybuffer';
		xhr.onerror = function (e) {
			console.log(error(xhr.statusText));	
		}
		xhr.send(null);				
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

 	let windowFitplotter = null;

	function plotdata(e) {
		// e.target.id contains cell content = name of the FIT file
		// https://www.codemag.com/article/1511031/CRUD-in-HTML-JavaScript-and-jQuery
		let filename = pathname.indexOf("LevelUp") < 0 ?
			"./fitalyser/" + pathname: pathname.replace("LevelUp","");
		filename += "/" + e.target.id; 
		//console.log(filename);
	 	if (windowFitplotter == null || windowFitplotter.closed) {
			filename = filename.replace("+", "plus");
			windowFitplotter = window.open('LevelUp/fitplotter/index.html?file=' + encodeURI(filename));
		} else {
			var windowFitplotterFiles = windowFitplotter.document.getElementById("files");
			windowFitplotterFiles.options.add(new Option(filename, filename));
			windowFitplotterFiles.value = filename;
			windowFitplotterFiles.dispatchEvent(new Event('change'));
			windowFitplotter.focus();
	 	}
 	}


	/*readtable.onchange = function (e) {
		var file = this.files[0];
		//console.log(file);
		csvfilename = file.name;
		csvReader.readAsText(file);
	}

	csvReader.onload = function (e) {
		var text = e.target.result;
		//console.log(text);
		parseTable(text);
	}*/

	function parseTable(text) {
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
		makeTable();
	}

	//--------------- create and fill the table ------------------
	function makeTable() {

		//var tableDiv = document.createElement('div');
		//tableDiv.id = 'divtable' + toString(numberDiv);
		//numberDiv +=1;
		//tableDiv.height = "600px";
		//iDiv.className = 'block';
		//document.getElementsByTagName('body')[0].appendChild(tableDiv);

		var row, cell;
		table = document.createElement("table");
		table.style.display = "block";
		table.style.overflow = "auto";
		table.style.height = "700px";
		table.style.width = "auto";

		const tHead = table.createTHead();
		row = tHead.insertRow();
		row.style = "color: #fff; background-color: #555;";
		//row.style.position = "sticky";
		//row.style.top = "0";
		let cellstyle = "text-align:right; word-wrap:break-word; position:sticky; top:0;";
		headers.forEach(p => {			
			if (tableHeadersFlag) {
				if (p in tableHeaders) {
					cell = row.insertCell();
					cell.textContent = tableHeaders[p].name;
					cell.style = cellstyle + " " + tableHeaders[p].style;
					cell.tabIndex = 0;
				}
			} else {
				cell = row.insertCell();
				cell.textContent = p;
				cell.style = cellstyle;
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
		//style="display: block; height: 100px; overflow: auto;"
		document.body.appendChild(table);
		//tableDiv.appendChild(table);
		//resizableGrid(table);
	}
	//----- create and fill the table ------------------

	//------- make nice view of the table -------------
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
	//----------- make nice view of the table ------------------

	document.getElementById('openFile').dispatchEvent(new Event('click'));
})