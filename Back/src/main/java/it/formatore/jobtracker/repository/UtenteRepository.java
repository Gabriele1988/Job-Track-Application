package it.formatore.jobtracker.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import it.formatore.jobtracker.model.Utente;

public interface UtenteRepository extends JpaRepository<Utente,Integer>{

}
