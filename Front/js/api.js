// =========================================================
// API SERVICE
// Servizio centralizzato per tutte le chiamate REST
// =========================================================

// Indirizzo del backend pubblicato su Render.
// Se Render ti assegna un nome diverso, aggiorna solo questa riga.
const PROD_API_URL = 'https://job-track-application-kb3d.onrender.com/rest';

// In locale (file aperto dal PC o Live Server) usa il backend sul tuo PC,
// online usa quello su Render.
const IS_LOCAL = ['localhost', '127.0.0.1', ''].includes(window.location.hostname);
const BASE_URL = IS_LOCAL ? 'http://localhost:8080/rest' : PROD_API_URL;

const ApiService = {
    // -----------------------------------------------------
    // Costruisce una query string a partire da un oggetto
    // Esempio: { citta: 'Palermo', stato: 'Inviata' }
    // => ?citta=Palermo&stato=Inviata
    // -----------------------------------------------------
    buildQuery(params = {}) {
        const query = new URLSearchParams();

        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null && String(value).trim() !== '') {
                query.append(key, String(value).trim());
            }
        });

        const queryString = query.toString();
        return queryString ? `?${queryString}` : '';
    },

    // -----------------------------------------------------
    // Metodo generico HTTP
    // - imposta headers
    // - gestisce body JSON
    // - gestisce risposte 204
    // - normalizza gli errori del backend
    // -----------------------------------------------------
    async request(endpoint, options = {}) {
        const config = {
            method: options.method || 'GET',
            headers: {
                Accept: 'application/json',
                ...(options.headers || {})
            }
        };

        if (options.body !== undefined && options.body !== null) {
            config.headers['Content-Type'] = 'application/json';
            config.body = options.body;
        }

        try {
            const response = await fetch(`${BASE_URL}${endpoint}`, config);

            const contentType = response.headers.get('content-type') || '';
            const isJson = contentType.includes('application/json');

            let data = null;

            if (response.status !== 204) {
                data = isJson ? await response.json() : await response.text();
            }

            if (!response.ok) {
                let message = `Errore API (${response.status})`;

                if (data) {
                    if (typeof data === 'string' && data.trim()) {
                        message = data;
                    } else if (typeof data === 'object') {
                        message =
                            data.message ||
                            data.error ||
                            data.details ||
                            JSON.stringify(data);
                    }
                }

                throw new Error(message);
            }

            return data;
        } catch (error) {
            if (error instanceof TypeError) {
                throw new Error('Impossibile contattare il server. Controlla che il backend sia avviato e raggiungibile.');
            }

            throw error;
        }
    },

    // =====================================================
    // AUTH
    // =====================================================
    async login(username, password) {
        return this.request('/utenti/login', {
            method: 'POST',
            body: JSON.stringify({ username, password })
        });
    },

    // =====================================================
    // UTENTI
    // =====================================================
    async getUtenti() {
        return this.request('/utenti');
    },

    // =====================================================
    // AZIENDE
    // =====================================================
    async getAziende(citta = '') {
        return this.request(`/aziende${this.buildQuery({ citta })}`);
    },

    async getNomiAziende() {
        return this.request('/aziende/nomi');
    },

    async getAziendaById(id) {
        return this.request(`/aziende/${id}`);
    },

    async createAzienda(azienda) {
        return this.request('/aziende', {
            method: 'POST',
            body: JSON.stringify(azienda)
        });
    },

    async updateAzienda(id, azienda) {
        return this.request(`/aziende/${id}`, {
            method: 'PUT',
            body: JSON.stringify(azienda)
        });
    },

    async deleteAzienda(id) {
        return this.request(`/aziende/${id}`, {
            method: 'DELETE'
        });
    },

    // =====================================================
    // CANDIDATURE
    // =====================================================
    async getCandidature() {
        return this.request('/candidature');
    },

    async getCandidaturaById(id) {
        return this.request(`/candidature/${id}`);
    },

    async ricercaCandidature({ stato = '', azienda = '', posizione = '' } = {}) {
        return this.request(
            `/candidature/ricerca${this.buildQuery({ stato, azienda, posizione })}`
        );
    },

    async createCandidatura(candidatura) {
        return this.request('/candidature', {
            method: 'POST',
            body: JSON.stringify(candidatura)
        });
    },

    async updateCandidatura(id, candidatura) {
        return this.request(`/candidature/${id}`, {
            method: 'PUT',
            body: JSON.stringify(candidatura)
        });
    },

    async updateStatoCandidatura(id, stato) {
        return this.request(`/candidature/${id}/stato`, {
            method: 'PUT',
            body: JSON.stringify({ stato })
        });
    },

    async deleteCandidatura(id) {
        return this.request(`/candidature/${id}`, {
            method: 'DELETE'
        });
    },

    async getSkillsByCandidatura(id) {
        return this.request(`/candidature/${id}/skills`);
    }
};