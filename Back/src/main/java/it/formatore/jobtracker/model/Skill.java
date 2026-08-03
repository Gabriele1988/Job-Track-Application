package it.formatore.jobtracker.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor

@Entity
@Table(name = "skill")
public class Skill {
	@Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_skill")
	private Integer idSkill;
	
	@Column(name = "tipologia", nullable = false, length = 50)
	private String tipologia;
	@Column(name = "nome", nullable = false, unique = true, length = 80)
	private String nome;
}
