package it.formatore.jobtracker.controller;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

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

import it.formatore.jobtracker.model.Azienda;
import it.formatore.jobtracker.repository.AziendaRepository;

@RestController
@RequestMapping("/rest/aziende")
@CrossOrigin(origins="*")
public class AziendaController {
	// Response lo creo sempre io 
	private final AziendaRepository repo;
	
	// iniejcton Spring inietta il codice del repository tramite dell'oggetto della classe che implementa interfaccia 
	public AziendaController(AziendaRepository repo) {
		this.repo=repo;
	}
	// get che invica findAll ma poi tramite gli strem cerca una specifica citta
	// passata come parametro in ingresso
	
	@GetMapping
	public List<Azienda> getAziende(@RequestParam(required=false) String citta){
		List<Azienda> percitta=repo.findAll();
		if (citta == null || citta.isEmpty()) {
	        return repo.findAll(); // Restituisce tutto se non filtri
	    }
		if(percitta.isEmpty()==false) {
			return percitta.stream()
					.filter(a->a.getCitta().equalsIgnoreCase(citta)).collect(Collectors.toList());
							
		}
		
		return percitta;// si preoccupa lui di inglobarlo in Response.ok()
	}
	@GetMapping("/nomi")
	public List<Map<String,String>> getSoliNomi(){
		return repo.findAll().stream().map(a->Map.of(
				"id",String.valueOf(a.getIdAzienda()),
				"nome",a.getNome()
				)).collect(Collectors.toList());
	}
	
	@GetMapping("/{id}")
	public Azienda getAzienda(@PathVariable Integer id) {
		return repo.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,"Errore ", null));
	}
	
	@PostMapping
	@ResponseStatus(HttpStatus.CREATED)
	public Azienda creaAzienda(@RequestBody Azienda nuova) {
	    // 1. Controllo sicurezza (Nome non vuoto)
	    if (nuova.getNome() == null || nuova.getNome().trim().isEmpty()) {
	        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Campo nome obbligatorio");
	    }
	    
	    // 2. Controllo duplicati (usa il trim per essere sicuro)
	    String nomePulito = nuova.getNome().trim();
	    boolean esiste = repo.findAll().stream()
	                         .anyMatch(a -> a.getNome().trim().equalsIgnoreCase(nomePulito));
	    
	    if (esiste) {
	        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Azienda già presente");
	    }
	    
	    return repo.save(nuova);
	}
	@PutMapping("/{id}") // 
	public Azienda updateAzienda(@PathVariable Integer id, @RequestBody Azienda aziendaModificata) {
	    return repo.findById(id).map(aziendaEsistente -> {
	        aziendaEsistente.setNome(aziendaModificata.getNome());
	        aziendaEsistente.setCitta(aziendaModificata.getCitta());
	        aziendaEsistente.setSitoweb(aziendaModificata.getSitoweb());
	        aziendaEsistente.setNotePersonali(aziendaModificata.getNotePersonali());
	        return repo.save(aziendaEsistente);
	    }).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Azienda non trovata"));
	}
	@DeleteMapping("/{id}")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void deleteAzienda(@PathVariable Integer id) {
	    if (!repo.existsById(id)) {
	        throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Azienda non trovata, impossibile eliminare");
	    }
	    repo.deleteById(id);
	}
}
