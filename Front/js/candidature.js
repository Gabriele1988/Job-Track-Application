const STATI_CANDIDATURA = [
    'Accettata',
    'Colloquio',
    'In valutazione',
    'Inviata',
    'Offerta',
    'Rigettato',
    'Scartata'
];

let tutteLeCandidature = [];
let tutteLeAziende = [];
let candidaturaInModificaId = null;
let candidaturaDaEliminareId = null;

document.addEventListener('DOMContentLoaded', async () => {
    const utente = requireSession();
    if (!utente) return;

    setUserName(utente);
    bindLogout();
    bindFiltri();
    bindModalEvents();

    await Promise.all([
        caricaAziende(),
        caricaCandidature()
    ]);

    if (window.initRevealAnimations) {
        initRevealAnimations();
    }
});

async function caricaAziende() {
    try {
        const data = await ApiService.getAziende();
        tutteLeAziende = Array.isArray(data) ? data : [];
        popolaSelectAziendeModale();
    } catch (error) {
        console.error('Errore caricamento aziende:', error);
    }
}

async function caricaCandidature() {
    const tbody = document.getElementById('candidatureTableBody');
    if (!tbody) return;

    tbody.innerHTML = `
        <tr class="reveal-up">
            <td class="table-message" colspan="6">Caricamento candidature...</td>
        </tr>
    `;

    try {
        const data = await ApiService.getCandidature();
        tutteLeCandidature = Array.isArray(data) ? data : [];
        applicaFiltri();
    } catch (error) {
        tbody.innerHTML = `
            <tr class="reveal-up">
                <td class="table-message" colspan="6">${escapeHtml(error.message || 'Errore durante il caricamento delle candidature.')}</td>
            </tr>
        `;
        updateResultsCount(0);
    }
}

function bindFiltri() {
    const applyBtn = document.getElementById('applyFiltersBtn');
    const resetBtn = document.getElementById('resetFiltersBtn');
    const inputAzienda = document.getElementById('filterAzienda');
    const inputPosizione = document.getElementById('filterPosizione');
    const selectStato = document.getElementById('filterStato');

    if (applyBtn) applyBtn.addEventListener('click', applicaFiltri);

    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            if (inputAzienda) inputAzienda.value = '';
            if (inputPosizione) inputPosizione.value = '';
            if (selectStato) selectStato.value = '';
            renderCandidature(tutteLeCandidature);
        });
    }

    [inputAzienda, inputPosizione, selectStato].forEach((el) => {
        if (!el) return;

        el.addEventListener('input', applicaFiltri);
        el.addEventListener('change', applicaFiltri);

        el.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                applicaFiltri();
            }

            if (event.key === 'Escape') {
                event.target.value = '';
                applicaFiltri();
            }
        });
    });
}

function applicaFiltri() {
    const aziendaQuery = (document.getElementById('filterAzienda')?.value || '').trim().toLowerCase();
    const posizioneQuery = (document.getElementById('filterPosizione')?.value || '').trim().toLowerCase();
    const statoQuery = (document.getElementById('filterStato')?.value || '').trim().toLowerCase();

    const filtrate = tutteLeCandidature.filter((item) => {
        const aziendaNome = (item.azienda?.nome || '').toLowerCase();
        const posizione = (item.posizioneLavorativa || item.posizione || '').toLowerCase();
        const stato = normalizeStato(item.stato).toLowerCase();

        const matchAzienda = !aziendaQuery || aziendaNome.includes(aziendaQuery);
        const matchPosizione = !posizioneQuery || posizione.includes(posizioneQuery);
        const matchStato = !statoQuery || stato === statoQuery;

        return matchAzienda && matchPosizione && matchStato;
    });

    renderCandidature(filtrate);
}

