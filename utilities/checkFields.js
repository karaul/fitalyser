// usage in the Windows command prompt:
//  path-to-node.exe/node.exe utilities/checkFields.js
//
// ---- user input -----------------------//
const file = "./../temp/2020-09-03T16_02_36+00_00_5482235452.fit";
// ---- end of user input-----------------//

require.path = ["fitplotter/src/", "./../fitplotter/src/", "./../../fitplotter/src/"];
var FitParser = require('./../../fitplotter/src/fit-parser.js');

var fs = require('fs');

/*try {
  var FitParser = require('./fitplotter/src/fit-parser.js');
}
catch(err) {
  var FitParser = require('./../fitplotter/src/fit-parser.js');
}*/

fs.readFile(file, function (err, content) {

  const fitParser = new FitParser({
    force: true,
    speedUnit: 'km/h',
    lengthUnit: 'km',
    temperatureUnit: 'celcius',
    elapsedRecordField: true,
    mode: 'list',                
  });
  
  fitParser.parse(content, function (error, data) {
    if (error) {
      console.log(error);
      console.log("\nCheck path to FIT file\n");
    } else {
      console.log(data);
    }
  });
});
