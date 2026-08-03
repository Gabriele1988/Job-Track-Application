package it.formatore.jobtracker;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import it.formatore.jobtracker.model.Azienda;
import it.formatore.jobtracker.repository.AziendaRepository;
import jakarta.transaction.Transactional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(classes = JobTrackerSpringApplication.class)
@AutoConfigureMockMvc
@Transactional // Fondamentale per annullare le modifiche al DB dopo ogni test
public class AziendaControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private AziendaRepository aziendaRepository;

    private Integer testId;

    // Prima di ogni test, creiamo un'azienda nel database per avere un ID valido su cui testare
    @BeforeEach
    public void setup() {
        Azienda az = new Azienda(null, "Azienda Iniziale", "IT", "Napoli", "www.test.it", "Note");
        testId = aziendaRepository.save(az).getIdAzienda();
    }

    @Test
    public void testGetAllAziende() throws Exception {
        mockMvc.perform(get("/rest/aziende"))
               .andExpect(status().isOk())
               .andExpect(content().contentType(MediaType.APPLICATION_JSON));
    }

    @Test
    public void testCreateAzienda() throws Exception {
        String nomeUnico = "Azienda " + System.currentTimeMillis(); // Nome sempre diverso!
        String json = """
            {
                "nome": "%s",
                "citta": "Napoli",
                "sitoweb": "https://test.it",
                "notePersonali": "Test di inserimento"
            }
            """.formatted(nomeUnico);

        mockMvc.perform(post("/rest/aziende")
               .contentType(MediaType.APPLICATION_JSON)
               .content(json))
               .andDo(print()) // Ora vedrai l'errore specifico nel log!
               .andExpect(status().isCreated());
    }
    @Test
    public void testUpdateAzienda() throws Exception {
        // Prepariamo il JSON per l'aggiornamento
        String json = """
            {
                "nome": "Azienda Aggiornata",
                "citta": "Milano",
                "sitoweb": "https://nuovo-test.it",
                "notePersonali": "Aggiornato"
            }
            """;

        // Usiamo PUT passando l'ID dell'azienda creata nel setup
        mockMvc.perform(put("/rest/aziende/{id}", testId)
               .contentType(MediaType.APPLICATION_JSON)
               .content(json))
               .andExpect(status().isOk());
    }

    @Test
    public void testDeleteAzienda() throws Exception {
        // Usiamo DELETE passando l'ID creato nel setup
        mockMvc.perform(delete("/rest/aziende/{id}", testId))
               .andExpect(status().isNoContent()); // Ci aspettiamo 204 No Content
    }
}