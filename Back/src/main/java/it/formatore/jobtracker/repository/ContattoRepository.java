package it.formatore.jobtracker.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import it.formatore.jobtracker.model.Contatto;

@Repository
public interface ContattoRepository extends JpaRepository<Contatto,Integer> {

	// Per trovare i contatti dall'azienda - Uso "ID" perchè è la sua primary key
	List<Contatto> findByAzienda_IdAzienda(Integer idAzienda);
	
}
