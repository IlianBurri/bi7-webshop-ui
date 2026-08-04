# bi7-webshop-ui

Dieses Repository enthält nur den Webserver bzw. das Frontend für den BI7-Webshop. Der Server startet standardmäßig auf Port `8080` und liefert die Dateien aus `src/main/webapp` aus.

## Voraussetzung

Damit der Webshop vollständig funktioniert, muss zusätzlich das Backend heruntergeladen und gestartet werden:

- Backend-Repository: [https://github.com/IlianBurri/bi7-webshop-service](https://github.com/IlianBurri/bi7-webshop-service)

In diesem Backend-Repository findest du auch die Anleitung für die Datenbank. Wenn Webserver, Backend und Datenbank korrekt eingerichtet sind, sollte der Webshop wie erwartet funktionieren.

## Webserver starten

Voraussetzung ist Java 17 und Maven.

```bash
mvn clean package
mvn exec:java -Dexec.mainClass="ch.suva.bi7.webshop.BI7WebshopWebserver"
```

Wenn du die Anwendung direkt aus der IDE startest, ist die Hauptklasse:

```text
ch.suva.bi7.webshop.BI7WebshopWebserver
```

## Hinweise

- Der Webserver ist kein vollständiges Backend.
- Login, Registrierung und andere serverseitige Funktionen hängen vom separaten Backend ab.
- Falls etwas nicht funktioniert, zuerst prüfen, ob das Backend läuft und die Datenbank korrekt eingerichtet ist.