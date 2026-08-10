package ch.suva.bi7.webshop;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

import org.junit.jupiter.api.Test;

class BI7WebshopWebserverTest {

    @Test
    void defaultPortIs8080() {
        assertEquals(8080, BI7WebshopWebserver.getDefaultPort());
    }

    @Test
    void resolvesWebAppDirectoryFromProjectRoot() throws IOException {
        Path tempRoot = Files.createTempDirectory("bi7-webshop-ui-");
        Path webAppDir = Files.createDirectories(tempRoot.resolve("src/main/webapp"));

        Path actual = BI7WebshopWebserver.resolveWebAppDir(tempRoot.toString());

        assertEquals(webAppDir.toAbsolutePath().normalize(), actual);
    }

    @Test
    void resolvesWebAppDirectoryFromSrcMainFolder() throws IOException {
        Path tempRoot = Files.createTempDirectory("bi7-webshop-ui-");
        Path webAppDir = Files.createDirectories(tempRoot.resolve("src/main/webapp"));

        Path actual = BI7WebshopWebserver.resolveWebAppDir(tempRoot.resolve("src/main").toString());

        assertEquals(webAppDir.toAbsolutePath().normalize(), actual);
    }

    @Test
    void throwsWhenWebAppDirectoryDoesNotExist() {
        assertThrows(IllegalStateException.class, () -> BI7WebshopWebserver.resolveWebAppDir("/tmp/does-not-exist"));
    }

    @Test
    void parseMengeAcceptsValuesWithinRange() {
        assertEquals(1, BI7WebshopWebserver.parseMenge("1"));
        assertEquals(50, BI7WebshopWebserver.parseMenge("50"));
        assertEquals(99, BI7WebshopWebserver.parseMenge("99"));
    }

    @Test
    void parseMengeRejectsValuesOutOfRange() {
        assertThrows(IllegalArgumentException.class, () -> BI7WebshopWebserver.parseMenge("0"));
        assertThrows(IllegalArgumentException.class, () -> BI7WebshopWebserver.parseMenge("-3"));
        assertThrows(IllegalArgumentException.class, () -> BI7WebshopWebserver.parseMenge("100"));
    }

    @Test
    void parseMengeRejectsNonNumericAndBlankValues() {
        assertThrows(IllegalArgumentException.class, () -> BI7WebshopWebserver.parseMenge("abc"));
        assertThrows(IllegalArgumentException.class, () -> BI7WebshopWebserver.parseMenge(""));
        assertThrows(IllegalArgumentException.class, () -> BI7WebshopWebserver.parseMenge(null));
    }

    @Test
    void parseMengeErrorMessagesDescribeTheProblem() {
        IllegalArgumentException nonNumeric = assertThrows(
                IllegalArgumentException.class, () -> BI7WebshopWebserver.parseMenge("abc"));
        assertEquals("menge muss eine Zahl sein", nonNumeric.getMessage());

        IllegalArgumentException outOfRange = assertThrows(
                IllegalArgumentException.class, () -> BI7WebshopWebserver.parseMenge("100"));
        assertEquals("menge muss zwischen 1 und 99 liegen", outOfRange.getMessage());

        IllegalArgumentException blank = assertThrows(
                IllegalArgumentException.class, () -> BI7WebshopWebserver.parseMenge(""));
        assertEquals("menge ist erforderlich", blank.getMessage());
    }
}
