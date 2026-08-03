package it.formatore.jobtracker.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.persistence.GeneratedValue;

@Data
@NoArgsConstructor
@AllArgsConstructor

@Entity
@Table(name = "azienda")

public class Azienda {

    public Azienda(Integer idAzienda, String nome, String settore, String citta, String sitoweb, String notePersonali) {
		super();
		this.idAzienda = idAzienda;
		this.nome = nome;
		this.settore = settore;
		this.citta = citta;
		this.sitoweb = sitoweb;
		this.notePersonali = notePersonali;
	}
    
	@Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_azienda")
    private Integer idAzienda;

    @Column(name = "nome", nullable = false, unique = true, length = 150)
    private String nome;
    @Column(name = "settore", length = 150)
    private String settore;
    @Column(name = "citta", nullable = false, length = 100)
    private String citta;
    @Column(name = "sito_web", nullable = false, length = 200)
    private String sitoweb;
    @Column(name = "note_personali", columnDefinition = "text")
    private String notePersonali;
    @Column(name = "immagine", nullable = false, length = 1000)
    private String immagine;
    
}