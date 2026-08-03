package it.formatore.jobtracker;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import jakarta.transaction.Transactional;

@SpringBootTest(classes = JobTrackerSpringApplication.class) // Aggiungi questo!
@AutoConfigureMockMvc
@Transactional
public class CandidaturaControllerTest {
	
	@Autowired
    private MockMvc mockMvc;

    @Test
    public void testGetAllCandidature() throws Exception {
        mockMvc.perform(get("/rest/candidature"))
               .andExpect(status().isOk());
    }
    
    @Test
    public void testGetByIdCandidature() throws Exception {
        mockMvc.perform(get("/rest/candidature/1"))
               .andExpect(status().isOk())
               .andExpect(content().contentType(MediaType.APPLICATION_JSON));
    }
    
    @Test
    public void testCreateCandidatura() throws Exception {
        String json = """
            {
                "posizioneLavorativa": "Test2",
                "stato": "IN VALUTAZIONE",
                "azienda": {
                    "idAzienda": 2
                }
            }
            """;

        mockMvc.perform(post("/rest/candidature")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
                .andExpect(status().isCreated());
    }
    
    @Test
    public void testUpdateCandidatura() throws Exception {
        String json = """
            {
                "posizioneLavorativa": "Backend Java Developer",
                "stato": "COLLOQUIO",
                "azienda": {
                    "idAzienda": 2
                }
            }
            """;

        mockMvc.perform(put("/rest/candidature/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.posizioneLavorativa").value("Backend Java Developer"))
                .andExpect(jsonPath("$.stato").value("COLLOQUIO"))
                .andExpect(jsonPath("$.azienda.idAzienda").value(2));
    }

    @Test
    public void testUpdateCandidaturaNotFound() throws Exception {
        String json = """
            {
                "posizioneLavorativa": "Backend Java Developer",
                "stato": "COLLOQUIO",
                "azienda": {
                    "idAzienda": 2
                }
            }
            """;

        mockMvc.perform(put("/rest/candidature/999999")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
                .andExpect(status().isNotFound());
    }

    @Test
    public void testUpdateCandidaturaAziendaNonSettata() throws Exception {
        String json = """
            {
                "posizioneLavorativa": "Backend Java Developer",
                "stato": "COLLOQUIO"
            }
            """;

        mockMvc.perform(put("/rest/candidature/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
                .andExpect(status().isBadRequest());
    }

    @Test
    public void testUpdateCandidaturaAziendaNotFound() throws Exception {
        String json = """
            {
                "posizioneLavorativa": "Backend Java Developer",
                "stato": "COLLOQUIO",
                "azienda": {
                    "idAzienda": 999999
                }
            }
            """;

        mockMvc.perform(put("/rest/candidature/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
                .andExpect(status().isNotFound());
    }
    
    @Test
    public void testUpdateStatoCandidatura_RF09() throws Exception {
        String json = """
            {
                "stato": "COLLOQUIO"
            }
            """;

        mockMvc.perform(put("/rest/candidature/1/stato")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.stato").value("COLLOQUIO"));
    }

    @Test
    public void testRicercaPerStato_RF10() throws Exception {
        mockMvc.perform(get("/rest/candidature/ricerca")
                .param("stato", "IN VALUTAZIONE"))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON));
    }

    @Test
    public void testRicercaPerAzienda_RF10() throws Exception {
        mockMvc.perform(get("/rest/candidature/ricerca")
                .param("azienda", "2"))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON));
    }

    @Test
    public void testRicercaPerPosizione_RF10() throws Exception {
        mockMvc.perform(get("/rest/candidature/ricerca")
                .param("posizione", "Test"))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON));
    }

    @Test
    public void testRicercaIncrociata_RF10() throws Exception {
        mockMvc.perform(get("/rest/candidature/ricerca")
                .param("stato", "IN VALUTAZIONE")
                .param("azienda", "2")
                .param("posizione", "Test"))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON));
    }

}
