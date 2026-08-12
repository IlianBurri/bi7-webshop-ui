package ch.suva.bi7.webshop;

public record WarenkorbItem(
        int warenkorbItemId,
        String userEmail,
        int artikelId,
        int menge,
        String artikelName,
        double artikelPreis,
        String artikelBild
) {
}