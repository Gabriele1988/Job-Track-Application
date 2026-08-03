package it.formatore.jobtracker.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import it.formatore.jobtracker.model.Utente;
import it.formatore.jobtracker.repository.UtenteRepository;

@RestController
@RequestMapping("/rest/utenti")
@CrossOrigin(origins="*")
public class UtenteController {

    private final UtenteRepository repo;

    public UtenteController(UtenteRepository repo) {
        this.repo = repo;
    }

    @GetMapping
    public List<Utente> getAll() {
        return repo.findAll();
    }

    @PostMapping("/login")
    @ResponseStatus(HttpStatus.OK)
    public Map<String, String> login(@RequestBody Utente utente) {
        Utente trovato = repo.findAll().stream()
                .filter(u -> u.getUsername().equalsIgnoreCase(utente.getUsername())
                          && u.getPassword().equals(utente.getPassword()))
                .findFirst()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Credenziali errate"));

        return Map.of(
                "username", trovato.getUsername()
        );
    }
}