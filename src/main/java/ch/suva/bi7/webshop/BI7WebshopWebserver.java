package ch.suva.bi7.webshop;

import org.eclipse.jetty.ee10.webapp.WebAppContext;
import org.eclipse.jetty.server.Server;
import org.eclipse.jetty.util.resource.ResourceFactory;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

// https://jetty.org/docs/jetty/12.1/operations-guide/session/index.html

public class   BI7WebshopWebserver {

    public static final int DEFAULT_PORT = 8080;

    public static int getDefaultPort() {
        return DEFAULT_PORT;
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
        Server server = new Server(getDefaultPort());

        WebAppContext webAppContext = new WebAppContext();
        Path webAppDir = resolveWebAppDir(System.getProperty("user.dir"));
        webAppContext.setBaseResource(ResourceFactory.root().newResource(webAppDir));
        webAppContext.setContextPath("/");
        webAppContext.setWelcomeFiles(new String[]{"HTML/landingpage.html"});

        server.setHandler(webAppContext);

        server.start();
        System.out.println("Server started!");
        server.join();
    }
}