package it.formatore.jobtracker.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import it.formatore.jobtracker.model.Candidatura;

@Repository
public interface CandidaturaRepository extends JpaRepository<Candidatura,Integer> {

}
