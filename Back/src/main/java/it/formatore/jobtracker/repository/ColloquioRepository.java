package it.formatore.jobtracker.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import it.formatore.jobtracker.model.Colloquio;

@Repository
public interface ColloquioRepository extends JpaRepository<Colloquio,Integer> {

}
