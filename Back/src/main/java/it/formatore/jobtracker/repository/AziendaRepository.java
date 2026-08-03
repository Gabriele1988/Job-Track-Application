package it.formatore.jobtracker.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import it.formatore.jobtracker.model.Azienda;

@Repository
public interface AziendaRepository extends JpaRepository<Azienda,Integer> {

}
