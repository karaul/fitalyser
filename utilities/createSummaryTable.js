// usage in the Windows command prompt:
//  path-to-node.exe/node.exe utilities/createSummaryTable.js
//
// ---- user input---------------------------------------------------------------//
//const activitesFolder = './../activities/';
const activitesFolder = './temp';
const tableName = "mytable.csv";
const delimiter = ",";
// to see possible headers use checkFields.js 
// filename is not in the headers, it is added automatically
const headers = ["start_time", "sport", "sub_sport", "total_distance", "total_timer_time",
  "avg_speed", "pace", "avg_heart_rate", "HRE", "max_heart_rate", "max_speed", "total_ascent", "total_descent", ,
  "avg_cadence", "max_cadence", "total_training_effect", "swim_stroke",
  "avg_temperature", "max_temperature", "total_anaerobic_effect"
];
// ---- end of user input--------------------------------------------------------//


const fs = require('fs');

function text(arr, field1) {
  var text = field1;
  for (var k = 0; k < arr.length; k++) {
    text += delimiter + arr[k];
  }
  return text += "\n";
}

fs.writeFile(activitesFolder + "/" + tableName, text(headers, "filename"), 'utf8', function (err) {
  if (err) {
    console.log('Error at writing headers to table');
  }
});


try {
  var FitParser = require('./src/fit-parser.js');
} catch (err) {
  var FitParser = require('./../src/fit-parser.js');
}

var fitParser = new FitParser({
  force: true,
  speedUnit: 'km/h',
  lengthUnit: 'km',
  temperatureUnit: 'celcius',
  elapsedRecordField: true,
  mode: 'list',
});


fs.readdir(activitesFolder, (err, files) => {
  if (err) {
    console.log(err);
    console.log("\nCheck path to FIT file\n");
  } else {
    files.forEach(file => {
      if (file.slice(-4) === ".fit") {
        console.log(file);

        fs.readFile(activitesFolder + "/" + file, function (err, content) {
          if (err) {
            console.log("\nCheck path to FIT file\n");
            console.log(err);
          } else {
            fitParser.parse(content, function (error, data) {
              if (error) {
                console.log("\nCheck path to FIT file\n");
                console.log(error);
              } else {
                var record = {};
                record["filename"] = file;
                for ([key, value] of Object.entries(data.sessions[0])) {
                  if (headers.includes(key)) {
                    record[key] = value;
                  }
                }
                if ("avg_speed" in data.sessions[0]) {
                  record["pace"] = 60 / data.sessions[0]["avg_speed"];
                  if ("avg_heart_rate" in data.sessions[0]) {
                    record["HRE"] = data.sessions[0]["avg_heart_rate"] * record["pace"];
                  }
                }

                if ("start_time" in data.sessions[0])
                  record["start_time"] = new Date(data.sessions[0]["start_time"]).toISOString();
                /*if ("total_distance" in data.sessions[0])
                  record["total_distance"] = data.sessions[0]["total_distance"]/1000;*/
                if ("total_timer_time" in data.sessions[0])
                  record["total_timer_time"] = data.sessions[0]["total_timer_time"] / 60;

                var rec = [];
                for (var k = 0; k < headers.length; k++) {
                  rec.push(record[headers[k]]);
                }

                fs.appendFile(activitesFolder + "/" + tableName, text(rec, activitesFolder + "/" + file), 'utf8', function (err) {
                  if (err) {
                    console.log('Error at writing to table the record:');
                  }
                });
              }
            })
          }
        })
      }
    })
  }
});