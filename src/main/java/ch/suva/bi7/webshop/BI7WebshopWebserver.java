package ch.suva.bi7.webshop;

import org.eclipse.jetty.ee10.webapp.WebAppContext;
import org.eclipse.jetty.server.Server;
import org.eclipse.jetty.util.resource.ResourceFactory;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

// https://jetty.org/docs/jetty/12.1/operations-guide/session/index.html

public class BI7WebshopWebserver {

    public static void main(String[] args) throws Exception {
        Server server = new Server(8080);
        WebAppContext webAppContext = new WebAppContext();
        server.setHandler(webAppContext);

        Path projectRoot = Paths.get(System.getProperty("user.dir"));
        if (projectRoot.endsWith(Paths.get("src", "main"))) {
            projectRoot = projectRoot.getParent().getParent();
        }
        Path webAppDir = projectRoot.resolve(Paths.get("src", "main", "webapp")).toAbsolutePath().normalize();

        if (!Files.isDirectory(webAppDir)) {
            throw new IllegalStateException("Web app directory not found: " + webAppDir);
        }

        webAppContext.setBaseResource(ResourceFactory.root().newResource(webAppDir));
        webAppContext.setContextPath("/");
        webAppContext.setWelcomeFiles(new String[]{"index.html"});

        server.start();
        System.out.println("Server started!");
        server.join();
    }
}
