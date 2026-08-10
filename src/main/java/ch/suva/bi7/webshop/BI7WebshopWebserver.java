package ch.suva.bi7.webshop;

import io.javalin.Javalin;
import io.javalin.http.Context;
import io.javalin.http.HttpStatus;
import io.javalin.http.staticfiles.Location;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

public class BI7WebshopWebserver {

    public static final int DEFAULT_PORT = 8080;
    private static final String JDBC_URL = "jdbc:h2:file:./data/webshop-db;AUTO_SERVER=TRUE";
    private static final String JDBC_USER = "sa";
    private static final String JDBC_PASSWORD = "";
    private static final WarenkorbDao WARENKORB_DAO = new WarenkorbDao();

    // Identisches Schema und Testdaten wie im Backend-Repo (bi7-webshop-service) dokumentiert.
    private static final List<ArtikelSeed> ARTIKEL_SEEDS = List.of(
            new ArtikelSeed(1, "iPhone 15 Pro", 1199.00, "https://imgs.search.brave.com/XKzj-Ry1DHNPSKMfAu3qWuKp_PdZCmUA9_yPjrLtfP8/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9zczcu/dnp3LmNvbS9pcy9p/bWFnZS9WZXJpem9u/V2lyZWxlc3MvYXBw/bGUtaXBob25lLTE1/LXByby0xdGItbmF0/dXJhbC10aXRhbml1/bS1tdHU1M2xsLWEt/YT93aWQ9NDAwJmhl/aT00MDAmZm10PXdl/YnAtYWxwaGE"),
            new ArtikelSeed(2, "Samsung Galaxy S24", 899.90, "https://imgs.search.brave.com/BkadkX__5a26LuCKGPBUVS5kY4cRhKoh2dXmvCeXYgk/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9tLWNk/bi5waG9uZWFyZW5h/LmNvbS9pbWFnZXMv/cGhvbmVzLzg0Mzg5/LTM1MC9TYW1zdW5n/LUdhbGF4eS1TMjQu/d2VicD93PTE"),
            new ArtikelSeed(3, "MacBook Air M3", 1299.00, "https://imgs.search.brave.com/oLakeowrB4SYM_w-OwZtOz1sgZ0rQlQdqIA4pcgJ5XY/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9jZG4u/bW9zLmNtcy5mdXR1/cmVjZG4ubmV0L2l4/S3FkbUdvY3lqUm80/OWE5VGk2a2MuanBn"),
            new ArtikelSeed(4, "Sony WH-1000XM5 Kopfhörer", 349.00, "https://imgs.search.brave.com/TF1Xaz1hrrvM-SwfAeWQBMxZmyACkFpkvsBDrjPwLA8/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pbWFn/ZS5jb29sYmx1ZS5k/ZS9tYXgvNzAweGF1/dG8vcHJvZHVjdHMv/MTc1NTc1OQ"),
            new ArtikelSeed(5, "iPad Air", 699.00, "https://imgs.search.brave.com/Vco2VWHR0elSR7DgrcuCrQdoLnrnJsFJ0kyKmpqMn78/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9jZG4u/bW9zLmNtcy5mdXR1/cmVjZG4ubmV0L2tV/RTNRMm1weThhbW9j/Vlp2b2NkVWEtMzIw/LTgwLmpwZw"),
            new ArtikelSeed(6, "PlayStation 5", 499.00, "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=500&auto=format&fit=crop"),
            new ArtikelSeed(7, "Dell XPS 13 Laptop", 1399.50, "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=500&auto=format&fit=crop"),
            new ArtikelSeed(8, "Apple Watch Series 9", 429.00, "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=500&auto=format&fit=crop"),
            new ArtikelSeed(9, "LG OLED TV 55 Zoll", 1299.90, "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=500&auto=format&fit=crop"),
            new ArtikelSeed(10, "Logitech MX Master 3S Maus", 109.90, "https://imgs.search.brave.com/u4KQhRP6KF4HT7OVjZBlf0ZnK6jHa3omFvYlzpjfK9E/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pLmVi/YXlpbWcuY29tL2lt/YWdlcy9nL1JmTUFB/ZVN3SUNWcDU1ZGIv/cy1sMjI1LmpwZw")
    );

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

        initDatabase();

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

    private static void initDatabase() {
        String artikelSql = """
                CREATE TABLE IF NOT EXISTS artikel (
                    artikelId INT AUTO_INCREMENT PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    preis DECIMAL(10, 2) NOT NULL,
                    bild VARCHAR(500)
                )
                """;
        String warenkorbSql = """
                CREATE TABLE IF NOT EXISTS warenkorb_item (
                    warenkorbItemId INT AUTO_INCREMENT PRIMARY KEY,
                    userEmail VARCHAR(255) NOT NULL,
                    artikelId INT NOT NULL,
                    menge INT NOT NULL DEFAULT 1,
                    FOREIGN KEY (artikelId) REFERENCES artikel (artikelId)
                )
                """;

        try (Connection connection = getConnection();
             Statement statement = connection.createStatement()) {
            statement.execute(artikelSql);
            statement.execute(warenkorbSql);
            seedArtikelIfEmpty(connection);
        } catch (SQLException e) {
            throw new IllegalStateException("Could not initialize database", e);
        }
    }

    private static void seedArtikelIfEmpty(Connection connection) throws SQLException {
        try (PreparedStatement countStatement = connection.prepareStatement("SELECT COUNT(*) FROM artikel");
             ResultSet resultSet = countStatement.executeQuery()) {
            resultSet.next();
            if (resultSet.getInt(1) > 0) {
                return;
            }
        }

        String insertSql = "INSERT INTO artikel (artikelId, name, preis, bild) VALUES (?, ?, ?, ?)";
        try (PreparedStatement statement = connection.prepareStatement(insertSql)) {
            for (ArtikelSeed artikel : ARTIKEL_SEEDS) {
                statement.setInt(1, artikel.artikelId());
                statement.setString(2, artikel.name());
                statement.setDouble(3, artikel.preis());
                statement.setString(4, artikel.bild());
                statement.addBatch();
            }
            statement.executeBatch();
        }
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

    private record ArtikelSeed(int artikelId, String name, double preis, String bild) {
    }
}
