package ch.suva.bi7.webshop;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

public class WarenkorbDao {

    private static final String DEFAULT_JDBC_URL = "jdbc:h2:file:./data/webshop-db;AUTO_SERVER=TRUE";
    private static final String JDBC_USER = "sa";
    private static final String JDBC_PASSWORD = "";

    private final String jdbcUrl;

    public WarenkorbDao() {
        this(DEFAULT_JDBC_URL);
    }

    public WarenkorbDao(String jdbcUrl) {
        this.jdbcUrl = jdbcUrl;
    }

    public List<WarenkorbItem> getWarenkorbByUser(String email) {
        String sql = """
                SELECT wi.warenkorbItemId,
                       wi.userEmail,
                       wi.artikelId,
                       wi.menge,
                       a.name,
                       a.preis,
                       a.bild
                FROM warenkorb_item wi
                JOIN artikel a ON a.artikelId = wi.artikelId
                WHERE wi.userEmail = ?
                ORDER BY wi.warenkorbItemId
                """;

        List<WarenkorbItem> items = new ArrayList<>();

        try (Connection connection = getConnection();
             PreparedStatement statement = connection.prepareStatement(sql)) {
            statement.setString(1, email);
            try (ResultSet resultSet = statement.executeQuery()) {
                while (resultSet.next()) {
                    items.add(new WarenkorbItem(
                            resultSet.getInt("warenkorbItemId"),
                            resultSet.getString("userEmail"),
                            resultSet.getInt("artikelId"),
                            resultSet.getInt("menge"),
                            resultSet.getString("name"),
                            resultSet.getDouble("preis"),
                            resultSet.getString("bild")
                    ));
                }
            }
        } catch (SQLException e) {
            throw new IllegalStateException("Could not load cart for user: " + email, e);
        }

        return items;
    }

    public void addArtikelToWarenkorb(String email, int artikelId, int menge) {
        String selectSql = "SELECT warenkorbItemId FROM warenkorb_item WHERE userEmail = ? AND artikelId = ?";
        String updateSql = "UPDATE warenkorb_item SET menge = menge + ? WHERE warenkorbItemId = ?";
        String insertSql = "INSERT INTO warenkorb_item (userEmail, artikelId, menge) VALUES (?, ?, ?)";

        try (Connection connection = getConnection()) {
            try (PreparedStatement selectStatement = connection.prepareStatement(selectSql)) {
                selectStatement.setString(1, email);
                selectStatement.setInt(2, artikelId);
                try (ResultSet resultSet = selectStatement.executeQuery()) {
                    if (resultSet.next()) {
                        try (PreparedStatement updateStatement = connection.prepareStatement(updateSql)) {
                            updateStatement.setInt(1, menge);
                            updateStatement.setInt(2, resultSet.getInt("warenkorbItemId"));
                            updateStatement.executeUpdate();
                        }
                        return;
                    }
                }
            }

            try (PreparedStatement insertStatement = connection.prepareStatement(insertSql)) {
                insertStatement.setString(1, email);
                insertStatement.setInt(2, artikelId);
                insertStatement.setInt(3, menge);
                insertStatement.executeUpdate();
            }
        } catch (SQLException e) {
            throw new IllegalStateException("Could not add artikel to cart", e);
        }
    }

    public void updateMenge(int warenkorbItemId, int menge) {
        String sql = "UPDATE warenkorb_item SET menge = ? WHERE warenkorbItemId = ?";

        try (Connection connection = getConnection();
             PreparedStatement statement = connection.prepareStatement(sql)) {
            statement.setInt(1, menge);
            statement.setInt(2, warenkorbItemId);
            statement.executeUpdate();
        } catch (SQLException e) {
            throw new IllegalStateException("Could not update quantity of cart item: " + warenkorbItemId, e);
        }
    }

    public void deleteWarenkorbItem(int warenkorbItemId) {
        String sql = "DELETE FROM warenkorb_item WHERE warenkorbItemId = ?";

        try (Connection connection = getConnection();
             PreparedStatement statement = connection.prepareStatement(sql)) {
            statement.setInt(1, warenkorbItemId);
            statement.executeUpdate();
        } catch (SQLException e) {
            throw new IllegalStateException("Could not delete cart item: " + warenkorbItemId, e);
        }
    }

    private Connection getConnection() throws SQLException {
        return DriverManager.getConnection(jdbcUrl, JDBC_USER, JDBC_PASSWORD);
    }
}