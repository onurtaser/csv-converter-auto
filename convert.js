const fs = require("fs"),
    createCsvWriter = require('csv-writer').createObjectCsvWriter,
    commander = require('commander');

console.log("\nWebIQ JSON Trend Export Data To CSV Converter\n------------------------------------------------------");

function errorAndExit(msg) {
    console.log(msg);
    process.exit(1);
}

// Handle command line arguments
commander.
    version('1.0.1', '-v, --version').
    usage('[OPTIONS]...').
    option('-i, --input <inputFile>', 'Specifies the path to the input JSON file (export-data.json)').
    option('-o, --output <outputFile>', 'Output CSV file path').
    option('-e, --encoding <encoding>', 'File encoding (utf-8, ascii, base64, base64url, ucs2, utf16le, latin1)', 'utf-8').
    option('-d, --field-delimiter <fieldDelimiter>', 'CSV field delimiter, only "," and ";" are supported', ';').
    option('-r, --record-delimiter <recordDelimiter>', 'Record (line) delimiter, only "\\r\\n" and "\\n" are supported', '\\r\\n').
    parse(process.argv);

const options = commander.opts(),
    inputFile = options.input ? options.input : null,
    outputFile = options.output ? options.output : null,
    encoding = options.encoding,
    fieldDelimiter = options.fieldDelimiter,
    recordDelimiter = options.recordDelimiter;

// 2. Validate input file exists
if (!inputFile) {
    console.log('ERROR: Input file not specified!\n');
    commander.help();
    process.exit(1);
}

if (!fs.existsSync(inputFile)) {
    errorAndExit("ERROR: Input file not found: " + inputFile);
}

if (!outputFile) {
    console.log('ERROR: Output file not specified!\n');
    commander.help();
    process.exit(1);
}

if (fieldDelimiter && fieldDelimiter !== ';' && fieldDelimiter !== ',') {
    errorAndExit('ERROR: Only "," and ";" are supported as field delimiters!');
}

if (recordDelimiter && recordDelimiter !== '\\n' && recordDelimiter !== '\\r\\n') {
    errorAndExit('ERROR: Only "\\r" and "\\r\\n" are supported as record delimiters!');
}

// 3. Try to load file as JSON
let fileContent = fs.readFileSync(inputFile).toString();
if (!fileContent.length) {
    errorAndExit("ERROR: Input file is empty: " + inputFile);
}
let json = null;
try {
    json = JSON.parse(fileContent);
} catch (e) {
    errorAndExit("ERROR: Input file does not contain valid JSON: " + inputFile);
}

// 4. Read and parse JSON file
console.log("Please wait.... parsing JSON data...");
let trendItemNames = [];
json.forEach((trendItem) => {
    trendItemNames.push(trendItem.name);
});
console.log(`Found ${trendItemNames.length} trend items to parse: ` + trendItemNames.join(', '));

// 5. Create data object for each timestamp entry
let allData = {};
let dataMapping = {};
trendItemNames.forEach((trendItemName) => {
    dataMapping[trendItemName] = null;
});

// 6. Parse all data into huge object
console.log('Reading all data into memory...');
const totalCount = trendItemNames.length;
let currentCount = 0;
json.forEach((trendItem) => {
    currentCount++;
    console.log(`Parsing ${currentCount}/${totalCount}: ${trendItem.name}...`);

    const allValues = trendItem.values.item;
    allValues.forEach((val) => {
        const ts = val[0],
            value = val[1];

        if (typeof allData[ts] === 'undefined') {
            allData[ts] = Object.assign({}, dataMapping);
        }

        allData[ts][trendItem.name] = value;
    });
});

// 7. Sort data by timestamp
console.log('Sorting data by timestamp...');
const allDataOrdered = Object.keys(allData).sort().reduce(
    (obj, key) => {
        obj[key] = allData[key];
        return obj;
    },
    {}
);

// 8. Create flat array
let flatArray = [];
console.log("Creating flat array...");
Object.keys(allDataOrdered).forEach((ts) => {
    let obj = allDataOrdered[ts];
    obj['_TIMESTAMP_'] = ts;

    // Sort keys so that the CSV columns are sorted alphabetically
    const sortedKeys = Object.keys(obj).sort(function(a, b) {
        return a.toLowerCase().localeCompare(b.toLowerCase());
    });

    let newObj = {};
    sortedKeys.forEach((key) => {
        newObj[key] = obj[key];
    });

    flatArray.push(newObj);
});

// 9. Write CSV file
console.log("Writing CSV file...");
let csvHeaders = [{
    id: "_TIMESTAMP_",
    title: "UNIX Timestamp"
}];
trendItemNames.forEach((trendItemName) => {
    csvHeaders.push({
        id: trendItemName,
        title: trendItemName
    });
});
const csvWriter = createCsvWriter({
    path: outputFile,
    header: csvHeaders,
    fieldDelimiter: fieldDelimiter,
    recordDelimiter: recordDelimiter.replace(/\\r\\n/g, "\r\n").replace(/\\n/g, "\n"),
    encoding: encoding
});
csvWriter.writeRecords(flatArray).
    catch((e) => {
        errorAndExit('ERROR: Writing CSV failed: ' + e);
    }).
    then(() => {
        console.log('CSV file written to ' + outputFile);
    });
