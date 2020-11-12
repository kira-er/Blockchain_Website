const {Blockchain, Transaction} = require('./blockchain');
const express = require("express");
const expressNunjucks = require("express-nunjucks");
const path = require("path");
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');


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
const myKey = ec.keyFromPrivate('1b6dd5fae6e37cf16a9fc305f0f62c8e55e7f7e765fc8bad4b7c9665c2c6e9b6');
const myWalletAddress = myKey.getPublic('hex');

/* =============================================================================
 * DEFINITION DER URL-ROUTEN UND BEARBEITUNG DER HTTP-ANFRAGEN
 * =============================================================================*/

// Endpunkt für die Startseite definieren

//index
app.get("/", (request, response) => {
    let context = {
        title: "Startseite",
        chain: blockchain.chain,
        index: 0
    }

    if (request.query.q) {
        context.index = request.query.q;
    }
    response.render("index", context);
});

//createTransaction
app.get("/createTransaction", (request, response) => {
    let error = null;
    if(request.query.to != null && request.query.amount != null){
        if(request.query.to != "" && request.query.amount != "" && !isNaN(request.query.amount) && +request.query.amount > 0){
            let tx = new Transaction(myWalletAddress, request.query.to, request.query.amount);
            tx.signTransaction(myKey);
            blockchain.createTransaction(tx);

            response.redirect("/pendingTransaction");
            return;
        }
        error = "Adress or Amount invalid!";
    }
    let context = {
        title: "Transaktion erstellen",
        myAddress: myWalletAddress,
        to: request.query.to,
        amount: request.query.amount,
        error: error
    }
    response.render("transaction", context);
    
});

//pendingTransaction
app.get("/pendingTransaction", (request, response) => {
    let context = {
        title: "Ausstehende Transaktionen",
        transactions: blockchain.pendingTransaction
    }
    response.render("pendingTransaction", context);
});

//miner
app.get("/mineBlock", (request, response) => {
    blockchain.minePendingTransaction(myWalletAddress);

    response.redirect("/?q="+(blockchain.chain.length-1));
});

//balance
app.get("/balance", (request, response) => {
    let address = myWalletAddress;
    if(request.query.address){
        address = request.query.address;
    }

    let context = {
        title: "Account",
        address: address,
        balance: blockchain.getBalanceOfAddress(address)
    }

    response.render("balance", context);
});


//help
app.get("/help", (request, response) => {
    let context = {
        title: "Hilfe"
    }
    response.render("help", context);
});


/* =============================================================================
 * SERVER STARTEN
 * =============================================================================*/
app.listen(config.port, config.host, () => {
    console.log("=======================");
    console.log("blockchain node.js server");
    console.log("=======================");
    console.log();  
    console.log("Erreichbar unter: ")
    console.log(config);
    console.log();
});
