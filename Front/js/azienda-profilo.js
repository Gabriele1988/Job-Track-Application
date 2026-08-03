const STATI_CANDIDATURA = {
    ACCETTATA: 'Accettata',
    COLLOQUIO: 'Colloquio',
    IN_VALUTAZIONE: 'In valutazione',
    INVIATA: 'Inviata',
    OFFERTA: 'Offerta',
    RIGETTATO: 'Rigettato',
    SCARTATA: 'Scartata'
};

let aziendaCorrente = null;
let aziendaCorrenteId = null;
let aziendaDaEliminareId = null;
let candidaturaInModificaId = null;
let candidaturaDaEliminareId = null;

document.addEventListener('DOMContentLoaded', async () => {
    const utente = requireSession();
    if (!utente) return;

    setUserName(utente);
    bindLogout();
    bindProfileActions();
    bindModals();

    const aziendaId = getAziendaIdFromUrl();
    if (!aziendaId) {
        renderCompanyNotFound('ID azienda non valido o mancante nella URL.');
        return;
    }

    aziendaCorrenteId = aziendaId;
    await loadCompanyProfile(aziendaId);
});

async function loadCompanyProfile(aziendaId) {
    try {
        const [azienda, candidature] = await Promise.all([
            ApiService.getAziendaById(aziendaId),
            ApiService.getCandidature()
        ]);

        if (!azienda) {
            renderCompanyNotFound('Azienda non trovata.');
            return;
        }

        aziendaCorrente = azienda;
        renderCompanyData(azienda);

        const listaCandidature = Array.isArray(candidature) ? candidature : [];
        const candidatureCollegate = listaCandidature.filter((item) => {
            const relatedAziendaId =
                item?.azienda?.idAzienda ??
                item?.azienda?.id ??
                item?.idAzienda ??
                item?.aziendaId ??
                null;

            return String(relatedAziendaId) === String(aziendaId);
        });

        renderAssociatedCandidature(candidatureCollegate);
        updateCounters(candidatureCollegate);
    } catch (error) {
        renderCompanyNotFound(error?.message || 'Errore durante il caricamento del profilo azienda.');
    }
}

function bindProfileActions() {
    const editBtn = document.getElementById('openEditAziendaBtn');
    const deleteBtn = document.getElementById('openDeleteAziendaBtn');

    if (editBtn) {
        editBtn.addEventListener('click', () => {
            if (aziendaCorrente) openEditAziendaModal(aziendaCorrente);
        });
    }

    if (deleteBtn) {
        deleteBtn.addEventListener('click', () => {
            if (aziendaCorrenteId && aziendaCorrente) {
                openDeleteModal(aziendaCorrenteId, readCompanyName(aziendaCorrente) || 'selezionata');
            }
        });
    }
}

