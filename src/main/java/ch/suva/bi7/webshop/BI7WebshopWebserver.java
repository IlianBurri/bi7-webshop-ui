package ch.suva.bi7.webshop;

import io.javalin.Javalin;
import io.javalin.http.Context;
import io.javalin.http.HttpStatus;
import io.javalin.http.staticfiles.Location;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class BI7WebshopWebserver {

    public static final int DEFAULT_PORT = 8080;
    private static final String JDBC_URL = "jdbc:h2:file:./data/webshop-db;AUTO_SERVER=TRUE";
    private static final String JDBC_USER = "sa";
    private static final String JDBC_PASSWORD = "";
    private static final WarenkorbDao WARENKORB_DAO = new WarenkorbDao();

    public static int getDefaultPort() {
        return DEFAULT_PORT;
    }

    public static int getPort() {
        String configured = System.getProperty("server.port", System.getenv().getOrDefault("PORT", ""));
        if (configured == null || configured.isBlank()) {
            return DEFAULT_PORT;
        }
        try {
            return Integer.parseInt(configured);
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("Ungültiger Port: " + configured);
        }
    }

    public static Path resolveWebAppDir(String workingDirectory) {
        Path projectRoot = Paths.get(workingDirectory).toAbsolutePath().normalize();
        if (projectRoot.endsWith(Paths.get("src", "main"))) {
            projectRoot = projectRoot.getParent().getParent();
        }

        Path webAppDir = projectRoot.resolve(Paths.get("src", "main", "webapp")).toAbsolutePath().normalize();
        if (!Files.isDirectory(webAppDir)) {
            throw new IllegalStateException("Web app directory not found: " + webAppDir);
        }

        return webAppDir;
    }

    public static void main(String[] args) throws Exception {
        Path webAppDir = resolveWebAppDir(System.getProperty("user.dir"));

        Javalin app = Javalin.create(config -> {
            config.staticFiles.add(staticFiles -> {
                staticFiles.hostedPath = "/";
                staticFiles.directory = webAppDir.toString();
                staticFiles.location = Location.EXTERNAL;
            });

            config.routes.get("/artikel", ctx -> ctx.json(getArtikelListe()));
            config.routes.get("/api/artikel", ctx -> ctx.json(getArtikelListe()));
            config.routes.get("/api/warenkorb/{email}", ctx -> ctx.json(WARENKORB_DAO.getWarenkorbByUser(ctx.pathParam("email"))));
            config.routes.post("/api/warenkorb/add", ctx -> handleAddArtikelToWarenkorb(ctx));
            config.routes.put("/api/warenkorb/item/{id}", ctx -> handleUpdateMenge(ctx));
            config.routes.delete("/api/warenkorb/item/{id}", ctx -> {
                int warenkorbItemId = Integer.parseInt(ctx.pathParam("id"));
                WARENKORB_DAO.deleteWarenkorbItem(warenkorbItemId);
                ctx.status(HttpStatus.OK);
            });
        });

        app.start(getPort());
        System.out.println("Server started on port " + getPort() + "!");
    }

    private static void handleAddArtikelToWarenkorb(Context ctx) {
        String email = ctx.queryParam("email");
        String artikelIdParam = ctx.queryParam("artikelId");
        String mengeParam = ctx.queryParam("menge");

        if ((email == null || artikelIdParam == null || mengeParam == null) && !ctx.body().isBlank()) {
            @SuppressWarnings("unchecked")
            Map<String, Object> body = ctx.bodyAsClass(Map.class);
            if (email == null && body.get("email") != null) {
                email = body.get("email").toString();
            }
            if (artikelIdParam == null && body.get("artikelId") != null) {
                artikelIdParam = body.get("artikelId").toString();
            }
            if (mengeParam == null && body.get("menge") != null) {
                mengeParam = body.get("menge").toString();
            }
        }

        if (email == null || email.isBlank() || artikelIdParam == null || artikelIdParam.isBlank()) {
            ctx.status(HttpStatus.BAD_REQUEST).json(Map.of("error", "email und artikelId sind erforderlich"));
            return;
        }

        int artikelId;
        try {
            artikelId = Integer.parseInt(artikelIdParam);
        } catch (NumberFormatException e) {
            ctx.status(HttpStatus.BAD_REQUEST).json(Map.of("error", "artikelId muss eine Zahl sein"));
            return;
        }

        int menge = 1;
        if (mengeParam != null && !mengeParam.isBlank()) {
            try {
                menge = parseMenge(mengeParam);
            } catch (IllegalArgumentException e) {
                ctx.status(HttpStatus.BAD_REQUEST).json(Map.of("error", e.getMessage()));
                return;
            }
        }

        WARENKORB_DAO.addArtikelToWarenkorb(email, artikelId, menge);
        ctx.status(HttpStatus.CREATED);
    }

    private static void handleUpdateMenge(Context ctx) {
        int warenkorbItemId;
        try {
            warenkorbItemId = Integer.parseInt(ctx.pathParam("id"));
        } catch (NumberFormatException e) {
            ctx.status(HttpStatus.BAD_REQUEST).json(Map.of("error", "id muss eine Zahl sein"));
            return;
        }

        String mengeParam = ctx.queryParam("menge");
        if (mengeParam == null && !ctx.body().isBlank()) {
            @SuppressWarnings("unchecked")
            Map<String, Object> body = ctx.bodyAsClass(Map.class);
            if (body.get("menge") != null) {
                mengeParam = body.get("menge").toString();
            }
        }

        if (mengeParam == null || mengeParam.isBlank()) {
            ctx.status(HttpStatus.BAD_REQUEST).json(Map.of("error", "menge ist erforderlich"));
            return;
        }

        try {
            int menge = parseMenge(mengeParam);
            WARENKORB_DAO.updateMenge(warenkorbItemId, menge);
        } catch (IllegalArgumentException e) {
            ctx.status(HttpStatus.BAD_REQUEST).json(Map.of("error", e.getMessage()));
            return;
        }
        ctx.status(HttpStatus.OK);
    }

    static int parseMenge(String mengeParam) {
        if (mengeParam == null || mengeParam.isBlank()) {
            throw new IllegalArgumentException("menge ist erforderlich");
        }

        int menge;
        try {
            menge = Integer.parseInt(mengeParam);
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("menge muss eine Zahl sein");
        }

        if (menge < 1 || menge > 99) {
            throw new IllegalArgumentException("menge muss zwischen 1 und 99 liegen");
        }

        return menge;
    }

    private static List<Map<String, Object>> getArtikelListe() {
        String sql = "SELECT artikelId, name, preis, bild FROM artikel ORDER BY artikelId";
        List<Map<String, Object>> artikelListe = new ArrayList<>();

        try (Connection connection = getConnection();
             PreparedStatement statement = connection.prepareStatement(sql);
             ResultSet resultSet = statement.executeQuery()) {
            while (resultSet.next()) {
                Map<String, Object> artikel = new HashMap<>();
                artikel.put("artikelId", resultSet.getInt("artikelId"));
                artikel.put("name", resultSet.getString("name"));
                artikel.put("preis", resultSet.getDouble("preis"));
                artikel.put("bild", resultSet.getString("bild"));
                artikelListe.add(artikel);
            }
        } catch (SQLException e) {
            throw new IllegalStateException("Could not load artikel list", e);
        }

        return artikelListe;
    }

    private static Connection getConnection() throws SQLException {
        return DriverManager.getConnection(JDBC_URL, JDBC_USER, JDBC_PASSWORD);
    }
}
