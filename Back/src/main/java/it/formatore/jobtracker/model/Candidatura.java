package it.formatore.jobtracker.model;

import java.util.Date;
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
import jakarta.persistence.Temporal;
import jakarta.persistence.TemporalType;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor

@Entity
@Table(name="candidatura")
public class Candidatura {
	
	@Id
	@GeneratedValue(strategy=GenerationType.IDENTITY)
	@Column(name="id_candidatura")
	private Integer idCandidatura;
	@ManyToOne
	@JoinColumn(name="id_azienda",nullable=false)
	private Azienda azienda;
	
	@Column(name="posizione_lavorativa",nullable=false,length=150)
	private String posizioneLavorativa;
	@Temporal(TemporalType.DATE) 
	@Column(name="data_invio",nullable=false)
	private Date dataInvio = new Date();
	@Column(name="stato",nullable=false,length=50)
	private String stato;
	
	@ManyToMany
    @JoinTable(
        name = "candidatura_skill",
        joinColumns = {@JoinColumn(name = "id_candidatura", referencedColumnName = "id_candidatura")},
        inverseJoinColumns = {@JoinColumn(name = "id_skill", referencedColumnName = "id_skill")}
    )
    private List<Skill> skills;
	
}