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

// =========================================================
// SESSIONE E MODALITA' OSPITE
// L'utente che fa login riceve un token dal backend e puo' modificare i dati.
// L'ospite non ha token: vede tutto ma in sola lettura.
// =========================================================
function getSessione() {
    try {
        return JSON.parse(sessionStorage.getItem('utente') || 'null');
    } catch {
        return null;
    }
}

function getAuthToken() {
    return getSessione()?.token || null;
}

function isGuest() {
    const sessione = getSessione();
    return !!sessione && !sessione.token;
}

const GUEST_MESSAGE = 'Modalità ospite: puoi solo consultare i dati. Accedi per modificarli.';

(function initGuestMode() {
    const pagina = window.location.pathname.split('/').pop();

    if (!isGuest() || pagina === 'login.html') return;

    // Le pagine di inserimento non hanno senso in sola lettura
    if (pagina === 'azienda-form.html') {
        window.location.replace('dashboard.html');
        return;
    }
    if (pagina === 'candidatura-form.html') {
        window.location.replace('candidature.html');
        return;
    }

    document.addEventListener('DOMContentLoaded', () => {
        document.body.classList.add('guest-mode');

        const banner = document.createElement('div');
        banner.className = 'guest-banner';
        banner.innerHTML =
            '<span>Stai visitando il progetto come <strong>ospite</strong>: modalità sola lettura.</span>' +
            '<a href="./login.html" class="guest-banner-link">Accedi</a>';
        document.body.prepend(banner);

        banner.querySelector('a').addEventListener('click', () => sessionStorage.removeItem('utente'));
    });
})();

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
        const method = (options.method || 'GET').toUpperCase();
        const isLogin = endpoint === '/utenti/login';

        if (method !== 'GET' && !isLogin && isGuest()) {
            throw new Error(GUEST_MESSAGE);
        }

        const config = {
            method,
            headers: {
                Accept: 'application/json',
                ...(options.headers || {})
            }
        };

        const token = getAuthToken();
        if (token && !isLogin) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }

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

            if (response.status === 401) {
                throw new Error('Sessione scaduta o accesso in sola lettura: rifai il login per modificare i dati.');
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