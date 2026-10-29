package ch.suva.bi7.webshop;

import org.eclipse.jetty.ee10.webapp.WebAppContext;
import org.eclipse.jetty.rewrite.handler.RedirectRegexRule;
import org.eclipse.jetty.rewrite.handler.RewriteHandler;
import org.eclipse.jetty.server.Handler;
import org.eclipse.jetty.server.Server;
//import org.eclipse.jetty.server.handler.CrossOriginHandler;
import org.eclipse.jetty.util.resource.ResourceFactory;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
//import java.util.Set;

// https://jetty.org/docs/jetty/12.1/operations-guide/session/index.html
public class BI7WebshopWebserver {

    public static final int DEFAULT_PORT = 8080;
    // Regex: requests from pages served by 192.168.1.30, 127.0.0.1 or localhost (http or https, any port) are allowed cross-origin
    private static final String ALLOWED_ORIGIN_PATTERN = "https?://(192\\.168\\.1\\.30|127\\.0\\.0\\.1|localhost)(:\\d+)?";

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

        // Cors Handler
//        CrossOriginHandler crossOriginHandler = new CrossOriginHandler();
//        crossOriginHandler.setAllowedOriginPatterns(Set.of(ALLOWED_ORIGIN_PATTERN));
//        crossOriginHandler.setAllowedMethods(Set.of("GET", "POST", "PUT", "DELETE", "HEAD", "OPTIONS"));
//        crossOriginHandler.setAllowedHeaders(Set.of("X-Requested-With", "Content-Type", "Accept", "Origin", "Access-Control-Allow-Origin", "authorization"));
//        crossOriginHandler.setAllowCredentials(true);

        RewriteHandler rewriteHandler = new RewriteHandler();
        RedirectRegexRule redirectRule = new RedirectRegexRule("^/$", "/HTML/landingpage.html");
        rewriteHandler.addRule(redirectRule);
        rewriteHandler.setHandler(new Handler.Sequence(webAppContext /*, crossOriginHandler*/));
        server.setHandler(rewriteHandler);

        server.start();
        System.out.println("Server started!");
        server.join();
    }
}
