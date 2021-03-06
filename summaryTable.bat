@ECHO OFF

rem Check path to node.exe !!!

cmd.exe /K ""C:\Program Files\nodejs\node.exe" utilities\summaryTable.js"

rem for .tkl format
rem cmd.exe /K ""C:\Program Files\nodejs\node.exe" utilities\summaryTable.js --type=.tkl"