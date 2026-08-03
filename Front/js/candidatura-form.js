// =========================================================
// FORM CANDIDATURA
// - create / edit candidatura
// - caricamento aziende
// - prefill in modifica
// - select stato con label leggibile
// =========================================================

const STATI_CANDIDATURA = [
    { value: 'ACCETTATA', label: 'Accettata' },
    { value: 'COLLOQUIO', label: 'Colloquio' },
    { value: 'IN_VALUTAZIONE', label: 'In valutazione' },
    { value: 'INVIATA', label: 'Inviata' },
    { value: 'OFFERTA', label: 'Offerta' },
    { value: 'RIGETTATO', label: 'Rigettato' },
    { value: 'SCARTATA', label: 'Scartata' }
];

let modalitaModifica = false;
let candidaturaId = null;
let candidaturaOriginale = null;

document.addEventListener('DOMContentLoaded', async () => {
    const utente = requireSession();
    if (!utente) return;

    const form = document.getElementById('candidaturaForm');
    if (!form) return;

    const params = new URLSearchParams(window.location.search);
    candidaturaId = params.get('id');
    modalitaModifica = Boolean(candidaturaId);

    popolaSelectStati();
    aggiornaTestiPagina();
    await caricaAziendeSelect();

    if (modalitaModifica) {
        await caricaCandidaturaDaModificare(candidaturaId);
    }

    if (window.initRevealAnimations) {
        initRevealAnimations();
    }

    form.addEventListener('submit', salvaCandidatura);
});

function popolaSelectStati() {
    const select = document.getElementById('stato');
    if (!select) return;

    select.innerHTML = '<option value="">Seleziona stato</option>';

    STATI_CANDIDATURA.forEach((stato) => {
        const option = document.createElement('option');
        option.value = stato.value;
        option.textContent = stato.label;
        select.appendChild(option);
    });
}

function aggiornaTestiPagina() {
    const title = document.getElementById('formTitle');
    const subtitle = document.getElementById('formSubtitle');
    const submitBtn = document.getElementById('submitBtn');

    if (modalitaModifica) {
        if (title) title.textContent = 'Modifica Candidatura';
        if (subtitle) subtitle.textContent = 'Aggiorna azienda, posizione e stato della candidatura';
        if (submitBtn) submitBtn.textContent = 'Aggiorna Candidatura';
    } else {
        if (title) title.textContent = 'Nuova Candidatura';
        if (subtitle) subtitle.textContent = 'Seleziona l’azienda e registra la candidatura';
        if (submitBtn) submitBtn.textContent = 'Salva Candidatura';
    }
}

async function caricaAziendeSelect() {
    const select = document.getElementById('aziendaSelect');
    const errorBox = document.getElementById('errorBox');
    if (!select) return;

    try {
        const aziende = await ApiService.getNomiAziende();

        select.innerHTML = '<option value="">Seleziona un\'azienda</option>';

        (Array.isArray(aziende) ? aziende : []).forEach((azienda) => {
            const option = document.createElement('option');
            option.value = azienda.id ?? azienda.idAzienda;
            option.textContent = azienda.nome;
            select.appendChild(option);
        });
    } catch (error) {
        showError(errorBox, error.message || 'Errore durante il caricamento delle aziende.');
    }
}

async function caricaCandidaturaDaModificare(id) {
    const errorBox = document.getElementById('errorBox');

    try {
        const candidatura = await ApiService.getCandidaturaById(id);
        candidaturaOriginale = candidatura;

        const aziendaSelect = document.getElementById('aziendaSelect');
        const posizioneInput = document.getElementById('posizioneLavorativa');
        const statoSelect = document.getElementById('stato');
        const dataPreview = document.getElementById('dataPreview');

        if (aziendaSelect) {
            aziendaSelect.value = candidatura.azienda?.idAzienda || candidatura.azienda?.id || '';
        }

        if (posizioneInput) {
            posizioneInput.value = candidatura.posizioneLavorativa || '';
        }

        if (statoSelect) {
            statoSelect.value = normalizeStatoForSelect(candidatura.stato || '');
        }

        if (dataPreview) {
            if (candidatura.dataInvio) {
                const data = new Date(candidatura.dataInvio);
                dataPreview.value = Number.isNaN(data.getTime())
                    ? candidatura.dataInvio
                    : data.toLocaleDateString('it-IT');
            } else {
                dataPreview.value = '';
            }
        }
    } catch (error) {
        showError(errorBox, error.message || 'Errore durante il caricamento della candidatura.');
    }
}

async function salvaCandidatura(event) {
    event.preventDefault();

    const errorBox = document.getElementById('errorBox');
    hideError(errorBox);

    const aziendaId = document.getElementById('aziendaSelect')?.value || '';
    const posizioneLavorativa = document.getElementById('posizioneLavorativa')?.value.trim() || '';
    const stato = document.getElementById('stato')?.value || '';

    if (!aziendaId) {
        showError(errorBox, 'Seleziona un’azienda.');
        return;
    }

    if (!posizioneLavorativa) {
        showError(errorBox, 'Inserisci la posizione lavorativa.');
        return;
    }

    if (!stato) {
        showError(errorBox, 'Seleziona lo stato della candidatura.');
        return;
    }

    const payload = {
        azienda: {
            idAzienda: parseInt(aziendaId, 10)
        },
        posizioneLavorativa,
        stato
    };

    try {
        if (modalitaModifica) {
            payload.dataInvio = candidaturaOriginale?.dataInvio || null;
            await ApiService.updateCandidatura(candidaturaId, payload);
        } else {
            await ApiService.createCandidatura(payload);
        }

        window.location.href = 'candidature.html';
    } catch (error) {
        showError(errorBox, error.message || 'Errore durante il salvataggio della candidatura.');
    }
}

function normalizeStatoForSelect(stato) {
    const raw = String(stato || '').trim().toUpperCase();
    const map = {
        ACCETTATA: 'ACCETTATA',
        COLLOQUIO: 'COLLOQUIO',
        IN_VALUTAZIONE: 'IN_VALUTAZIONE',
        INVIATA: 'INVIATA',
        OFFERTA: 'OFFERTA',
        RIGETTATO: 'RIGETTATO',
        SCARTATA: 'SCARTATA'
    };
    return map[raw] || raw;
}

function requireSession() {
    const sessione = sessionStorage.getItem('utente');

    if (!sessione) {
        window.location.href = 'login.html';
        return null;
    }

    try {
        return JSON.parse(sessione);
    } catch {
        sessionStorage.removeItem('utente');
        window.location.href = 'login.html';
        return null;
    }
}

function showError(errorBox, message) {
    if (!errorBox) return;
    errorBox.textContent = message;
    errorBox.style.display = 'block';
}

function hideError(errorBox) {
    if (!errorBox) return;
    errorBox.textContent = '';
    errorBox.style.display = 'none';
}