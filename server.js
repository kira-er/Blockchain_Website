/*
 * mobidict (https://www.wpvs.de)
 * © 2020 Dennis Schulmeister-Zimolong <dennis@wpvs.de>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 */
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

/* =============================================================================
 * DEFINITION DER URL-ROUTEN UND BEARBEITUNG DER HTTP-ANFRAGEN
 * =============================================================================*/

// Endpunkt für die Startseite definieren
app.get("/", (request, response) => {
    // Wörterbuch durchsuchen
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
