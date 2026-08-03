package it.formatore.jobtracker;

import it.formatore.jobtracker.model.Azienda;
import it.formatore.jobtracker.model.Candidatura;
import it.formatore.jobtracker.repository.AziendaRepository;
import it.formatore.jobtracker.repository.CandidaturaRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
public class ColloquioControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private AziendaRepository aziendaRepository;

    @Autowired
    private CandidaturaRepository candidaturaRepository;

    private Integer idCandidaturaTest;

    @BeforeEach
    public void setup() {
        Azienda az = new Azienda();
        az.setNome("Tech Corp");
        az.setSettore("Tech");
        az.setCitta("Aversa");
        az.setSitoweb("www.tech.it");
        az.setNotePersonali("note");
        az.setImmagine("https://example.com/logo.png");

        Azienda savedAz = aziendaRepository.save(az);

        Candidatura cand = new Candidatura();
        cand.setPosizioneLavorativa("Developer");
        cand.setStato("INVIATA");
        cand.setAzienda(savedAz);

        idCandidaturaTest = candidaturaRepository.save(cand).getIdCandidatura();
    }

    @Test
    public void testCreateColloquio() throws Exception {
        String json = """
            {
                "dataOra": "2026-07-20T10:30:00",
                "tipoColloquio": "Tecnico",
                "esito": "In Attesa",
                "note": "Ottimo profilo",
                "candidatura": { "idCandidatura": %d }
            }
            """.formatted(idCandidaturaTest);

        mockMvc.perform(post("/rest/colloqui")
               .contentType(MediaType.APPLICATION_JSON)
               .content(json))
               .andExpect(status().isCreated());
    }

    @Test
    public void testGetAllColloqui() throws Exception {
        mockMvc.perform(get("/rest/colloqui"))
               .andExpect(status().isOk())
               .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON));
    }

    @Test
    public void testGetCronologiaColloquiPerCandidatura_RF14() throws Exception {
        String json1 = """
            {
                "dataOra": "2026-07-20T10:30:00",
                "tipoColloquio": "HR",
                "esito": "In Attesa",
                "note": "Primo colloquio",
                "candidatura": { "idCandidatura": %d }
            }
            """.formatted(idCandidaturaTest);

        String json2 = """
            {
                "dataOra": "2026-07-22T15:00:00",
                "tipoColloquio": "Tecnico",
                "esito": "Superato",
                "note": "Secondo colloquio",
                "candidatura": { "idCandidatura": %d }
            }
            """.formatted(idCandidaturaTest);

        String json3 = """
            {
                "dataOra": "2026-07-21T09:00:00",
                "tipoColloquio": "Manageriale",
                "esito": "In Attesa",
                "note": "Colloquio intermedio",
                "candidatura": { "idCandidatura": %d }
            }
            """.formatted(idCandidaturaTest);

        mockMvc.perform(post("/rest/colloqui")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json1))
                .andExpect(status().isCreated());

        mockMvc.perform(post("/rest/colloqui")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json2))
                .andExpect(status().isCreated());

        mockMvc.perform(post("/rest/colloqui")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json3))
                .andExpect(status().isCreated());

        mockMvc.perform(get("/rest/colloqui/candidatura/{idCandidatura}", idCandidaturaTest))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(3))
                .andExpect(jsonPath("$[0].tipoColloquio").value("Tecnico"))
                .andExpect(jsonPath("$[0].note").value("Secondo colloquio"))
                .andExpect(jsonPath("$[1].tipoColloquio").value("Manageriale"))
                .andExpect(jsonPath("$[1].note").value("Colloquio intermedio"))
                .andExpect(jsonPath("$[2].tipoColloquio").value("HR"))
                .andExpect(jsonPath("$[2].note").value("Primo colloquio"));
    }
}