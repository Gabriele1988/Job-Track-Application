package it.formatore.jobtracker.model;

import java.util.List;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name="contatto")
public class Contatto {
	@Id
	@GeneratedValue(strategy=GenerationType.IDENTITY)
	@Column(name="id_contatto")
	private Integer idContatto;
	@ManyToOne
	@JoinColumn(name="id_azienda",nullable=false)
	private Azienda azienda;

	@Column(name="nome",nullable=false,length=100)
	private String nome;
	@Column(name="cognome",nullable=false,length=120)
	private String cognome;
	@Column(name="email",nullable=false,length=120)
	private String email;
	@Column(name="ruolo",nullable=false,length=100)
	private String ruolo;
	@Column(name="cell",nullable=false,length=39)
	private String cell;
	
	@ManyToMany
    @JoinTable(
        name = "contatto_colloquio",
        joinColumns = {@JoinColumn(name = "id_contatto", referencedColumnName = "id_contatto")},
        inverseJoinColumns = {@JoinColumn(name = "id_colloquio", referencedColumnName = "id_colloquio")}
    )
    private List<Colloquio> colloqui;
}
