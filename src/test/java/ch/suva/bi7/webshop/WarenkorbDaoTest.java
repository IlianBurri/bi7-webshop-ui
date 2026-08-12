package ch.suva.bi7.webshop;

import static org.junit.jupiter.api.Assertions.assertEquals;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.Statement;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class WarenkorbDaoTest {

    private static final String JDBC_URL = "jdbc:h2:mem:warenkorb-test;DB_CLOSE_DELAY=-1";

    private WarenkorbDao dao;

    @BeforeEach
    void setUp() throws Exception {
        try (Connection connection = DriverManager.getConnection(JDBC_URL, "sa", "");
             Statement statement = connection.createStatement()) {
            statement.execute("DROP TABLE IF EXISTS warenkorb_item");
            statement.execute("DROP TABLE IF EXISTS artikel");
            statement.execute("""
                    CREATE TABLE artikel (
                        artikelId INT AUTO_INCREMENT PRIMARY KEY,
                        name VARCHAR(255) NOT NULL,
                        preis DECIMAL(10, 2) NOT NULL,
                        bild VARCHAR(500)
                    )
                    """);
            statement.execute("""
                    CREATE TABLE warenkorb_item (
                        warenkorbItemId INT AUTO_INCREMENT PRIMARY KEY,
                        userEmail VARCHAR(255) NOT NULL,
                        artikelId INT NOT NULL,
                        menge INT NOT NULL DEFAULT 1,
                        FOREIGN KEY (artikelId) REFERENCES artikel (artikelId)
                    )
                    """);
            statement.execute("INSERT INTO artikel (artikelId, name, preis, bild) VALUES (1, 'iPhone 15 Pro', 1199.00, NULL)");
            statement.execute("INSERT INTO artikel (artikelId, name, preis, bild) VALUES (2, 'Samsung Galaxy S24', 899.90, NULL)");
        }
        dao = new WarenkorbDao(JDBC_URL);
    }

    @Test
    void addNewArtikelCreatesRowWithGivenMenge() {
        dao.addArtikelToWarenkorb("a@test.ch", 1, 3);

        List<WarenkorbItem> items = dao.getWarenkorbByUser("a@test.ch");
        assertEquals(1, items.size());
        assertEquals(3, items.get(0).menge());
        assertEquals("iPhone 15 Pro", items.get(0).artikelName());
        assertEquals(1199.00, items.get(0).artikelPreis());
    }

    @Test
    void addingSameArtikelAgainIncrementsMengeInsteadOfDuplicating() {
        dao.addArtikelToWarenkorb("a@test.ch", 1, 2);
        dao.addArtikelToWarenkorb("a@test.ch", 1, 5);

        List<WarenkorbItem> items = dao.getWarenkorbByUser("a@test.ch");
        assertEquals(1, items.size());
        assertEquals(7, items.get(0).menge());
    }

    @Test
    void cartIsIsolatedPerUser() {
        dao.addArtikelToWarenkorb("a@test.ch", 1, 1);
        dao.addArtikelToWarenkorb("b@test.ch", 2, 2);

        List<WarenkorbItem> a = dao.getWarenkorbByUser("a@test.ch");
        List<WarenkorbItem> b = dao.getWarenkorbByUser("b@test.ch");
        assertEquals(1, a.size());
        assertEquals(1, a.get(0).menge());
        assertEquals(1, b.size());
        assertEquals("Samsung Galaxy S24", b.get(0).artikelName());
        assertEquals(2, b.get(0).menge());
    }

    @Test
    void updateMengeSetsQuantity() {
        dao.addArtikelToWarenkorb("a@test.ch", 1, 1);
        int itemId = dao.getWarenkorbByUser("a@test.ch").get(0).warenkorbItemId();

        dao.updateMenge(itemId, 9);

        assertEquals(9, dao.getWarenkorbByUser("a@test.ch").get(0).menge());
    }

    @Test
    void deleteWarenkorbItemRemovesOnlyThatRow() {
        dao.addArtikelToWarenkorb("a@test.ch", 1, 1);
        dao.addArtikelToWarenkorb("a@test.ch", 2, 1);
        int firstItemId = dao.getWarenkorbByUser("a@test.ch").get(0).warenkorbItemId();

        dao.deleteWarenkorbItem(firstItemId);

        List<WarenkorbItem> items = dao.getWarenkorbByUser("a@test.ch");
        assertEquals(1, items.size());
        assertEquals(2, items.get(0).artikelId());
    }
}
