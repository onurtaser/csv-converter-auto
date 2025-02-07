# WebIQ Trend JSON To CSV Converter

This small tool allows you to convert a WebIQ trend data JSON export into a CSV file.

## Limitations
The generated CSV file will contain one row per timestamp. If there is no recording for a specific
timestamp for a recorded value the column will be left empty instead of showing the (same) previous value.
Please note that trend data is aggregated data.

## Setup
1. Download and install [NodeJS](https://nodejs.org/en/download)
2. Open _this_ directory in a command line window and install all dependencies with `npm install`

## Usage
Simply copy your `export-data.json` file from WebIQ to the `input` directory (or somewhere else and change the path in the examples).

Default usage:

`node convert.js --input ./input/export-data.json --output ./output/my-export.csv`

This will automatically use `utf-8` encoding, use a semicolon as field delimiter and
`\r\n` as row delimiter.

To use a different delimiter for example you have to specify it:

`node convert.js --input ./input/export-data.json --output ./output/my-export.csv --field-delimiter ,`

To see all command line options simply call `node convert.js --help`:

```
Usage: convert [OPTIONS]...

Options:
  -v, --version                             Output the version number
  -i, --input <inputFile>                   Specifies the path to the input JSON file (export-data.json)
  -o, --output <outputFile>                 Output CSV file path
  -e, --encoding <encoding>                 File encoding (default: "utf-8")
  -d, --field-delimiter <fieldDelimiter>    CSV field delimiter (default: ";")
  -r, --record-delimiter <recordDelimiter>  Record (line) delimiter (default: "\r\n")
  -h, --help                                display help for command
```