function bindModals() {
    const editModal = document.getElementById('editAziendaModal');
    const deleteModal = document.getElementById('deleteAziendaModal');
    const candidaturaEditModal = document.getElementById('editCandidaturaModal');
    const deleteCandidaturaModal = document.getElementById('deleteCandidaturaModal');

    const closeEdit = document.getElementById('closeEditAziendaModal');
    const cancelEdit = document.getElementById('cancelEditAziendaBtn');
    const editForm = document.getElementById('editAziendaForm');

    const closeDelete = document.getElementById('closeDeleteAziendaModal');
    const cancelDelete = document.getElementById('cancelDeleteAziendaBtn');
    const confirmDelete = document.getElementById('confirmDeleteAziendaBtn');

    const closeCandidaturaEdit = document.getElementById('closeEditCandidaturaModal');
    const cancelCandidaturaEdit = document.getElementById('cancelEditCandidaturaBtn');
    const candidaturaEditForm = document.getElementById('editCandidaturaForm');

    const closeDeleteCandidatura = document.getElementById('closeDeleteCandidaturaModal');
    const cancelDeleteCandidatura = document.getElementById('cancelDeleteCandidaturaBtn');
    const confirmDeleteCandidatura = document.getElementById('confirmDeleteCandidaturaBtn');

    if (closeEdit) closeEdit.addEventListener('click', closeAziendaEditModal);
    if (cancelEdit) cancelEdit.addEventListener('click', closeAziendaEditModal);
    if (editForm) editForm.addEventListener('submit', salvaModificaAzienda);

    if (closeDelete) closeDelete.addEventListener('click', closeDeleteModal);
    if (cancelDelete) cancelDelete.addEventListener('click', closeDeleteModal);
    if (confirmDelete) confirmDelete.addEventListener('click', confermaEliminazioneAzienda);

    if (closeCandidaturaEdit) closeCandidaturaEdit.addEventListener('click', closeCandidaturaEditModal);
    if (cancelCandidaturaEdit) cancelCandidaturaEdit.addEventListener('click', closeCandidaturaEditModal);
    if (candidaturaEditForm) candidaturaEditForm.addEventListener('submit', salvaModificaCandidatura);

    if (closeDeleteCandidatura) closeDeleteCandidatura.addEventListener('click', closeDeleteCandidaturaModal);
    if (cancelDeleteCandidatura) cancelDeleteCandidatura.addEventListener('click', closeDeleteCandidaturaModal);
    if (confirmDeleteCandidatura) confirmDeleteCandidatura.addEventListener('click', confermaEliminazioneCandidatura);

    if (editModal) {
        editModal.addEventListener('click', (event) => {
            if (event.target === editModal) closeAziendaEditModal();
        });
    }

    if (deleteModal) {
        deleteModal.addEventListener('click', (event) => {
            if (event.target === deleteModal) closeDeleteModal();
        });
    }

    if (candidaturaEditModal) {
        candidaturaEditModal.addEventListener('click', (event) => {
            if (event.target === candidaturaEditModal) closeCandidaturaEditModal();
        });
    }

    if (deleteCandidaturaModal) {
        deleteCandidaturaModal.addEventListener('click', (event) => {
            if (event.target === deleteCandidaturaModal) closeDeleteCandidaturaModal();
        });
    }

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            closeAziendaEditModal();
            closeDeleteModal();
            closeCandidaturaEditModal();
            closeDeleteCandidaturaModal();
        }
    });
}

function renderCompanyData(azienda) {
    const nome = azienda?.nome || 'Azienda';
    const settore = azienda?.settore || 'Settore non definito';
    const citta = azienda?.citta || 'Città non disponibile';
    const note = azienda?.notePersonali || 'Nessuna nota disponibile.';
    const sitoWeb = azienda?.sitoweb || azienda?.sitoWeb || '';
    const immagineUrl = azienda?.immagine || azienda?.immagineUrl || '';

    const nomeEl = document.getElementById('companyName');
    const settoreEl = document.getElementById('companySectorBadge');
    const cittaEl = document.getElementById('companyCity');
    const noteEl = document.getElementById('companyNotes');
    const image = document.getElementById('companyCoverImage');
    const sitoLink = document.getElementById('companyWebsite');

    if (nomeEl) nomeEl.textContent = nome;
    if (settoreEl) settoreEl.textContent = settore;

    if (cittaEl) {
        cittaEl.innerHTML = `
            <svg viewBox="0 0 24 24">
                <path d="M12 21s-6-4.35-6-10a6 6 0 1 1 12 0c0 5.65-6 10-6 10z"></path>
                <circle cx="12" cy="11" r="2.5"></circle>
            </svg>
            ${escapeHtml(citta)}
        `;
    }

    if (noteEl) noteEl.textContent = note;

    if (image) {
        image.src = immagineUrl || 'https://placehold.co/1200x420?text=Azienda';
        image.alt = nome;
        image.onerror = () => {
            image.src = 'https://placehold.co/1200x420?text=Azienda';
        };
    }

    if (sitoLink) {
        if (sitoWeb) {
            const href = /^https?:\/\//i.test(sitoWeb) ? sitoWeb : `https://${sitoWeb}`;
            sitoLink.href = href;
            sitoLink.innerHTML = `
                <svg viewBox="0 0 24 24">
                    <path d="M10 14a3.5 3.5 0 0 0 5 0l3-3a3.5 3.5 0 0 0-5-5l-1 1"></path>
                    <path d="M14 10a3.5 3.5 0 0 0-5 0l-3 3a3.5 3.5 0 0 0 5 5l1-1"></path>
                </svg>
                ${escapeHtml(sitoWeb)}
            `;
        } else {
            sitoLink.removeAttribute('href');
            sitoLink.innerHTML = `
                <svg viewBox="0 0 24 24">
                    <path d="M10 14a3.5 3.5 0 0 0 5 0l3-3a3.5 3.5 0 0 0-5-5l-1 1"></path>
                    <path d="M14 10a3.5 3.5 0 0 0-5 0l-3 3a3.5 3.5 0 0 0 5 5l1-1"></path>
                </svg>
                Sito web non disponibile
            `;
        }
    }
}

