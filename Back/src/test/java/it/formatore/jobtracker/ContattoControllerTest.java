package it.formatore.jobtracker;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.jayway.jsonpath.JsonPath;

import it.formatore.jobtracker.model.Azienda;
import it.formatore.jobtracker.repository.AziendaRepository;

@SpringBootTest(classes = JobTrackerSpringApplication.class)
@AutoConfigureMockMvc
@Transactional
public class ContattoControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private AziendaRepository aziendaRepository;

    private Integer aziendaId;

    @BeforeEach
    public void setup() {
        Azienda az = new Azienda();
        az.setNome("Esempio S.r.l.");
        az.setSettore("Servizi");
        az.setCitta("Napoli");
        az.setSitoweb("www.esempio.it");
        az.setNotePersonali("Note test");
        az.setImmagine("https://example.com/logo.png");

        aziendaId = aziendaRepository.save(az).getIdAzienda();
    }

    @Test
    public void getAllContatti() throws Exception {
        mockMvc.perform(get("/rest/contatti"))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON));
    }

    @Test
    public void getAllContattiByAzienda() throws Exception {
        mockMvc.perform(get("/rest/contatti/{id}", aziendaId))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON));
    }

    @Test
    public void testCreateContatto() throws Exception {
        String json = """
            {
                "nome": "Giuseppe",
                "cognome": "Verdi",
                "email": "giuseppe.verdi@esempio.it",
                "ruolo": "HR Manager",
                "cell": "3339876543",
                "azienda": { "idAzienda": %d }
            }
            """.formatted(aziendaId);

        mockMvc.perform(post("/rest/contatti")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
                .andExpect(status().isCreated())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.nome").value("Giuseppe"))
                .andExpect(jsonPath("$.cognome").value("Verdi"))
                .andExpect(jsonPath("$.email").value("giuseppe.verdi@esempio.it"))
                .andExpect(jsonPath("$.ruolo").value("HR Manager"))
                .andExpect(jsonPath("$.cell").value("3339876543"));
    }

    @Test
    public void testUpdateContatto() throws Exception {
        String jsonCreazione = """
            {
                "nome": "Mario",
                "cognome": "Rossi",
                "email": "mario.rossi@esempio.it",
                "ruolo": "Developer",
                "cell": "3331112222",
                "azienda": { "idAzienda": %d }
            }
            """.formatted(aziendaId);

        String risposta = mockMvc.perform(post("/rest/contatti")
                .contentType(MediaType.APPLICATION_JSON)
                .content(jsonCreazione))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();

        Integer idContatto = JsonPath.read(risposta, "$.idContatto");

        String jsonUpdate = """
            {
                "nome": "Luigi",
                "cognome": "Bianchi",
                "email": "luigi.bianchi@esempio.it",
                "ruolo": "Project Manager",
                "cell": "3339998888"
            }
            """;

        mockMvc.perform(put("/rest/contatti/{id}", idContatto)
                .contentType(MediaType.APPLICATION_JSON)
                .content(jsonUpdate))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.idContatto").value(idContatto))
                .andExpect(jsonPath("$.nome").value("Luigi"))
                .andExpect(jsonPath("$.cognome").value("Bianchi"))
                .andExpect(jsonPath("$.email").value("luigi.bianchi@esempio.it"))
                .andExpect(jsonPath("$.ruolo").value("Project Manager"))
                .andExpect(jsonPath("$.cell").value("3339998888"));
    }

    @Test
    public void testUpdateContattoNotFound() throws Exception {
        String jsonUpdate = """
            {
                "nome": "Luigi",
                "cognome": "Bianchi",
                "email": "luigi.bianchi@esempio.it",
                "ruolo": "Project Manager",
                "cell": "3339998888"
            }
            """;

        mockMvc.perform(put("/rest/contatti/{id}", 999999)
                .contentType(MediaType.APPLICATION_JSON)
                .content(jsonUpdate))
                .andExpect(status().isNotFound())
                .andExpect(result -> assertTrue(result.getResolvedException() instanceof ResponseStatusException))
                .andExpect(result -> assertEquals("404 NOT_FOUND \"Contatto non trovato\"",
                        result.getResolvedException().getMessage()));
    }

    @Test
    public void testDeleteContatto() throws Exception {
        String jsonCreazione = """
            {
                "nome": "Anna",
                "cognome": "Neri",
                "email": "anna.neri@esempio.it",
                "ruolo": "Recruiter",
                "cell": "3334445555",
                "azienda": { "idAzienda": %d }
            }
            """.formatted(aziendaId);

        String risposta = mockMvc.perform(post("/rest/contatti")
                .contentType(MediaType.APPLICATION_JSON)
                .content(jsonCreazione))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();

        Integer idContatto = JsonPath.read(risposta, "$.idContatto");

        mockMvc.perform(delete("/rest/contatti/{id}", idContatto))
                .andExpect(status().isNoContent());
    }

    @Test
    public void testDeleteContattoNotFound() throws Exception {
        mockMvc.perform(delete("/rest/contatti/{id}", 999999))
                .andExpect(status().isNotFound())
                .andExpect(result -> assertTrue(result.getResolvedException() instanceof ResponseStatusException))
                .andExpect(result -> assertEquals("404 NOT_FOUND \"Contatto non trovata, impossibile eliminare\"",
                        result.getResolvedException().getMessage()));
    }
}