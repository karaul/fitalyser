# fitalyser

This is a wrapper to work with the [fitplotter](https://github.com/karaul/fitplotter/). 
see [screenshots](https://github.com/karaul/fitalyser/tree/master/screenshots)

## Motivation 

To analyse my own 10 years running experience recorded in several thousands binary files, and just for fun; 

## Installation

##### Installation for non-programmers who found this program in github

- Click on the green button, download everything as zip file and unzip. 
- Install [nodejs](https://nodejs.org/en/) 
- to be continued

##### Installation for programmers who found it in github
```
github clone https://github.com/karaul/fitplotter 
node .
```

## Usage

Υou need a table with the locations of the FIT files to be analysed. This table must be prepared in advance. In the `utilities` folder there are two  utilities: `checkFields.js` checks fields in the FIT tested file, and `createSummaryTable.js` creates the table. If the table is builded correctly, then clicking on the  "Plot" button sends the FIT file to the `fitplotter` form. To use these utilities do the following: 
- open command prompt;
- move to the program location;
- make sure you know where is `node.exe`;
- open in a plain text editor the needed utlities and read first commented lines there. You should correct paths in this utlities to the directory with your FIT files. The final table will be in the same directory;

To format table use `tableHeaders.js`. (To be continued)

## How it works

`fitalyser` needs a static http-server to read local FIT files. Without the server, each time when you select a FIT file in the table, there will be a dialog asking for file's location and user's confirmation to open the file, alhough the path to the file is already in the table, and `fitalyser` aim is to avoid unnecessary clicks. Υou may use your own server or to use `http-server-static.js`, working with `node.exe`, which has to be installed before, download it from [nodejs](https://nodejs.org/en/). All the `*.bat` files and `*.js` utlitiies must be accompanied by the `node.exe`. If something does not work at all, check path  in the corresponding `*.bat` file, and read carefully messages in the command prompt.


## License

MIT license


(c) Evgeny Votyakov aka karaul ([about me](http://www.irc-club.ru/karaul.html) in Russian), Nicosia, Cyprus, 2021
