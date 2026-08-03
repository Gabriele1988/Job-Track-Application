package it.formatore.jobtracker.controller;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import it.formatore.jobtracker.model.Azienda;
import it.formatore.jobtracker.model.Candidatura;
import it.formatore.jobtracker.model.Skill;
import it.formatore.jobtracker.repository.SkillRepository;

@RestController
@RequestMapping("/rest/skill")
@CrossOrigin(origins="*")
public class SkillController {
	// Response lo creo sempre io 
	private final SkillRepository repo;
	
	// iniejcton Spring inietta il codice del repository tramite dell'oggetto della classe che implementa interfaccia 
	public SkillController(SkillRepository repo) {
		this.repo=repo;
	}
	// get che invica findAll ma poi tramite gli strem cerca una specifica citta
	// passata come parametro in ingresso
	@GetMapping
	public List<Skill> getAll(@RequestParam(required = false) String tipologia) {
	    List<Skill> skills = repo.findAll();

	    if (tipologia == null || tipologia.isBlank()) {
	        return skills;
	    }

	    return skills.stream()
	            .filter(skill -> skill.getTipologia() != null)
	            .filter(skill -> skill.getTipologia().equalsIgnoreCase(tipologia.trim()))
	            .collect(Collectors.toList());
	}
	
}

