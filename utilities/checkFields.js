// usage in the Windows command prompt:
//  path-to-node.exe/node.exe utilities/checkFields.js
//
// ---- uswer input -----------------------//
const file = "./../temp/2020-09-03T16_02_36+00_00_5482235452.fit";
// ---- end of user input-----------------//

var fs = require('fs');
try {
  var FitParser = require('./src/fit-parser.js');
}
catch(err) {
  var FitParser = require('./../src/fit-parser.js');
}

fs.readFile(file, function (err, content) {

  const fitParser = new FitParser({
    force: true,
    speedUnit: 'km/h',
    lengthUnit: 'km',
    temperatureUnit: 'celcius',
    elapsedRecordField: true,
    mode: 'list',                  //using 'cascade' or 'both' doesn't seem to work
  });
  
  fitParser.parse(content, function (error, data) {
    if (error) {
      console.log(error);
      console.log("\nCheck path to FIT file\n");
    } else {
      console.log(data.sessions);
    }
  });
});