function renderAssociatedCandidature(candidature) {
    const tbody = document.getElementById('companyCandidatureTableBody');
    if (!tbody) return;

    tbody.innerHTML = '';

    if (!Array.isArray(candidature) || candidature.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="table-message">Nessuna candidatura associata a questa azienda.</td>
            </tr>
        `;
        return;
    }

    candidature.forEach((candidatura) => {
        const candidaturaId = readCandidaturaId(candidatura);
        const tr = document.createElement('tr');

        tr.appendChild(createCell(
            candidatura?.posizioneLavorativa || candidatura?.posizione || '-',
            'Posizione'
        ));

        const tdStato = document.createElement('td');
        tdStato.setAttribute('data-label', 'Stato');
        const badge = document.createElement('span');
        const statoValue = normalizeStatoValue(candidatura?.stato);
        badge.className = getBadgeClass(statoValue);
        badge.textContent = STATI_CANDIDATURA[statoValue] || candidatura?.stato || 'Non definito';
        tdStato.appendChild(badge);
        tr.appendChild(tdStato);

        tr.appendChild(createCell(
            formatDate(candidatura?.dataInvio || candidatura?.dataCandidatura || candidatura?.data),
            'Data invio'
        ));

        const tdSkill = document.createElement('td');
        tdSkill.setAttribute('data-label', 'Skills');
        tdSkill.appendChild(renderSkillList(readSkills(candidatura)));
        tr.appendChild(tdSkill);

        const tdAzioni = document.createElement('td');
        tdAzioni.setAttribute('data-label', 'Azioni');

        const actions = document.createElement('div');
        actions.className = 'actions-wrap';

        const editBtn = document.createElement('button');
        editBtn.type = 'button';
        editBtn.className = 'btn btn-secondary btn-sm';
        editBtn.textContent = 'Modifica';
        editBtn.addEventListener('click', () => openEditCandidaturaModal(candidatura));

        const deleteBtn = document.createElement('button');
        deleteBtn.type = 'button';
        deleteBtn.className = 'btn btn-danger btn-sm';
        deleteBtn.textContent = 'Elimina';
        deleteBtn.addEventListener('click', () => {
            openDeleteCandidaturaModal(
                candidaturaId,
                candidatura?.posizioneLavorativa || candidatura?.posizione || 'selezionata'
            );
        });

        actions.appendChild(editBtn);
        actions.appendChild(deleteBtn);
        tdAzioni.appendChild(actions);
        tr.appendChild(tdAzioni);

        tbody.appendChild(tr);
    });
}

function openEditAziendaModal(azienda) {
    setValue('editRagioneSociale', readCompanyName(azienda) || '');
    setValue('editSettore', azienda?.settore || '');
    setValue('editCitta', azienda?.citta || '');
    setValue('editImmagineUrl', azienda?.immagine || azienda?.immagineUrl || '');
    setValue('editSitoWeb', azienda?.sitoweb || azienda?.sitoWeb || '');
    setValue('editNote', azienda?.notePersonali || '');
    hideEditModalError();
    showModal('editAziendaModal');
}

function closeAziendaEditModal() {
    hideModal('editAziendaModal');
    hideEditModalError();
    const form = document.getElementById('editAziendaForm');
    if (form) form.reset();
}

async function salvaModificaAzienda(event) {
    event.preventDefault();
    hideEditModalError();

    const nome = getValue('editRagioneSociale').trim();
    const settore = getValue('editSettore').trim();
    const citta = getValue('editCitta').trim();
    const immagine = getValue('editImmagineUrl').trim();
    const sitoweb = getValue('editSitoWeb').trim();
    const notePersonali = getValue('editNote').trim();

    if (!nome) return showEditModalError('Inserisci il nome dell’azienda.');
    if (!citta) return showEditModalError('Inserisci la città.');
    if (immagine && !isValidHttpUrl(immagine)) return showEditModalError('Inserisci un URL immagine valido.');
    if (sitoweb && !looksLikeUrlOrDomain(sitoweb)) return showEditModalError('Inserisci un sito web valido.');

    try {
        await ApiService.updateAzienda(aziendaCorrenteId, {
            nome,
            settore,
            citta,
            immagine,
            sitoweb,
            notePersonali
        });

        closeAziendaEditModal();
        await loadCompanyProfile(aziendaCorrenteId);
    } catch (error) {
        showEditModalError(error?.message || 'Errore durante il salvataggio dell’azienda.');
    }
}

function openDeleteModal(id, nome) {
    aziendaDaEliminareId = id;
    const message = document.getElementById('deleteAziendaMessage');
    if (message) {
        message.textContent = `Vuoi eliminare l’azienda ${nome}?`;
    }
    showModal('deleteAziendaModal');
}

function closeDeleteModal() {
    hideModal('deleteAziendaModal');
    aziendaDaEliminareId = null;
}

async function confermaEliminazioneAzienda() {
    if (!aziendaDaEliminareId) return;

    try {
        await ApiService.deleteAzienda(aziendaDaEliminareId);
        closeDeleteModal();
        window.location.href = './dashboard.html';
    } catch (error) {
        alert(error?.message || 'Errore durante l’eliminazione dell’azienda.');
    }
}

function openEditCandidaturaModal(candidatura) {
    candidaturaInModificaId = readCandidaturaId(candidatura);

    setValue('editPosizione', candidatura?.posizioneLavorativa || candidatura?.posizione || '');
    setValue('editStato', candidatura?.stato || '');
    setValue('editDataInvio', formatDateForInput(candidatura?.dataInvio || candidatura?.dataCandidatura || candidatura?.data));
    setValue(
        'editSkills',
        readSkills(candidatura)
            .map((item) => typeof item === 'string' ? item : (item?.nome || item?.nomeSkill || ''))
            .filter(Boolean)
            .join(', ')
    );
    setValue('editNoteCandidatura', candidatura?.note || '');

    hideCandidaturaEditModalError();
    showModal('editCandidaturaModal');
}

function closeCandidaturaEditModal() {
    hideModal('editCandidaturaModal');
    hideCandidaturaEditModalError();
    candidaturaInModificaId = null;

    const form = document.getElementById('editCandidaturaForm');
    if (form) form.reset();
}

async function salvaModificaCandidatura(event) {
    event.preventDefault();
    hideCandidaturaEditModalError();

    const posizioneLavorativa = getValue('editPosizione').trim();
    const stato = getValue('editStato').trim();
    const dataInvio = getValue('editDataInvio');
    const note = getValue('editNoteCandidatura').trim();
    const skillRaw = getValue('editSkills').trim();

    if (!posizioneLavorativa) {
        return showCandidaturaEditModalError('Inserisci la posizione lavorativa.');
    }

    const skills = skillRaw
        ? skillRaw
            .split(',')
            .map((item) => item.trim())
            .filter(Boolean)
            .map((nome) => ({ nome }))
        : [];

    try {
        await ApiService.updateCandidatura(candidaturaInModificaId, {
            posizioneLavorativa,
            stato,
            dataInvio,
            note,
            skills,
            azienda: {
                idAzienda: Number(aziendaCorrenteId)
            }
        });

        closeCandidaturaEditModal();
        await loadCompanyProfile(aziendaCorrenteId);
    } catch (error) {
        showCandidaturaEditModalError(error?.message || 'Errore durante il salvataggio della candidatura.');
    }
}

function openDeleteCandidaturaModal(id, posizione) {
    candidaturaDaEliminareId = id;
    const message = document.getElementById('deleteCandidaturaMessage');
    if (message) {
        message.textContent = `Vuoi eliminare la candidatura ${posizione}?`;
    }
    showModal('deleteCandidaturaModal');
}

function closeDeleteCandidaturaModal() {
    hideModal('deleteCandidaturaModal');
    candidaturaDaEliminareId = null;
}

async function confermaEliminazioneCandidatura() {
    if (!candidaturaDaEliminareId) return;

    try {
        await ApiService.deleteCandidatura(candidaturaDaEliminareId);
        closeDeleteCandidaturaModal();
        await loadCompanyProfile(aziendaCorrenteId);
    } catch (error) {
        alert(error?.message || 'Errore durante l’eliminazione della candidatura.');
    }
}

function createCell(value, label) {
    const td = document.createElement('td');
    td.textContent = value ?? '-';
    td.setAttribute('data-label', label);
    return td;
}

function renderSkillList(skills) {
    const wrapper = document.createElement('div');
    wrapper.className = 'skill-list';

    if (!Array.isArray(skills) || skills.length === 0) {
        const empty = document.createElement('span');
        empty.className = 'skill-empty';
        empty.textContent = 'Nessuna skill';
        wrapper.appendChild(empty);
        return wrapper;
    }

    skills.forEach((item) => {
        const chip = document.createElement('span');
        chip.className = 'badge badge-neutral';
        chip.textContent = typeof item === 'string' ? item : (item?.nome || item?.nomeSkill || item?.skill || 'Skill');
        wrapper.appendChild(chip);
    });

    return wrapper;
}

function updateCounters(candidature) {
    const count = Array.isArray(candidature) ? candidature.length : 0;
    const countEl = document.getElementById('companyApplicationsCount');
    const resultEl = document.getElementById('companyResultsCount');
    const lastEl = document.getElementById('companyLastApplication');

    if (countEl) countEl.textContent = String(count);
    if (resultEl) resultEl.textContent = `${count} risultati`;

    if (lastEl) {
        if (!count) {
            lastEl.textContent = '—';
        } else {
            const sorted = [...candidature].sort((a, b) => {
                const da = new Date(a?.dataInvio || a?.dataCandidatura || a?.data || 0).getTime();
                const db = new Date(b?.dataInvio || b?.dataCandidatura || b?.data || 0).getTime();
                return db - da;
            });

            lastEl.textContent = formatDate(
                sorted[0]?.dataInvio || sorted[0]?.dataCandidatura || sorted[0]?.data
            );
        }
    }
}

function renderCompanyNotFound(message) {
    const hero = document.getElementById('companyHero');
    const tbody = document.getElementById('companyCandidatureTableBody');

    if (hero) {
        hero.innerHTML = `
            <div class="company-profile-content">
                <div class="company-profile-main">
                    <h2 class="company-name">Profilo non disponibile</h2>
                    <p class="profile-text">${escapeHtml(message)}</p>
                </div>
            </div>
        `;
    }

    if (tbody) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="table-message">${escapeHtml(message)}</td>
            </tr>
        `;
    }

    updateCounters([]);
}

function getAziendaIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id') || params.get('aziendaId') || params.get('idAzienda');
}

function getBadgeClass(stato) {
    const normalized = normalizeStatoValue(stato);

    if (normalized === 'INVIATA') return 'badge badge-info';
    if (normalized === 'IN_VALUTAZIONE') return 'badge badge-warning';
    if (normalized === 'COLLOQUIO') return 'badge badge-primary';
    if (normalized === 'RIGETTATO') return 'badge badge-danger';
    if (normalized === 'SCARTATA') return 'badge badge-danger';
    if (normalized === 'ACCETTATA') return 'badge badge-success';
    if (normalized === 'OFFERTA') return 'badge badge-warning';

    return 'badge badge-neutral';
}

function normalizeStatoValue(stato) {
    const raw = String(stato || '').trim().toUpperCase();

    const mapping = {
        ACCETTATA: 'ACCETTATA',
        COLLOQUIO: 'COLLOQUIO',
        IN_VALUTAZIONE: 'IN_VALUTAZIONE',
        'IN VALUTAZIONE': 'IN_VALUTAZIONE',
        INVIATA: 'INVIATA',
        OFFERTA: 'OFFERTA',
        RIGETTATO: 'RIGETTATO',
        SCARTATA: 'SCARTATA'
    };

    return mapping[raw] || raw;
}

