'use strict';

document.addEventListener('DOMContentLoaded', function () {

  console.log('Hi there');
  
  /* 
  function guessDelimiters (text, possibleDelimiters) {
    return possibleDelimiters.filter(weedOut);

    function weedOut (delimiter) {
        var cache = -1;
        return text.split('\n').every(checkLength);

        function checkLength (line) {
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
  */
  
  var csvReader = new FileReader();
  var readtable = document.getElementById('read_table');
  
  var csvfilename, data, headers;
  
  readtable.onchange = function (e) {
   var file = this.files[0];
   //console.log(file);
   csvfilename = file.name;
   csvReader.readAsText(file);
 }
 

  csvReader.onload = function (e) {
	var text = e.target.result;
	var lines = text.split(/[\r\n]+/g); // tolerate both Windows and Unix linebreaks
	for (var i = linestart; i < lines.length; i++) {
		lines[i] = lines[i].trim().replace(/\s{2,}/g, ' ');
	}
	data = [];
	//var delim = guessDelimiters(lines[linestart]+'\n'+lines[linestart+1], [' ','\t',','] );
	var linestart = 0, delimiter = ","; // delim[0]; 
	headers = lines[linestart].split(delimiter);
			//console.log(headers);
	for (var i = linestart+1; i < lines.length; i++) {
		var r = {};
		var linedata = lines[i].split(delimiter);
			//console.log(linedata);
		for (var k=0; k < linedata.length; k++ ){
			//console.log(headers[k]);
			//console.log(linedata[k]);
			r[headers[k]] = linedata[k];
		}
		data.push(r);
	}
	//headers.push("action");	
	
  
			var row, cell;
			const table = document.createElement("table");
			const tHead = table.createTHead();
			row = tHead.insertRow();
			headers.forEach(p => {
				cell = row.insertCell();
				cell.textContent = p;
				cell.style = "word-wrap:break-word";
				cell.tabIndex = 0;
			});
			
			const tBody = table.createTBody();
			for (const d of data) {
				row = tBody.insertRow();
				headers.forEach(p => {
					cell = row.insertCell();
					if(p === "filename") {
						cell.innerHTML  = "<button id=" + d["filename"] + " style='width: 39px; height: 20px;'>Plot</button>";
						cell.addEventListener("click", plotdata);
					} else {
						var v = isNaN(d[p]) ? d[p]: parseFloat(d[p]).toFixed(2); // toPrecision(6).
						cell.textContent = v;
					}
					
					/* if (p in d) {
						cell.textContent = d[p];
					} else {
						cell.innerHTML  = "<button id=" + d["filename"] + " style='width: 39px; height: 20px;'>Plot</button>";
						cell.addEventListener("click", plotdata);
					}*/
				});
			}
    document.body.appendChild(table);
  }

 	function plotdata(e) {
			// https://www.codemag.com/article/1511031/CRUD-in-HTML-JavaScript-and-jQuery
			var filename = e.target.id;
			console.log(filename);
			var http = new XMLHttpRequest();
			http.onreadystatechange = httpRequestfoo;
			http.open('GET', filename, true);
			http.send();
			// https://developer.mozilla.org/en-US/docs/Web/Guide/AJAX/Getting_Started
			//const { cellIndex: index } = target;
			//var t = document.getElementById(target).parents("tr");
			//window.alert(index);
		}
	
	function httpRequestfoo() {
		console.log('httpRequestfoo: Process the server response here.')
		 // Process the server response here.
	}


})
