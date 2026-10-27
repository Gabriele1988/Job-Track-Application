package it.formatore.jobtracker.security;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/**
 * Le letture (GET) sono libere: chiunque, anche l'ospite, puo' vedere i dati.
 * Le modifiche (POST, PUT, PATCH, DELETE) richiedono il token ottenuto col login,
 * inviato nell'header "Authorization: Bearer <token>".
 */
@Component
public class WriteProtectionInterceptor implements HandlerInterceptor {

    private static final String LOGIN_PATH = "/rest/utenti/login";

    private final AuthTokenService tokenService;

    public WriteProtectionInterceptor(AuthTokenService tokenService) {
        this.tokenService = tokenService;
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler)
            throws Exception {

        String method = request.getMethod();

        // Letture e richieste CORS preliminari passano sempre
        if ("GET".equals(method) || "HEAD".equals(method) || "OPTIONS".equals(method)) {
            return true;
        }

        // Il login deve restare accessibile a tutti
        if (LOGIN_PATH.equals(request.getRequestURI())) {
            return true;
        }

        String header = request.getHeader("Authorization");
        String token = (header != null && header.startsWith("Bearer ")) ? header.substring(7) : null;

        if (tokenService.isValid(token)) {
            return true;
        }

        response.setStatus(HttpStatus.UNAUTHORIZED.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");
        response.getWriter().write(
                "{\"message\":\"Accesso in sola lettura: effettua il login per modificare i dati.\"}");
        return false;
    }
}
