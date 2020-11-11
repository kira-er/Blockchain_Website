
const {Blockchain, Transaction} = require('./blockchain');
const express = require("express");
const expressNunjucks = require("express-nunjucks");
const path = require("path");


/* =============================================================================
 * SERVER-KONFIGURATION
 * =============================================================================*/

// Auslesen der Umgebungsvariablen zur Konfiguration des Servers
const config = {
  
    port:      parseInt(process.env.PORT) || 8888,
    host:      process.env.HOST           || "localhost",
};

// Protokollzeile für jede HTTP-Anfrage auf der Konsole ausgeben
const app = express();

app.use((request, response, next) => {
    console.log(new Date(), request.method, request.url, `HTTP ${request.httpVersion}`);
    next();
});

// Statische Dateien aus dem "static"-Verzeichnis direkt liefern
let staticDir = path.normalize(path.join(__dirname, "static"));
app.use(express.static(staticDir));

// Verzeichnis mit den HTML-Templates definieren
let templateDir = path.normalize(path.join(__dirname, "templates"));
app.set("views", templateDir);

let isDev = app.get("env") === "development";

expressNunjucks(app, {
    watch: isDev,
    noCache: isDev
});
/*=======================================================*/

let blockchain = new Blockchain();
blockchain.minePendingTransaction("miner-address");
blockchain.minePendingTransaction("miner2-address");
/* =============================================================================
 * DEFINITION DER URL-ROUTEN UND BEARBEITUNG DER HTTP-ANFRAGEN
 * =============================================================================*/

// Endpunkt für die Startseite definieren

//index
app.get("/", (request, response) => {
    let context = {
        title: "Startseite",
        chain: blockchain.chain,
        index: 1
    }

    if (request.query.q) {
        context.index = request.query.q;
    }
    response.render("index", context);
});

//createTransaction
app.get("/createTransaction/", (request, response) => {
    let context = {
        title: "Transaktion erstellen",
        chain: blockchain.chain,
        index: 0    
    }
    response.render("transaction", context);
});

//pendingTransaction
app.get("/pendingTransaction/", (request, response) => {
    let context = {
        title: "Ausstehende Transaktionen",
        transactions: blockchain.pendingTransaction
    }
    response.render("pendingTransaction", context);
});

// Endpunkt für die About-Seite definieren
app.get("/about/", (request, response) => {
    response.render("about", {
        title: "Über uns",
    });
});


/* =============================================================================
 * SERVER STARTEN
 * =============================================================================*/
app.listen(config.port, config.host, () => {
    console.log("=======================");
    console.log("mobidict node.js server");
    console.log("=======================");
    console.log();
    console.log("Ausführung mit folgender Konfiguration:");
    console.log();
    console.log(config);
    console.log();
    console.log("Nutzen Sie die folgenden Umgebungsvariablen zum Anpassen der Konfiguration:");
    console.log();
    console.log("  » DICT_FILE:  Pfad und Dateiname der Wörterbuchdatei (Plain-Text-Format)");
    console.log("  » PORT:       TCP-Port, auf dem der Webserver erreichbar ist");
    console.log("  » HOST:       Hostname oder IP-Addresse, auf welcher der Webserver erreichbar ist");
    console.log();
});
