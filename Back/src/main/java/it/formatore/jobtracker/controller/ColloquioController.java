package it.formatore.jobtracker.controller;

import java.util.List;

import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import it.formatore.jobtracker.model.Colloquio;
import it.formatore.jobtracker.repository.CandidaturaRepository;
import it.formatore.jobtracker.repository.ColloquioRepository;


@RestController
@RequestMapping("/rest/colloqui")
@CrossOrigin(origins="*")
public class ColloquioController {

	private final ColloquioRepository repo;
	private final CandidaturaRepository repo2;
	public ColloquioController(ColloquioRepository  repo,CandidaturaRepository repo2) {
		this.repo=repo;
		this.repo2=repo2;
	}
	@PostMapping
	@ResponseStatus(HttpStatus.CREATED)
	public Colloquio create(@RequestBody Colloquio colloquio) {
		
	if(colloquio.getCandidatura().getIdCandidatura()==null) {
		throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Candidatura non settata",null);
	}
	var cand=repo2.findById(colloquio.getCandidatura().getIdCandidatura())
			.orElseThrow(()-> new ResponseStatusException(HttpStatus.NOT_FOUND,"Candidatura non settata",null));
	colloquio.setCandidatura(cand);
	return repo.save(colloquio);
	}
	
	@GetMapping
	public List<Colloquio> getAll(){
		return repo.findAll(Sort.by(Sort.Direction.DESC, "dataOra"));
	}
	
	@GetMapping("/candidatura/{idCandidatura}")
	public List<Colloquio> getByCandidatura(@PathVariable Integer idCandidatura) {

	    if (!repo2.existsById(idCandidatura)) {
	        throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Candidatura non trovata");
	    }

	    List<Colloquio> colloqui = repo.findAll(Sort.by(Sort.Direction.DESC, "dataOra"))
	            .stream()
	            .filter(c -> c.getCandidatura() != null)
	            .filter(c -> c.getCandidatura().getIdCandidatura().equals(idCandidatura))
	            .toList();

	    if (colloqui.isEmpty()) {
	        throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Nessun colloquio trovato per questa candidatura");
	    }

	    return colloqui;
	}
}
