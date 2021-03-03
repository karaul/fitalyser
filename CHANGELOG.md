# Changelog

`fitalyser` changes are documented in this file

## To do

- docs: how-to for `tableHeaders.js`;
- docs: how to connect `fitplotter`;

### 2021-03-03

- refactoring to use the same code as in the standalone [fitploter](https://github.com/karaul/fitplotter);
- Added `.tkl` format  (watch models: GPSmaster, navrun-500, ultrasport, etc);

### 2021-02-28

- added `tableHeaders.js` for external table formatting;
- Table ordering is implemented. It turns by clicking on the head of the column, thanks to [rony](https://javascript.ru/forum/misc/77752-proshu-podskazki-otsortirovat-obekty.html#post509074) from Russian javascript.ru/forum;
- options parsing and simple error handling in `createSummaryTable`;
- added `createSummaryTable.bat` for Windows  users (others can read inside to get insight);
- added `myactivities` folder. For a clever Windows user, the added  `createSummaryTable.bat` and `myactivities` must be  enough to undestand how to generate the table of activities with use `utlities\createSummaryTable.js`;
- few minor bugs fixed;
- typos in docs are corrected;

### 2021-02-27

- README.md
- CHANGELOG.md is started after reading nice [source](https://keepachangelog.com/en/1.0.0/)
- few utilities `utilitites/*.js` to check FIT flie and generate table are  added, they need better documentation
- src folder is cleaned
- index.html: better table formatting
- utilities need better diocumentation

### 2021-02-26

Prototype works, needs utlitities to work with tables
