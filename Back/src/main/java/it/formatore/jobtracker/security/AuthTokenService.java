package it.formatore.jobtracker.security;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.util.Base64;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

/**
 * Crea e verifica token firmati (HMAC-SHA256) per gli utenti che fanno login.
 * Formato del token: base64url(username) + "." + base64url(firma).
 *
 * La chiave segreta arriva dalla variabile d'ambiente AUTH_SECRET.
 * Se manca, ne viene generata una casuale all'avvio: funziona lo stesso,
 * ma a ogni riavvio del server bisogna rifare il login.
 */
@Service
public class AuthTokenService {

    private static final Base64.Encoder B64 = Base64.getUrlEncoder().withoutPadding();
    private static final Base64.Decoder B64_DEC = Base64.getUrlDecoder();

    private final byte[] secret;

    public AuthTokenService(@Value("${auth.secret:}") String configuredSecret) {
        if (configuredSecret == null || configuredSecret.isBlank()) {
            byte[] random = new byte[32];
            new SecureRandom().nextBytes(random);
            this.secret = random;
        } else {
            this.secret = configuredSecret.getBytes(StandardCharsets.UTF_8);
        }
    }

    public String createToken(String username) {
        String payload = B64.encodeToString(username.getBytes(StandardCharsets.UTF_8));
        return payload + "." + sign(payload);
    }

    /** Restituisce true se il token e' stato firmato da questo server. */
    public boolean isValid(String token) {
        if (token == null) return false;
        int dot = token.indexOf('.');
        if (dot <= 0 || dot == token.length() - 1) return false;

        String payload = token.substring(0, dot);
        String signature = token.substring(dot + 1);

        try {
            B64_DEC.decode(payload);
        } catch (IllegalArgumentException e) {
            return false;
        }

        return MessageDigest.isEqual(
                sign(payload).getBytes(StandardCharsets.UTF_8),
                signature.getBytes(StandardCharsets.UTF_8));
    }

    private String sign(String payload) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(secret, "HmacSHA256"));
            return B64.encodeToString(mac.doFinal(payload.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception e) {
            throw new IllegalStateException("Impossibile firmare il token", e);
        }
    }
}
