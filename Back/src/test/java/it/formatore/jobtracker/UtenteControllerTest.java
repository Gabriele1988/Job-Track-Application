package it.formatore.jobtracker;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest(classes = JobTrackerSpringApplication.class)
@AutoConfigureMockMvc
@Transactional
public class UtenteControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    public void getAllUtenti() throws Exception {
        mockMvc.perform(get("/rest/utenti"))
               .andExpect(status().isOk())
               .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON));
    }
}