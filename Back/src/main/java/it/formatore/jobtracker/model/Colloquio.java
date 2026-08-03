package it.formatore.jobtracker.model;

import java.util.Date;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
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
@Table(name = "colloquio")

public class Colloquio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_colloquio")
    private Integer idColloquio;
    @ManyToOne
    @JoinColumn(name = "id_candidatura", nullable = false)
    private Candidatura candidatura;

    @Temporal(TemporalType.TIMESTAMP) 
	@Column(name="data_ora",nullable=false)
    private Date dataOra;
    @Column(name = "tipo_colloquio", nullable = false, length = 50)
    private String tipoColloquio;
    @Column(name = "esito", nullable = false, length = 50)
    private String esito="In Attesa";
    @Column(name = "note", columnDefinition = "text")
    private String note;

}