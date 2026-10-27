package it.formatore.jobtracker.model;

import com.fasterxml.jackson.annotation.JsonProperty;

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
@Table(name = "utenti")
public class Utente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="id_utente")
    private Integer id;

    @Column(length = 50, nullable = false)
    private String username;
    // La password si puo' inviare (login) ma non viene mai restituita nelle risposte JSON
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    @Column(length = 10, nullable = false)
    private String password;
    @Column(length = 50, nullable = false)
    private String nome;
    
}
