package it.formatore.jobtracker.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import it.formatore.jobtracker.model.Azienda;
import it.formatore.jobtracker.model.Colloquio;
import it.formatore.jobtracker.model.Contatto;
import it.formatore.jobtracker.repository.AziendaRepository;
import it.formatore.jobtracker.repository.ContattoRepository;

@RestController
@RequestMapping("/rest/contatti")
@CrossOrigin(origins="*")
public class ContattoController {

	private final ContattoRepository repo;
	private final AziendaRepository repo2;
	
	public ContattoController (ContattoRepository repo,AziendaRepository repo2) {
		this.repo=repo;
		this.repo2=repo2;
	}
	
	@GetMapping
	public List<Contatto> getAll(){
		return repo.findAll();
	}
	@GetMapping("/{id}")
	public List<Contatto> getByIdAzienda(@PathVariable Integer id){
		return repo.findByAzienda_IdAzienda(id);
	}
	@PostMapping
	@ResponseStatus(HttpStatus.CREATED)
	public Contatto create(@RequestBody Contatto contatto) {
		var a= repo2.findById(contatto.getAzienda().getIdAzienda())
				.orElseThrow(()-> new ResponseStatusException(HttpStatus.NOT_FOUND,"Errore ", null));
		contatto.setAzienda(a);
		return repo.save(contatto);
	}
	@PutMapping("/{id}") //
    public Contatto updateContatto(@PathVariable Integer id, @RequestBody Contatto contattoModificato) {
        return repo.findById(id).map(contattoEsistente -> {
            contattoEsistente .setNome(contattoModificato.getNome());
            contattoEsistente .setCognome(contattoModificato.getCognome());
            contattoEsistente .setEmail(contattoModificato.getEmail());
            contattoEsistente .setRuolo(contattoModificato.getRuolo());
            contattoEsistente .setCell(contattoModificato.getCell());
            return repo.save(contattoEsistente );
        }).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Contatto non trovato"));
    }
	@DeleteMapping("/{id}")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void deleteContatto(@PathVariable Integer id) {
	    if (!repo.existsById(id)) {
	        throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Contatto non trovata, impossibile eliminare");
	    }
	    repo.deleteById(id);
	}
	
	@GetMapping("/{id}/colloqui")
	public List<Colloquio> getColloquiByContatto(@PathVariable Integer id) {
	    Contatto contatto = repo.findById(id)
	            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Contatto non trovato"));

	    List<Colloquio> colloqui = contatto.getColloqui();

	    if (colloqui == null || colloqui.isEmpty()) {
	        throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Nessun colloquio associato a questo contatto");
	    }

	    return colloqui.stream()
	            .sorted((c1, c2) -> c2.getDataOra().compareTo(c1.getDataOra()))
	            .toList();
	}
	
}