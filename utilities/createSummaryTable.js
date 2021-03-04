// Usage: ./path-to-node/node.exe ./path-of-createSummaryTable/createSummaryTable.js -h

// ---- user input: it's possible to change FIT fields below
const headers = ["start_time", "sport", "sub_sport", "total_distance", "total_timer_time",
  "avg_speed", "pace", "avg_heart_rate", "HRE", "max_heart_rate", "max_speed", "total_ascent", "total_descent", ,
  "avg_cadence", "max_cadence", "total_training_effect", "swim_stroke",
  "avg_temperature", "max_temperature", "total_anaerobic_effect"
];
// ---- end of user input--------------------------------------------------------//

const fs = require('fs');

// quick and dirty include
// https://stackoverflow.com/questions/5797852/in-node-js-how-do-i-include-functions-from-my-other-files
try {
  eval(fs.readFileSync('./utilities/getargs.js')+'');
} catch (err) {
  eval(fs.readFileSync('getargs.js')+'');
}

const args = getArgs();
for (const [key, value] of Object.entries(args)) {
  switch (key) {
    case "h":
      console.log("\nUsage:\n");
      console.log("./path-to-node/node.exe createSummaryTable.js --name=tableName.csv --directory=activitesFolder\n");
      console.log("help: ./path-to-node/node.exe createSummaryTable.js -h\n");
      return;     
    case "directory":
      var activitesFolder = args.directory;
      console.log("\nactivitesFolder: " + activitesFolder +"\n");
      break;
    case "name":
      var tableName = args.name;
      console.log("\ntableName: " + tableName + "\n");
      break;
    default:
      console.log("wrong option: " + key + "\n");
      return;
  }
}

if (activitesFolder == null) {
  console.log("no activitesFolder");
  return;
}
if (tableName == null) {
  console.log("no tableName");
  return;
}

const delimiter = ",";

try {
  var FitParser = require('./fitplotter/src/fit-parser.js');
} catch (err) {
  var FitParser = require('./../fitplotter/src/fit-parser.js');
}

function text(arr, field1) {
  var text = field1;
  for (var k = 0; k < arr.length; k++) {
    text += delimiter + arr[k];
  }
  return text;
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
    console.log("\nDoes not exist: \"" + activitesFolder + "\n\nCheck path to FIT files\n");
    return;
  } else {

    fs.writeFile(activitesFolder + "/" + tableName, text(headers, "filename"), 'utf8', function (err) {
      if (err) {
        console.log('Error at writing headers to table');
        return;
      }
    });
    
    files.forEach(file => {
      if (file.slice(-4) === ".fit") {

        fs.readFile(activitesFolder + "/" + file, function (err, content) {
          if (err) {
            console.log("\nCheck path to FIT file\n");
            //console.log(err);
            return;            
          } else {
            fitParser.parse(content, function (error, data) {
              if (error) {
                console.log("Wrong FIT file\n");
                //console.log(error);
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
                if ("total_timer_time" in data.sessions[0]) {
                  // check below /60 - in minutes
                  const ttt = data.sessions[0]["total_timer_time"];
                  const h = Math.floor(ttt/3600);
                  const m = Math.floor(ttt/60) - h*60;
                  const sec = ttt < 300 ? (ttt % 60).toFixed(2): (ttt % 60).toFixed();
                  record["total_timer_time"] =  h.toString().padStart(2,'0') + 
                    ":" + m.toString().padStart(2,'0') + ":" + sec.toString().padStart(2,'0');
                }
                var rec = [];
                for (var k = 0; k < headers.length; k++) {
                  rec.push(record[headers[k]]);
                }

                console.log(file);

                fs.appendFile(activitesFolder + "/" + tableName, text(rec, "\n" + file), 'utf8', function (err) {
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