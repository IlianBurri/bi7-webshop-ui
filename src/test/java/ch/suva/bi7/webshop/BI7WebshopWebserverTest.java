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
}
