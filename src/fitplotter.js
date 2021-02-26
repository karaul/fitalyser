'use strict';

// Add an event listener of DOMContentLoaded to the whole document and call an anonymous function.
// You can then wrap your code in that function's brackets
// and it will execute once loading is complete.

document.addEventListener('DOMContentLoaded', function () {

		console.log('fitplotter says Aloha');

		const swap = (arr, x, y) => [arr[x], arr[y]] = [arr[y], arr[x]];
		const calcMiddle = (x, y) => ~~((x + y) / 2);


		function median(arr) {
			let low = 0;
			let high = arr.length - 1;
			let middle, ll, hh;
			let median = calcMiddle(low, high);

			while (true) {
				if (high <= low) { // One element only
					return arr[median];
				}

				if (high == low + 1) { // Two elements only
					if (arr[low] > arr[high])
						swap(arr, low, high);
					return arr[median];
				}

				// Find median of low, middle and high items; swap into position low
				middle = calcMiddle(low, high);
				if (arr[middle] > arr[high]) swap(arr, middle, high);
				if (arr[low] > arr[high]) swap(arr, low, high);
				if (arr[middle] > arr[low]) swap(arr, middle, low);

				// Swap low item (now in position middle) into position (low+1)
				swap(arr, middle, low + 1);

				// Nibble from each end towards middle, swapping items when stuck
				ll = low + 1;
				hh = high;
				while (true) {
					do ll++; while (arr[low] > arr[ll]);
					do hh--; while (arr[hh] > arr[low]);

					if (hh < ll)
						break;

					swap(arr, ll, hh);
				}

				// Swap middle item (in position low) back into correct position
				swap(arr, low, hh);

				// Re-set active partition
				if (hh <= median)
					low = ll;
				if (hh >= median)
					high = hh - 1;
			}
		}

		function averfilter(a, bin) {
			var bin2p1 = 1 + 2 * bin,
				n = a.length;
			var af = [];
			for (var i = 0; i < n; i++) {
				var s = 0;
				for (var k = 0; k < bin2p1; k++) {
					var ipk = i + k - bin;
					s += ipk >= 0 ? (ipk < n ? a[ipk] : a[n - 1]) : a[0];
				}
				af.push(s / bin2p1);
			}
			return af;
		}


		function medfilter(a, bin) {
			var bin2p1 = 1 + 2 * bin,
				n = a.length;
			var dm = Array(bin2p1).fill(a[0]);
			var af = [];
			for (var i = 0; i < n; i++) {
				for (var k = 0; k < bin2p1; k++) {
					var ipk = i + k - bin;
					dm[k] = (ipk >= 0 ? (ipk < n ? a[ipk] : a[n - 1]) : a[0]);
				}
				af.push(median(dm));
			}
			return af;
		}

		//var fReader = new FileReader();
		//var fileInput = document.getElementById('myfile');

		//var fitParser = new FitParser();
		//var fileInput = document.getElementById('myfile');

		var fitParser = new FitParser({
			force: true,
			speedUnit: 'km/h',
			lengthUnit: 'm',
			temperatureUnit: 'celsius',
			elapsedRecordField: true,
			mode: 'list',
		});

		/*
		const queryString = window.location.search;//href;
		const urlParams = new URLSearchParams(queryString);
		const fitfilename = urlParams.get('file')
		console.log(fitfilename);				
		document.getElementById('myfile').value = fitfilename;
		console.log(document.getElementById('myfile').value);				
		*/

		//document.getElementById('myfile').onclick = function () {
		//}

		/*document.getElementById('myfile').onchange = function () {
			//const queryString = window.location.href;
			//console.log(queryString);
			var file = this.files[0];
			//var file = e.target.files[0];
			//console.log(file);
			fReader.readAsArrayBuffer(file);
		}*/

		function randomColorFactor() {
			return Math.round(Math.random() * 255);
		}

		function randomColor(opacity) {
			return (
				"rgba(" +
				randomColorFactor() +
				"," +
				randomColorFactor() +
				"," +
				randomColorFactor() +
				"," +
				(opacity || ".3") +
				")"
			);
		}

		function automodePlot(yaxisshow) {
			var yadded = [];
			if (document.getElementById('openmode').value === "automode") {
				chartdata = chartdata || [];
				if (chartdata.length > 0) {
					for (var c of chartdata) {
						var y = c.name.split(" ")[0];
						if (!yadded.includes(y)) yadded.push(y);
					}
				} else {
					var x = document.getElementById('xaxis').value;
					for (var y of yaxisshow) {
						if (yOptions[x].includes(y)) yadded.push(y);
					}
				}
				for (var y of yadded) {
					document.getElementById('ylist').value = y;
					document.getElementById('ylist').dispatchEvent(new Event('change'));
				}
			}
			return yadded.length;
		}


		function getDataFromFitForCanvasJS(fitdatalocal, fieldx, fieldy) {
			var dataPoints = [];
			if (fieldx === "timestamp" && fieldy.slice(0, 3) === "lap") {
				for (var k = 0; k < fitdatalocal.laps.length; k++) {
					dataPoints.push({
						x: fitdatalocal.laps[k].start_time,
						y: (fieldy === "lap_avg_heart_rate") ?
							fitdatalocal.laps[k].avg_heart_rate : fitdatalocal.laps[k].total_elapsed_time,
						//y: k,
						indexLabel: (k % 4 == 0) ? k.toString() : ""
					});
				}
			} else {
				if (fieldx === "lap_number") {
					for (var k = 0; k < fitdatalocal.laps.length; k++) {
						dataPoints.push({
							x: k,
							y: fitdatalocal.laps[k][fieldy],
						});
					}
				} else {
					for (var k in fitdatalocal.records) {
						var x = fitdatalocal.records[k][fieldx];
						if (isNaN(x)) {} else {
							dataPoints.push({
								x: x,
								y: fitdatalocal.records[k][fieldy]
							});
						}
					}
				}
			}
			return dataPoints;
		}

		document.getElementById('xaxis').onchange = function (e) {
			// assign ylist options depending on xaxis	
			document.getElementById('clean').dispatchEvent(new Event('click'));
			document.getElementById("ylist").options.length = 0;
			var xaxis = document.getElementById('xaxis').value;
			var ylist = yOptions[xaxis];
			//console.log(ylist);
			for (var k = 0; k < ylist.length; k++) {
				//console.log(ylist[k]);
				document.getElementById("ylist").options.add(new Option(ylist[k], ylist[k]));
			}
			axisXops.title = xaxisLabel[xaxis];
			document.getElementById('update').dispatchEvent(new Event('click'));
		}

		document.getElementById('ylist').onchange = function (e) {
			var yobj = document.getElementById('ylist');
			var xobj = document.getElementById('xaxis');
			//console.log(document.getElementById('yaxis2').value);
			var axisYIndex, axisYType = "undefined";
			var color = randomColor(1);
			var aa = [axisYops, axisY2ops];
			aaloop:
				for (var kk in aa) {
					var a = aa[kk];
					for (var k in a) {
						if (a[k].title === yobj.value) {
							axisYIndex = k;
							axisYType = (kk == 0 ? "primary" : "secondary");
							break aaloop;
						}
					}
				}
			//console.log(document.getElementById('yaxis2').value );
			if (axisYType === "undefined") {
				switch (yobj.value) {
					case "heart_rate" || "lap_avg_heart_rate":
						color = "#ff0000";
						break;
					case "pace" || "lap_time":
						color = "#0000ff";
						break;
					case "HRE":
						color = "#00ff00";
						break;
					default:
				}
				if (axisYops.length < axisY2ops.length + 1) {
					axisYType = "primary";
					axisYops.push({
						title: yobj.value,
						lineColor: color,
						autoCalculate: true,
						labelFontSize: 15,
						titleFontSize: 15,
						gridThickness: 0.15,
						crosshair: {
							enabled: false,
							snapToDataPoint: true
						}
					});
					axisYIndex = axisYops.length - 1;
				} else {
					axisYType = "secondary";
					axisY2ops.push({
						title: yobj.value,
						lineColor: color,
						autoCalculate: true,
						labelFontSize: 15,
						titleFontSize: 15,
						gridThickness: 0
					});
					axisYIndex = axisY2ops.length - 1;
				}
			}

			//var datapoints = getDataFromFitForCanvasJS(fitdata, xobj.value, yobj.value);
			var chartdataType = "line",
				markerType = "none",
				markerSize = 0;
			if (yobj.value.slice(0, 3) === "lap" && xobj.value === "timestamp") {
				chartdataType = "scatter";
				markerType = "triangle";
				markerSize = 8;
			}
			if (xobj.value === "lap_number") {
				chartdataType = "column";
			}
			//console.log(chartdataType);
			chartdata = chartdata || [];
			chartdata.push({
				color: color,
				lineThickness: 0.5,
				type: chartdataType, //"line", // "scatter"
				markerType: markerType,
				markerSize: markerSize,
				showInLegend: true,
				//name: yobj.value + " " + new Intl.DateTimeFormat('ru-RU').format(fitdata.activity.local_timestamp),
				// see also line 332
				name: yobj.value + " " + new Intl.DateTimeFormat('ru-RU').format(local_timestamp),
				axisYType: axisYType, //document.getElementById('yaxis2').value,
				axisYIndex: axisYIndex,
				indexLabelPlacement: "inside",
				indexLabelFontSize: 15,
				dataPoints: getDataFromFitForCanvasJS(fitdata, xobj.value, yobj.value)
			});

			chart.render();
		}


		var chartdata = [];
		var axisXops = {
			crosshair: {
				enabled: true,
				snapToDataPoint: true,
				updated: updateMapPosition
			},
			gridThickness: 0.15,
			titleFontSize: 15,
			labelFontSize: 15,
			labelAngle: 0
		};
		var axisYops = [],
			axisY2ops = [];

		var yOptions = {
			distance: [],
			timestamp: ["lap_avg_heart_rate", "lap_time"],
			lap_number: []
		};
		var xaxisLabel = {
			distance: "distance, km",
			timestamp: "time from the start, hours",
			lap_number: "lap number"
		};


		var chart = new CanvasJS.Chart("plotarea", {
			zoomEnabled: true,
			zoomType: "x", // "x","y", "xy"
			rangeChanging: updateMapSegment,
			//animationEnabled: true,
			theme: "light2", // "light1", "light2", "dark1", "dark2"		
			axisX: axisXops,
			axisY: axisYops,
			axisY2: axisY2ops,
			legend: {
				fontSize: 15,
				cursor: "pointer",
				itemclick: toggleDataSeries
			},
			data: chartdata
		});

		var activeLine;
		var modal = document.getElementById("myModal");

		document.getElementById("lineThickness").onchange = function () {
			chart.data[activeLine].set("lineThickness", this.value);
		}

		document.getElementById("lineColοr").oninput = function () {
			chart.data[activeLine].set("color", this.value);
		}

		window.onclick = function (event) {
			if (event.target == modal) {
				modal.style.display = "none";
			}
		}

		var span = document.getElementsByClassName("close")[0].onclick = function () {
			modal.style.display = "none";
		}


		function updateMapSegment(e) {
			//console.log(document.getElementById('xaxis').value);
			if (document.getElementById('xaxis').value === "lap_number") {} else {
				if (e.trigger === "zoom") {
					var xMin = e.axisX[0].viewportMinimum;
					xMin = (xMin == null) ? chart.axisX[0].get("minimum") : xMin;
					var xMax = e.axisX[0].viewportMaximum || e.axisX[0].maximum;
					xMax = (xMax == null) ? chart.axisX[0].get("maximum") : xMax;
					var xname = document.getElementById('xaxis').value;
					var ycalc = Array(chartdata.length).fill(0),
						npts = 0;
					//console.log(ycalc);
					//console.log(chartdata);
					if (withGPS) mapSegment.setLatLngs([
						[]
					]);
					// the faster way : (1) find first index at x=xmin, and (2) do loop till xmax ?
					for (let k in fitdata.records) {
						//for (var k=0; k < chart.data[0].dataPoints.length; k++){
						var record = fitdata.records[k];
						if (record[xname] >= xMin && record[xname] <= xMax) {

							if (withGPS && !(isNaN(record["position_lat"]) || isNaN(record["position_long"])))
								mapSegment.addLatLng([record["position_lat"], record["position_long"]]);

							npts++;

							for (var n = 0; n < chartdata.length; n++) {
								if (chartdata[n].type === "scatter") {} else {
									if (k < chartdata[n].dataPoints.length) {
										if ("y" in chartdata[n].dataPoints[k]) {
											ycalc[n] += isNaN(chartdata[n].dataPoints[k].y) ? 0 : chartdata[n].dataPoints[k].y;
										}
									}
								}
							}
						}
					}

					var averinfo = ""; //"Parameter  Average";
					for (var n = 0; n < chartdata.length; n++) {
						//console.log(chartdata[n].type);
						if (chartdata[n].type === "scatter") {} else {
							ycalc[n] = ycalc[n] / npts;
							averinfo = averinfo + "<b>" + chartdata[n].name + "</b>: " + ycalc[n].toFixed(2) + "<br/>";
						}
					}
					//console.log(averinfo);
					//console.log(npts);
					//console.log(ycalc);
					//alert(averinfo);
					mapSegmentInfo = L.popup({
							autoClose: true
						}).setLatLng(mapSegment.getCenter())
						.setContent(averinfo).openOn(mymap);
				} else if (e.trigger === "reset") {
					if (withGPS) mapSegment.setLatLngs([
						[]
					]);
				}
			}
		}

		function updateMapPosition(e) {
			if (withGPS) {
				var xgiven = e.value;
				var xname = document.getElementById('xaxis').value;
				var record = {};
				for (let k in fitdata.records) {
					record = fitdata.records[k];
					if (record[xname] === xgiven) break
				}
				//console.log([ record["position_lat"], record["position_long"] ] );
				if (!(isNaN(record["position_lat"]) || isNaN(record["position_long"])))
					mapPosition.setLatLng([record["position_lat"], record["position_long"]]);
			}
		}

		/*function toggleDataSeries(e) {
			if (typeof (e.dataSeries.visible) === "undefined" || e.dataSeries.visible) {
				e.dataSeries.visible = false;
			} else {
				e.dataSeries.visible = true;
			}
			e.chart.render();
		}*/
		function toggleDataSeries(e) {
			switch (document.getElementById('legendaction').value) {
				case "hide_show":
					if (typeof (e.dataSeries.visible) === "undefined" || e.dataSeries.visible) {
						e.dataSeries.visible = false;
					} else {
						e.dataSeries.visible = true;
					}
					break;

				case "change":
					for (var k in chart.data) {
						var c = chart.data[k];
						if (c.name == e.dataSeries.name) {
							activeLine = k;
							modal.style.display = "block";
							var color = c.get("color"),
								hexcolor;
							if (color[0] == "#") {
								hexcolor = color;
							} else {
								const rgba = color.replace(/^rgba?\(|\s+|\)$/g, '').split(',');
								hexcolor = `#${((1 << 24) + (parseInt(rgba[0]) << 16) + (parseInt(rgba[1]) << 8) + parseInt(rgba[2])).toString(16).slice(1)}`;

							}
							//console.log(hexcolor);						
							document.getElementById("lineColοr").value = hexcolor;
							document.getElementById("lineThickness").value = c.get("lineThickness");
							break;
						}
					}
					break;

				case "remove_curve":
					for (var c of chart.data) {
						if (c.name == e.dataSeries.name) {
							c.remove();
							break;
						}
					}
					break;

				case "filter_curve":
					var medfil1bin = document.getElementById('medfil1bin').value;
					var averfil1bin = document.getElementById('averfil1bin').value;
					var yold;
					for (var k in chart.data) {
						var c = chart.data[k];
						if (c.name == e.dataSeries.name) {
							activeLine = k;
							yold = c.name;
							break;
						}
					}
					var xy = chart.data[activeLine].get("dataPoints");
					var y = [];
					for (var i = 0; i < xy.length; i++) {
						y.push(xy[i].y)
					}
					var yfiltered = medfilter(y, medfil1bin);
					var yfiltered2 = averfilter(yfiltered, averfil1bin);
					for (var i = 0; i < xy.length; i++) {
						xy[i].y = yfiltered2[i]
					}

					chart.data[activeLine].set("dataPoints", xy);
					chart.data[activeLine].set("lineThickness", 2);
					chart.data[activeLine].set("name", yold + " filter " + medfil1bin + "/" + averfil1bin);

					document.getElementById('ylist').value = yold.split(" ")[0];
					document.getElementById('ylist').dispatchEvent(new Event('change'));

					document.getElementById('medfil1bin').value = 0;
					document.getElementById('averfil1bin').value = 0;
					document.getElementById('legendaction').value = "hide_show";
					break;
				default:
			}
			e.chart.render();
		}

		var fitdata = {},
			trackdata = [],
			local_timestamp = '';

		var mymap = L.map('map');
		if (navigator.onLine) {
			L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
				attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
			}).addTo(mymap);
			// or with mapbox
			//const mapbox_access_token = 'pk.eyJ1Ijoia2FyYXVsIiwiYSI6ImNra3JqczZ1bzBwMGMycHBmdXRiMXZ0dTIifQ.fZTV-Hvc1R_25VWOKmhRlQ';
			//L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=' + mapbox_access_token, 
			//{
			//	attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
			//	maxZoom: 18,
			//	id: 'mapbox/streets-v11',
			//}).addTo(mymap);
		}

		var Ltracks = [];
		var Lpopups = [];
		var mapPosition = {},
			mapSegment = {},
			mapSegmentInfo = {},
			withGPS;

		function loadFitFile(blob) {
			//console.log(e.target.result); /// <-- this contains an ArrayBuffer
			//var ylist = [];
			var timeStartFitParsing = performance.now();

			fitParser.parse(blob, function (error, data) {
				if (error) {
					console.log(error);
				} else {
					console.log(data);
					//console.log(data.laps);
					if ("activity" in data) {
						local_timestamp = ("local_timestamp" in data.activity ?
							data.activity.local_timestamp : data.records[0].timestamp);
					} else {
						local_timestamp = data.records[0].timestamp;
					}
					var D = new Date(data.records[0].timestamp);
					var timeoffset = D.getHours() + D.getMinutes() / 60;
					var paceFlag = false;
					var hreFlag = false;
					for (var k in data.records) {
						var record = data.records[k];
						D = new Date(record.timestamp);
						data.records[k].timestamp = D.getHours() + D.getMinutes() / 60 - timeoffset;
						data.records[k].distance = isNaN(record.distance) ? NaN : record.distance / 1000;
						paceFlag = paceFlag || ("speed" in record && !isNaN(record.speed)) ||
							("enhanced_speed" in record && !isNaN(record.enhanced_speed));
						if (paceFlag) {
							var speed = ("speed" in record && !isNaN(record.speed)) ? record.speed : record.enhanced_speed;
							data.records[k].pace = (speed > 0 ? 60 / speed : NaN);
							hreFlag = hreFlag || (paceFlag && "heart_rate" in record && !isNaN(record.heart_rate));
							if (hreFlag)
								data.records[k].HRE = (speed > 0 ? record.heart_rate * 60 / speed : NaN);
						}
					}
					paceFlag = false;
					hreFlag = false;
					for (var k in data.laps) {
						var record = data.laps[k];
						D = new Date(record.start_time);
						data.laps[k].start_time = D.getHours() + D.getMinutes() / 60 - timeoffset;
						paceFlag = paceFlag || ("avg_speed" in record && !isNaN(record.avg_speed)) ||
							("enhanced_avg_speed" in record && !isNaN(record.enhanced_avg_speed));
						if (paceFlag) {
							var speed = ("avg_speed" in record && !isNaN(record.avg_speed)) ? record.avg_speed : record.enhanced_avg_speed;
							data.laps[k].avg_pace = (speed > 0 ? 60 / speed : NaN);
							hreFlag = hreFlag || (paceFlag && "avg_heart_rate" in record && !isNaN(record.avg_heart_rate));
							if (hreFlag)
								data.laps[k].avg_HRE = (speed > 0 ? record.avg_heart_rate * 60 / speed : NaN);
						}
					}

					fitdata = data;

					//var l=document.getElementById('xaxis').options = chartdata || [];
					if (document.getElementById('xaxis').options.length == 0) {
						for (var [ykey, yrecords] of Object.entries({
								distance: "records",
								timestamp: "records",
								lap_number: "laps"
							})) {
							//console.log(ykey);
							//console.log(yrecords);
							document.getElementById('xaxis').options.add(new Option(ykey, ykey));
							for (var datarow of data[yrecords]) {
								for (var [key, value] of Object.entries(datarow)) {
									yOptions[ykey] = yOptions[ykey] || [];
									if (!(yOptions[ykey].includes(key) || ykey === key)) {
										yOptions[ykey].push(key);
									}
								}
							}
							// sort out
							yOptions[ykey].sort();
						}

						// set default xaxis as "distance"
						document.getElementById('xaxis').value = "distance";
						// set ylistOptions for xaxis = distance
						document.getElementById('xaxis').dispatchEvent(new Event('change'));
					} else {
						document.getElementById('update').dispatchEvent(new Event('click'));
					}
				}
			});

			var timeEndFitParsing = performance.now();
			console.log('fit file parsing takes: ' + parseFloat(timeEndFitParsing - timeStartFitParsing) + ' ms');
			//console.log( timeEndFitParsing - timeStartFitParsing );


			// now work with leallet 
			trackdata = [];
			var latt_aver = 0,
				long_aver = 0,
				n = 0;

			for (var i in fitdata.records) {
				var record = fitdata.records[i];
				var x = record.position_lat;
				var y = record.position_long;
				if (isNaN(x) || isNaN(y)) {} else {
					trackdata.push([x, y]);
					latt_aver += x;
					long_aver += y;
					n++;
				}
			};
			latt_aver = latt_aver / n;
			long_aver = long_aver / n;
			withGPS = !(isNaN(latt_aver) || isNaN(long_aver));

			//var trackcolor = ;
			//trackcolor = 'rgba(135,35,67, 0.2)'
			//console.log(trackcolor);
			/*Ltrack.on('click', function(e) {
				alert(e.latlng);
			});*/

			if (withGPS) {

				mymap.setView([latt_aver, long_aver], 14);

				var givencolors = ["blue", "green", "magenta", "brown", "purple", "olive"];
				var k = Ltracks.length % givencolors.length;
				Ltracks.push(L.polyline(trackdata, {
					color: givencolors[k]
				}).addTo(mymap));

				Lpopups.push(
					L.popup({
						autoClose: false
					}).setLatLng(trackdata[Math.round(Math.random() * (trackdata.length - 1) / 2)])
					.setContent(new Intl.DateTimeFormat('ru-RU').format(local_timestamp)).openOn(mymap)
				);

				if (!mymap.hasLayer(mapPosition)) {
					mapPosition = L.circleMarker(trackdata[0], {
						color: 'red',
						fillColor: '#f03',
						fillOpacity: 0.5,
						radius: 5
					}).addTo(mymap);
				} else {
					mapPosition.bringToFront();
				}

				if (!mymap.hasLayer(mapSegment)) {
					mapSegment = L.polyline([
						[]
					], {
						color: "red",
						weight: 5
					}).addTo(mymap);
				} else {
					mapSegment.bringToFront();
				}
			} else {
				var faketrack = [ // fake segment to get popup with averaged
					//[35.156025,33.3766633], // Nicosia
					//[55.752121, 37.617664], // Moscow
					[55.830431, 49.066081] // Kazan
				];
				mymap.setView(faketrack[Math.round(Math.random() * (trackdata.length - 1) / 2)], 14);
				mapSegment = L.polyline(faketrack, {
					color: "red",
					weight: 5
				}).addTo(mymap);
			}

		};


		document.getElementById('update').onclick = function (e) {
			automodePlot(["heart_rate", "pace", "HRE"]) == 0 ?
				(automodePlot(["speed"]) == 0 ?
					(automodePlot(["total_elapsed_time", "avg_heart_rate", "avg_HRE"]) == 0 ?
						(automodePlot(["avg_pace", "avg_heart_rate", "avg_HRE"]) == 0 ?
							automodePlot(["altitude"]) : null) : null) : null) : null;

		}

		document.getElementById('zoom').onchange = function (e) {
			var zoom = document.getElementById('zoom').value;
			chart.axisX[0].crosshair.set("enabled", zoom.indexOf("x") >= 0);
			for (var k = 0; k < chart.axisY.length; k++) {
				chart.axisY[k].crosshair.set("enabled", zoom.indexOf("y") >= 0);
			}
			//chart.set("zoomType", document.getElementById('zoom').value);
			chart.set("zoomType", zoom);
		}

		//document.getElementById("enableZoom").addEventListener("click",function(){
		//	chart.set("zoomEnabled", true, false);								
		//});

		document.getElementById('clean').onclick = function (e) {

			// reset zoom
			chart.options.axisX.viewportMinimum = chart.options.axisX.viewportMaximum = null;
			// reset y-axis
			document.getElementById('ylist').value = null;

			for (var k = axisYops.length - 1; k >= 0; k--) {
				axisYops.pop()
			}
			for (var k = axisY2ops.length - 1; k >= 0; k--) {
				axisY2ops.pop()
			}
			for (var k = chartdata.length - 1; k >= 0; k--) {
				chartdata.pop()
			}
			chart.render();

			if (withGPS) {
				for (var k = 0; k < Ltracks.length - 1; k++) {
					mymap.removeLayer(Ltracks[k]);
				}
				Ltracks = Ltracks.slice(-1);

				for (var k = 0; k < Lpopups.length - 1; k++) {
					mymap.removeLayer(Lpopups[k]);
				}

				Lpopups = Lpopups.slice(-1);
				//mapPosition.setLatLng( [] );
				mapSegment.setLatLngs([
					[]
				]);

				//if ( mymap.hasLayer(mapSegmentΙnfo)) {
				//	mymap.removeLayer(mapSegmentΙnfo);
				//}
			}

		}

		document.getElementById('reload').onclick = function (e) {
			document.location.reload() 
		}
		
		function httpRequestfoo() {
			if (this.readyState  === 4) {
			   if (this.status === 200) {
				   blob = new Uint8Array(this.response);
				   loadFitFile(blob);
				}			
			}		
		}

		document.getElementById('files').onchange = function (e) {
			filename = document.getElementById("files").value;	
			//filename = "activities/2020-09-01T15_50_22+00_00_5472387357.fit";
			console.log('files changed');  
			console.log(filename);  
			var xhr = new XMLHttpRequest();			
			xhr.onload = httpRequestfoo;
			xhr.open('GET', decodeURI(filename), true);
			xhr.responseType = 'arraybuffer';
			xhr.onerror = function (e) {
				console.log(error(xhr.statusText));
			};
			xhr.send(null);			
		}

		var blob; // store raw binary data

		const queryString = window.location.search; //href;
		const urlParams = new URLSearchParams(queryString);
		console.log(urlParams.get('file'));    
		var filename = urlParams.get('file'); 
		filename = filename.replace("plus","+");
		console.log(filename);    
		document.getElementById("files").options.add(new Option(filename, filename));  
		document.getElementById("files").value = filename;
		document.getElementById('files').dispatchEvent(new Event('change'));

	}
	//)();

);