function renderCandidature(candidature) {
    const tbody = document.getElementById('candidatureTableBody');
    if (!tbody) return;

    tbody.innerHTML = '';

    if (!candidature || candidature.length === 0) {
        tbody.innerHTML = `
            <tr class="reveal-up">
                <td class="table-message" colspan="6">Nessuna candidatura trovata.</td>
            </tr>
        `;
        updateResultsCount(0);
        if (window.initRevealAnimations) initRevealAnimations(tbody);
        return;
    }

    candidature.forEach((candidatura) => {
        const id = candidatura.idCandidatura ?? candidatura.id;
        const aziendaNome = escapeHtml(candidatura.azienda?.nome || 'Azienda non disponibile');
        const posizione = escapeHtml(candidatura.posizioneLavorativa || candidatura.posizione || 'Non specificata');
        const stato = normalizeStato(candidatura.stato || 'Non definito');
        const dataInvio = formatDate(candidatura.dataInvio);
        const skills = normalizeSkills(candidatura.skills);

        const tr = document.createElement('tr');
        tr.className = 'reveal-up';

        tr.innerHTML = `
            <td data-label="Azienda">${aziendaNome}</td>
            <td data-label="Posizione">${posizione}</td>
            <td data-label="Stato">${renderBadgeStato(stato)}</td>
            <td data-label="Data invio">${escapeHtml(dataInvio)}</td>
            <td data-label="Skills">${renderSkills(skills)}</td>
            <td data-label="Azioni">
                <div class="actions-wrap">
                    <button type="button" class="btn btn-secondary btn-sm" data-action="edit">Modifica</button>
                    <button type="button" class="btn btn-danger btn-sm" data-action="delete">Elimina</button>
                </div>
            </td>
        `;

        tr.querySelector('[data-action="edit"]')?.addEventListener('click', () => {
            openEditCandidaturaModal(candidatura);
        });

        tr.querySelector('[data-action="delete"]')?.addEventListener('click', () => {
            openDeleteCandidaturaModal(id);
        });

        tbody.appendChild(tr);
    });

    updateResultsCount(candidature.length);

    if (window.initRevealAnimations) {
        initRevealAnimations(tbody);
    }
}

function bindModalEvents() {
    document.getElementById('closeEditCandidaturaModal')?.addEventListener('click', closeEditCandidaturaModal);
    document.getElementById('cancelEditCandidaturaBtn')?.addEventListener('click', closeEditCandidaturaModal);
    document.getElementById('editCandidaturaForm')?.addEventListener('submit', salvaModificaCandidatura);

    document.getElementById('closeDeleteCandidaturaModal')?.addEventListener('click', closeDeleteCandidaturaModal);
    document.getElementById('cancelDeleteCandidaturaBtn')?.addEventListener('click', closeDeleteCandidaturaModal);
    document.getElementById('confirmDeleteCandidaturaBtn')?.addEventListener('click', confermaEliminazioneCandidatura);

    const editModal = document.getElementById('editCandidaturaModal');
    const deleteModal = document.getElementById('deleteCandidaturaModal');

    editModal?.addEventListener('click', (event) => {
        if (event.target === editModal) closeEditCandidaturaModal();
    });

    deleteModal?.addEventListener('click', (event) => {
        if (event.target === deleteModal) closeDeleteCandidaturaModal();
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            closeEditCandidaturaModal();
            closeDeleteCandidaturaModal();
        }
    });
}

function openEditCandidaturaModal(candidatura) {
    const modal = document.getElementById('editCandidaturaModal');
    const errorBox = document.getElementById('editCandidaturaError');
    if (!modal) return;

    candidaturaInModificaId = candidatura.idCandidatura ?? candidatura.id;

    setValue('editCandidaturaAzienda', candidatura.azienda?.idAzienda || candidatura.azienda?.id || '');
    setValue('editCandidaturaPosizione', candidatura.posizioneLavorativa || candidatura.posizione || '');
    setValue('editCandidaturaStato', normalizeStato(candidatura.stato));
    setValue('editCandidaturaSkills', normalizeSkills(candidatura.skills).join(', '));

    hideError(errorBox);
    openModal(modal);
}

function closeEditCandidaturaModal() {
    candidaturaInModificaId = null;
    document.getElementById('editCandidaturaForm')?.reset();
    hideError(document.getElementById('editCandidaturaError'));
    closeModal(document.getElementById('editCandidaturaModal'));
}

async function salvaModificaCandidatura(event) {
    event.preventDefault();

    const errorBox = document.getElementById('editCandidaturaError');
    hideError(errorBox);

    const aziendaId = getValue('editCandidaturaAzienda');
    const posizioneLavorativa = getValue('editCandidaturaPosizione').trim();
    const stato = getValue('editCandidaturaStato').trim();
    const skills = parseSkills(getValue('editCandidaturaSkills'));

    if (!aziendaId) {
        showError(errorBox, 'Seleziona un’azienda.');
        return;
    }

    if (!posizioneLavorativa) {
        showError(errorBox, 'Inserisci la posizione lavorativa.');
        return;
    }

    if (!stato) {
        showError(errorBox, 'Seleziona lo stato.');
        return;
    }

    const payload = {
        azienda: { idAzienda: parseInt(aziendaId, 10) },
        posizioneLavorativa,
        stato,
        skills
    };

    try {
        await ApiService.updateCandidatura(candidaturaInModificaId, payload);
        closeEditCandidaturaModal();
        await caricaCandidature();
    } catch (error) {
        showError(errorBox, error.message || 'Errore nel salvataggio della candidatura.');
    }
}

