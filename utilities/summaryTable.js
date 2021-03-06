// Usage with default options:
// ./path-to-node/node.exe ./path-to-summaryTable/summaryTable.js 
// Help:
//./path-to-node/node.exe ./path-to-summaryTable/summaryTable.js -h

// ---- user input: it's possible to change FIT fields below
const headers = ["start_time", "sport", "sub_sport", "total_distance", "total_timer_time",
  "avg_speed", "pace", "avg_heart_rate", "HRE", "max_heart_rate", "max_speed", "total_ascent", "total_descent", ,
  "avg_cadence", "max_cadence", "total_training_effect", "swim_stroke",
  "avg_temperature", "max_temperature", "total_anaerobic_effect"
];
// ---- end of user input--------------------------------------------------------//

const fs = require('fs');


const delimiter = ",";

var
  FitParser,
  TklParser,
  parser;
var
  activitiesFolder = "myactivities",
  tableName = "table.csv",
  fileExt = ".fit";
var
  tableExist = false,
  filesInTable = [];

//console.log("CWD: " + process.cwd() )
if (process.cwd().indexOf("utilities") < 0) {
  // quick and dirty include
  // https://stackoverflow.com/questions/5797852/in-node-js-how-do-i-include-functions-from-my-other-files
  eval(fs.readFileSync('./utilities/getargs.js') + '');
} else {
  eval(fs.readFileSync('getargs.js') + '');
  if (activitiesFolder.indexOf("..") < 0) activitiesFolder = "./../" + activitiesFolder;
}

FitParser = require('./../../fitplotter/src/fit-parser.js');
TklParser = require('./../../fitplotter/src/tkl-parser.js');
var fitParser = new FitParser({
  force: true,
  speedUnit: 'km/h',
  lengthUnit: 'km',
  temperatureUnit: 'celcius',
  elapsedRecordField: true,
  mode: 'list',
});
var tklParser = new TklParser();
var parser;

//console.log(process.argv);
const args = getArgs();

for (const [key, value] of Object.entries(args)) {
  switch (key) {
    case "h" || "help":
      console.log("\nExample:");
      console.log("\t./path-to-node/node.exe createSummaryTable.js " +
        "--name=table.csv --directory=./activities/ --type=.fit");
      console.log("\ttype: .fit or .tkl \n")
      //console.log("help: ./path-to-node/node.exe createSummaryTable.js -h\n");
      return;
    case "directory":
      activitiesFolder = args.directory;
      break;
    case "name":
      tableName = args.name;
      break;
    case "type":
      fileExt = args.type;
      break;
    default:
      console.log("wrong option: " + key + "\n");
      return;
  }
}

console.log("activitesFolder: " + activitiesFolder);
console.log("tableName: " + tableName);
console.log("type: " + fileExt);

function text(arr, field1) {
  var text = field1;
  for (var k = 0; k < arr.length; k++) {
    text += delimiter + arr[k];
  }
  return text;
}

tableExist = fs.existsSync(activitiesFolder + "/" + tableName);

if (tableExist) {
  let text = fs.readFileSync(activitiesFolder + "/" + tableName, 'utf8');
  let lines = text.split(/[\r\n]+/g);
  filesInTable = filesInTable || [];
  for (var i = 1; i < lines.length; i++) {
    var d = lines[i];
    filesInTable.push(d.slice(0, d.indexOf(",")));
  }
  console.log("files to be added in " + activitiesFolder + "/" + tableName)
} else {
  fs.writeFileSync(activitiesFolder + "/" + tableName, text(headers, "filename"), 'utf8', function (err) {
    if (err) {
      console.log('Error at writing headers to table: ' + activitiesFolder + "/" + tableName);
      return;
    }
  });
  console.log("Created table: " + activitiesFolder + "/" + tableName)
}

//console.log(tableExist);
//console.log(filesInTable);

fs.readdir(activitiesFolder, (err, files) => {
  if (err) {
    console.log("\nDoes not exist: \"" + activitiesFolder + "\n\nCheck path to FIT files\n");
    return;
  } else {
    files.forEach(file => {
      if (file.slice(-4) === fileExt) {
        if (file.slice(-4) === ".fit") parser = fitParser;
        if (file.slice(-4) === ".tkl") parser = tklParser;
        fs.readFile(activitiesFolder + "/" + file, function (err, content) {
          if (err) {
            console.log("\nCheck path to the file\n");
            //console.log(err);
            return;
          } else {

            if (!(tableExist) || (tableExist && !filesInTable.includes(file))) {
              console.log("Adding: " + file);
              parser.parse(content, function (error, data) {
                if (error) {
                  console.log("Wrong ." + fileExt + " file\n");
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
                    const h = Math.floor(ttt / 3600);
                    const m = Math.floor(ttt / 60) - h * 60;
                    const sec = ttt < 300 ? (ttt % 60).toFixed(2) : (ttt % 60).toFixed();
                    record["total_timer_time"] = h.toString().padStart(2, '0') +
                      ":" + m.toString().padStart(2, '0') + ":" + sec.toString().padStart(2, '0');
                  }
                  var rec = [];
                  for (var k = 0; k < headers.length; k++) {
                    rec.push(record[headers[k]]);
                  }

                  console.log(file);
                  fs.appendFileSync(activitiesFolder + "/" + tableName, text(rec, "\n" + file), 'utf8', function (err) {
                    if (err) {
                      console.log("Error at writing to the table: " + tableName);
                      console.log("File: " + file);
                    }
                  })
                }
              })
            }
          }
        })
      }
    })
  }
})