package it.formatore.jobtracker.controller;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import it.formatore.jobtracker.model.*;
import it.formatore.jobtracker.repository.AziendaRepository;
import it.formatore.jobtracker.repository.CandidaturaRepository;

@RestController
@RequestMapping("/rest/candidature")
@CrossOrigin(origins="*")
public class CandidaturaController {
	
	private final CandidaturaRepository repo ;
	public CandidaturaController (CandidaturaRepository repo) {
		this.repo=repo;
	}
	
    @Autowired 
    private AziendaRepository repoA;
	
	@GetMapping
	public List<Candidatura> getAll(){
	return repo.findAll();
	}
	
	@GetMapping("/{id}")
	public Candidatura getById(@PathVariable Integer id) {
		return repo.findById(id).orElseThrow(()-> new ResponseStatusException(HttpStatus.NOT_FOUND,"Errore ", null));
		
	}
	@PostMapping
	@ResponseStatus(HttpStatus.CREATED)
	public Candidatura create(@RequestBody Candidatura candidatura) {
		
		Azienda a= repoA.findById(candidatura.getAzienda().getIdAzienda())
				.orElseThrow(()-> new ResponseStatusException(HttpStatus.NOT_FOUND,"Errore ", null));
		candidatura.setAzienda(a);
		candidatura.setDataInvio(new java.util.Date());
		return repo.save(candidatura);
	}
	
	@PutMapping("/{id}")
	public Candidatura updateCandidatura(@PathVariable Integer id, @RequestBody Candidatura candidaturaModificata) {
	    return repo.findById(id).map(candidaturaEsistente -> {

	        candidaturaEsistente.setPosizioneLavorativa(candidaturaModificata.getPosizioneLavorativa());
	        candidaturaEsistente.setDataInvio(candidaturaModificata.getDataInvio());
	        candidaturaEsistente.setStato(candidaturaModificata.getStato());

	        if (candidaturaModificata.getAzienda() == null || candidaturaModificata.getAzienda().getIdAzienda() == null) {
	            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Azienda non settata");
	        }

	        Azienda azienda = repoA.findById(candidaturaModificata.getAzienda().getIdAzienda())
	                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Azienda non trovata"));

	        candidaturaEsistente.setAzienda(azienda);

	        return repo.save(candidaturaEsistente);

	    }).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Candidatura non trovata"));
	}
	
	@PutMapping("/{id}/stato")
	public Candidatura updateStato(@PathVariable Integer id, @RequestBody Map<String, String> body) {
	    return repo.findById(id).map(candidaturaEsistente -> {
	        candidaturaEsistente.setStato(body.get("stato"));
	        return repo.save(candidaturaEsistente);
	    }).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Candidatura non trovata"));
	}
	
	@GetMapping("/ricerca")
	public List<Candidatura> ricercaAvanzata(
	        @RequestParam(required = false) String stato,
	        @RequestParam(required = false) String azienda,
	        @RequestParam(required = false) String posizione) {

	    return repo.findAll().stream()
	            .filter(c -> stato == null || stato.isBlank()
	                    || (c.getStato() != null && c.getStato().equalsIgnoreCase(stato.trim())))
	            .filter(c -> azienda == null || azienda.isBlank()
	                    || (c.getAzienda() != null
	                    && c.getAzienda().getNome() != null
	                    && c.getAzienda().getNome().toLowerCase().contains(azienda.trim().toLowerCase())))
	            .filter(c -> posizione == null || posizione.isBlank()
	                    || (c.getPosizioneLavorativa() != null
	                    && c.getPosizioneLavorativa().toLowerCase().contains(posizione.trim().toLowerCase())))
	            .toList();
	}

	@GetMapping("/{id}/skills")
	public List<Skill> getSkillsByCandidatura(@PathVariable Integer id) {
	    Candidatura candidatura = repo.findById(id)
	            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Candidatura non trovata"));

	    if (candidatura.getSkills() == null || candidatura.getSkills().isEmpty()) {
	        throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Nessuna skill associata a questa candidatura");
	    }

	    return candidatura.getSkills();
	}
	
	@DeleteMapping("/{id}")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void delete(@PathVariable Integer id) {
	    if (!repo.existsById(id)) {
	        throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Candidatura non trovata");
	    }
	    repo.deleteById(id);
	}
}
