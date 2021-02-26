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

  var fitParser = new FitParser({
	force: true,
	speedUnit: 'km/h',
	lengthUnit: 'm',
	temperatureUnit: 'celsius',
	elapsedRecordField: true,
	mode: 'list',
  });

  
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
				});
			}
    document.body.appendChild(table);
  }

 	function plotdata(e) {
			// https://www.codemag.com/article/1511031/CRUD-in-HTML-JavaScript-and-jQuery
			var filename = e.target.id;
			console.log(filename);
			var xhr = new XMLHttpRequest();
			//xhr.onreadystatechange = httpRequestfoo;
			xhr.onload = httpRequestfoo;
			xhr.open('GET', filename, true);
			xhr.responseType = 'arraybuffer'
			xhr.onerror = function (e) {
				console.log(error(xhr.statusText));
			};
			xhr.send(null);
			// https://stackoverflow.com/questions/7255719/downloading-binary-data-using-xmlhttprequest-without-overridemimetype
			//http.onload = function(e) {
			//	if (this.status == 200) {
			//		var blob = new Uint8Array(this.response);
			//		console.log(blob);
					/*
					var uInt8Array = new Uint8Array(this.response); // Note:not xhr.responseText
			 
					for (var i = 0, len = uInt8Array.length; i < len; ++i) {
						uInt8Array[i] = this.response[i];
					}
			 
					var byte3 = uInt8Array[4]; // byte at offset 4
					*/
			//	}
			//}
		}

		function httpRequestfoo() {
			if (this.readyState  === 4) {
		   		if (this.status === 200) {
				   	var blob = new Uint8Array(this.response);
			   		fitParser.parse(blob, function (error, data) {
						if (error) {
							console.error(error);
				   		} 
				   		else {
					 		//Here is the data as a JavaScript object. You can JSONify it or access the member as you need.
							console.log(data);
				   		}
			   		});
			   	}			
		  	}		
		}
   
		
	/*function httpRequestfoo() {
		 // Process the server response here.
		//console.log(this.status);
		//console.log(blob);
		if (this.status == 200) {
			var blob = new Uint8Array(this.response);
			console.log(blob.length);
			if ( blob.length > 0 ) {
			fitParser.parse(blob, function (error, data) {
				if (error) {
				  console.error(error);
				} 
				else {
				  //Here is the data as a JavaScript object. You can JSONify it or access the member as you need.
				  console.log(data);
				}
			});
			}			
		}		
	}*/


})