function openDeleteCandidaturaModal(id) {
    candidaturaDaEliminareId = id;
    openModal(document.getElementById('deleteCandidaturaModal'));
}

function closeDeleteCandidaturaModal() {
    candidaturaDaEliminareId = null;
    closeModal(document.getElementById('deleteCandidaturaModal'));
}

async function confermaEliminazioneCandidatura() {
    if (!candidaturaDaEliminareId) return;

    try {
        await ApiService.deleteCandidatura(candidaturaDaEliminareId);
        closeDeleteCandidaturaModal();
        await caricaCandidature();
    } catch (error) {
        alert(error.message || 'Errore durante l’eliminazione della candidatura.');
    }
}

function popolaSelectAziendeModale() {
    const select = document.getElementById('editCandidaturaAzienda');
    if (!select) return;

    select.innerHTML = '<option value="">Seleziona azienda</option>';

    tutteLeAziende.forEach((azienda) => {
        const option = document.createElement('option');
        option.value = azienda.idAzienda ?? azienda.id;
        option.textContent = azienda.nome || 'Azienda';
        select.appendChild(option);
    });
}

function updateResultsCount(count) {
    const countEl = document.getElementById('resultsCount');
    if (countEl) {
        countEl.textContent = `${count} risultat${count === 1 ? 'o' : 'i'}`;
    }
}

function normalizeSkills(skills) {
    if (!skills) return [];
    if (Array.isArray(skills)) return skills.filter(Boolean).map((s) => String(s).trim()).filter(Boolean);
    return String(skills)
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
}

function parseSkills(value) {
    return String(value || '')
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);
}

function renderSkills(skills) {
    if (!skills.length) return '<span class="badge badge-neutral">Nessuna</span>';
    return skills.map((skill) => `<span class="badge badge-primary">${escapeHtml(skill)}</span>`).join(' ');
}

function renderBadgeStato(stato) {
    const map = {
        Accettata: 'badge-success',
        Colloquio: 'badge-info',
        'In valutazione': 'badge-warning',
        Inviata: 'badge-primary',
        Offerta: 'badge-success',
        Rigettato: 'badge-danger',
        Scartata: 'badge-neutral'
    };

    return `<span class="badge ${map[stato] || 'badge-neutral'}">${escapeHtml(stato)}</span>`;
}

function normalizeStato(stato) {
    const raw = String(stato || '').trim().toLowerCase();
    const map = {
        accettata: 'Accettata',
        colloquio: 'Colloquio',
        'in valutazione': 'In valutazione',
        in_valutazione: 'In valutazione',
        inviata: 'Inviata',
        offerta: 'Offerta',
        rigettato: 'Rigettato',
        scartata: 'Scartata'
    };
    return map[raw] || stato;
}

function formatDate(value) {
    if (!value) return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    return date.toLocaleDateString('it-IT');
}

function openModal(modal) {
    if (!modal) return;
    modal.classList.add('show');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
}

function closeModal(modal) {
    if (!modal) return;
    modal.classList.remove('show');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
}

function setValue(id, value) {
    const el = document.getElementById(id);
    if (el) el.value = value;
}

function getValue(id) {
    const el = document.getElementById(id);
    return el ? el.value : '';
}

function setUserName(utente) {
    const userNameDisplay = document.getElementById('userNameDisplay');
    if (userNameDisplay) {
        userNameDisplay.textContent = utente?.nome || utente?.username || 'Utente';
    }
}

function bindLogout() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (!logoutBtn) return;

    logoutBtn.addEventListener('click', (event) => {
        event.preventDefault();
        sessionStorage.removeItem('utente');
        window.location.href = './login.html';
    });
}

function requireSession() {
    const sessione = sessionStorage.getItem('utente');
    if (!sessione) {
        window.location.href = './login.html';
        return null;
    }

    try {
        return JSON.parse(sessione);
    } catch {
        sessionStorage.removeItem('utente');
        window.location.href = './login.html';
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

function escapeHtml(value) {
    return String(value)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
}