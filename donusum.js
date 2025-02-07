// const express = require("express");
// const app = express();
// const port = 3000;
// const http = require("http");
// http.createServer().listen(port);
const { exec } = require("child_process");
const { stdout } = require("process")
const chokidar = require("chokidar");
const path = require("node:path");

const watcher = chokidar.watch("input", {
    ignored: (filePath, stats) => stats?.isFile() && !filePath.endsWith('.json'), //Sadece json dosyalarını izle
    ignoreInitial: true,
    persistent: true
});

//Dosya eklendiğinde
watcher.on("add", filePath => {
    const newPath = (path.basename(filePath));
    const fileName = newPath.split(".")[0];

    const command = `node convert.js --input ./input/${newPath} --output ./output/${fileName}.csv`

    

    exec(command, (error, stdout, stderr) => {
        if(stdout){
            console.log("Dönüşüm başarılı");
        } else if(!stdout) {
            if(error) {
                console.error(`Dönüşüm hatası: ${error.message}`);
                return;
            }
            if (stderr) {
                console.error(`Hata: ${stderr}`)
                return;
            }
        }
    })
})


