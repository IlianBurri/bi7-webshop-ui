package ch.suva.bi7.webshop;

import org.eclipse.jetty.server.Handler;
import org.eclipse.jetty.server.Request;
import org.eclipse.jetty.server.Response;
import org.eclipse.jetty.util.Callback;

import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.time.Instant;

public class BuffApiHandler extends Handler.Abstract {

    @Override
    public boolean handle(Request request, Response response, Callback callback) throws Exception {
        if (!"GET".equalsIgnoreCase(request.getMethod())
                || !"/api/buff-status".equals(Request.getPathInContext(request))) {
            return false;
        }

        long expirationTimestamp = Instant.now()
                .plusSeconds(7 * 24 * 60 * 60)
                .toEpochMilli();

        String json = String.format(
                "{\"status\":\"ok\",\"expiration\":%d,\"message\":\"FreeBuff expiration check\"}",
                expirationTimestamp
        );

        response.getHeaders().put("Content-Type", "application/json");
        response.write(true, ByteBuffer.wrap(json.getBytes(StandardCharsets.UTF_8)), callback);
        return true;
    }
}