function readCompanyName(azienda) {
    return azienda?.nome || azienda?.ragioneSociale || '';
}

function readCandidaturaId(candidatura) {
    return candidatura?.idCandidatura ?? candidatura?.id ?? null;
}

function readSkills(candidatura) {
    if (Array.isArray(candidatura?.skills)) return candidatura.skills;
    if (Array.isArray(candidatura?.skill)) return candidatura.skill;
    return [];
}

function formatDate(value) {
    if (!value) return '-';

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);

    return date.toLocaleDateString('it-IT');
}

function formatDateForInput(value) {
    if (!value) return '';

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    modal.classList.add('show');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
}

function hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    modal.classList.remove('show');
    modal.setAttribute('aria-hidden', 'true');

    if (!document.querySelector('.modal-overlay.show')) {
        document.body.classList.remove('modal-open');
    }
}

function showEditModalError(message) {
    const box = document.getElementById('editAziendaError');
    if (!box) return;
    box.textContent = message;
    box.style.display = 'block';
}

function hideEditModalError() {
    const box = document.getElementById('editAziendaError');
    if (!box) return;
    box.textContent = '';
    box.style.display = 'none';
}

function showCandidaturaEditModalError(message) {
    const box = document.getElementById('editCandidaturaError');
    if (!box) return;
    box.textContent = message;
    box.style.display = 'block';
}

function hideCandidaturaEditModalError() {
    const box = document.getElementById('editCandidaturaError');
    if (!box) return;
    box.textContent = '';
    box.style.display = 'none';
}

function setValue(id, value) {
    const element = document.getElementById(id);
    if (element) element.value = value ?? '';
}

function getValue(id) {
    const element = document.getElementById(id);
    return element ? element.value : '';
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

function setUserName(utente) {
    const userNameDisplay = document.getElementById('userNameDisplay');
    if (userNameDisplay) {
        userNameDisplay.textContent = utente?.nome || utente?.username || 'Utente';
    }
}

function bindLogout() {
    const linkLogout = document.getElementById('logoutBtn');
    if (!linkLogout) return;

    linkLogout.addEventListener('click', (event) => {
        event.preventDefault();
        sessionStorage.clear();
        window.location.href = './login.html';
    });
}

function isValidHttpUrl(value) {
    try {
        const url = new URL(value);
        return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
        return false;
    }
}

function looksLikeUrlOrDomain(value) {
    if (!value) return false;
    if (isValidHttpUrl(value)) return true;
    return /^[a-z0-9.-]+\.[a-z]{2,}$/i.test(value);
}

function escapeHtml(value) {
    return String(value ?? '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
}