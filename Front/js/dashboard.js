let tutteLeAziende = [];
let aziendeFiltrate = [];
let aziendaInModificaId = null;
let aziendaDaEliminareId = null;

document.addEventListener('DOMContentLoaded', async () => {
    const utente = requireSession();
    if (!utente) return;

    setUserName(utente);
    bindLogout();
    bindFiltri();
    bindModals();

    await caricaAziende();

    if (window.initRevealAnimations) {
        initRevealAnimations();
    }
});

async function caricaAziende() {
    const grid = document.getElementById('aziendeGrid');
    if (!grid) return;

    renderLoadingState();

    try {
        const data = await ApiService.getAziende();
        tutteLeAziende = Array.isArray(data) ? data : [];
        aziendeFiltrate = [...tutteLeAziende];
        renderAziende(aziendeFiltrate);

        if (window.initRevealAnimations) {
            initRevealAnimations(grid);
        }
    } catch (error) {
        renderErrorState(error.message || 'Errore durante il caricamento delle aziende.');
    }
}

function bindFiltri() {
    const btnSearch = document.getElementById('searchBtn');
    const btnReset = document.getElementById('resetSearchBtn');
    const searchInput = document.getElementById('searchAzienda');

    if (btnSearch) {
        btnSearch.addEventListener('click', applicaFiltroRicerca);
    }

    if (btnReset) {
        btnReset.addEventListener('click', () => {
            if (searchInput) searchInput.value = '';
            aziendeFiltrate = [...tutteLeAziende];
            renderAziende(aziendeFiltrate);
        });
    }

    if (searchInput) {
        searchInput.addEventListener('input', applicaFiltroRicerca);

        searchInput.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                applicaFiltroRicerca();
            }

            if (event.key === 'Escape') {
                searchInput.value = '';
                aziendeFiltrate = [...tutteLeAziende];
                renderAziende(aziendeFiltrate);
            }
        });
    }
}

function applicaFiltroRicerca() {
    const searchInput = document.getElementById('searchAzienda');
    const query = (searchInput?.value || '').trim().toLowerCase();

    if (!query) {
        aziendeFiltrate = [...tutteLeAziende];
        renderAziende(aziendeFiltrate);
        return;
    }

    aziendeFiltrate = tutteLeAziende.filter((azienda) => {
        const nome = (azienda.nome || '').toLowerCase();
        const settore = (azienda.settore || '').toLowerCase();
        const citta = (azienda.citta || '').toLowerCase();
        const note = (azienda.notePersonali || '').toLowerCase();

        return (
            nome.includes(query) ||
            settore.includes(query) ||
            citta.includes(query) ||
            note.includes(query)
        );
    });

    renderAziende(aziendeFiltrate);
}

function bindModals() {
    const editModal = document.getElementById('editAziendaModal');
    const deleteModal = document.getElementById('deleteAziendaModal');

    const closeEdit = document.getElementById('closeEditAziendaModal');
    const cancelEdit = document.getElementById('cancelEditAziendaBtn');
    const editForm = document.getElementById('editAziendaForm');

    const closeDelete = document.getElementById('closeDeleteAziendaModal');
    const cancelDelete = document.getElementById('cancelDeleteAziendaBtn');
    const confirmDelete = document.getElementById('confirmDeleteAziendaBtn');

    if (closeEdit) closeEdit.addEventListener('click', closeEditAziendaModal);
    if (cancelEdit) cancelEdit.addEventListener('click', closeEditAziendaModal);
    if (editForm) editForm.addEventListener('submit', salvaModificaAzienda);

    if (closeDelete) closeDelete.addEventListener('click', closeDeleteAziendaModal);
    if (cancelDelete) cancelDelete.addEventListener('click', closeDeleteAziendaModal);
    if (confirmDelete) confirmDelete.addEventListener('click', confermaEliminazioneAzienda);

    if (editModal) {
        editModal.addEventListener('click', (event) => {
            if (event.target === editModal) closeEditAziendaModal();
        });
    }

    if (deleteModal) {
        deleteModal.addEventListener('click', (event) => {
            if (event.target === deleteModal) closeDeleteAziendaModal();
        });
    }

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            closeEditAziendaModal();
            closeDeleteAziendaModal();
        }
    });
}

function renderAziende(aziende) {
    const grid = document.getElementById('aziendeGrid');
    if (!grid) return;

    grid.innerHTML = '';

    if (!aziende || aziende.length === 0) {
        grid.innerHTML = `
            <div class="empty-state-card reveal-up">
                Nessuna azienda trovata.
            </div>
        `;
        if (window.initRevealAnimations) initRevealAnimations(grid);
        return;
    }

    aziende.forEach((azienda) => {
        const id = azienda.idAzienda ?? azienda.id;
        const nome = escapeHtml(azienda.nome || 'Azienda senza nome');
        const settore = escapeHtml(azienda.settore || 'Settore non definito');
        const citta = escapeHtml(azienda.citta || 'Città non disponibile');
        const note = escapeHtml(azienda.notePersonali || 'Nessuna nota disponibile.');
        const immagineUrl = azienda.immagineUrl || azienda.immagine || 'https://placehold.co/800x500?text=Azienda';

        const article = document.createElement('article');
        article.className = 'card-azienda reveal-up';
        article.tabIndex = 0;

        article.innerHTML = `
            <div class="card-img-wrapper">
                <span class="card-tag">${settore}</span>

                <div class="card-image-actions">
                    <button type="button" class="icon-btn icon-btn-edit" aria-label="Modifica ${nome}" data-action="edit">
                        <svg viewBox="0 0 24 24">
                            <path d="M12 20h9"></path>
                            <path d="M16.5 3.5a2.12 2.12 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z"></path>
                        </svg>
                    </button>

                    <button type="button" class="icon-btn icon-btn-delete" aria-label="Elimina ${nome}" data-action="delete">
                        <svg viewBox="0 0 24 24">
                            <path d="M3 6h18"></path>
                            <path d="M8 6V4h8v2"></path>
                            <path d="M19 6l-1 14H6L5 6"></path>
                        </svg>
                    </button>
                </div>

                <img src="${escapeAttribute(immagineUrl)}" alt="${nome}" loading="lazy" />
            </div>

            <div class="card-body">
                <h3 class="card-title">${nome}</h3>
                <p class="card-info">${note}</p>

                <div class="card-footer">
                    <span class="card-city">
                        <svg class="card-city-icon" viewBox="0 0 24 24">
                            <path d="M12 21s-6-4.35-6-10a6 6 0 1 1 12 0c0 5.65-6 10-6 10z"></path>
                            <circle cx="12" cy="11" r="2.5"></circle>
                        </svg>
                        ${citta}
                    </span>

                    <a class="card-link" href="./azienda-profilo.html?id=${encodeURIComponent(id)}">
                        Apri profilo
                    </a>
                </div>
            </div>
        `;

        article.addEventListener('click', (event) => {
            const actionButton = event.target.closest('[data-action]');
            const profileLink = event.target.closest('.card-link');
            if (actionButton || profileLink) return;
            window.location.href = `./azienda-profilo.html?id=${encodeURIComponent(id)}`;
        });

        article.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                const active = document.activeElement;
                if (active && active.closest('[data-action], .card-link')) return;
                event.preventDefault();
                window.location.href = `./azienda-profilo.html?id=${encodeURIComponent(id)}`;
            }
        });

        article.querySelector('[data-action="edit"]')?.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
            openEditAziendaModal(azienda);
        });

        article.querySelector('[data-action="delete"]')?.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
            openDeleteAziendaModal(id);
        });

        grid.appendChild(article);
    });

    if (window.initRevealAnimations) {
        initRevealAnimations(grid);
    }
}

function renderLoadingState() {
    const grid = document.getElementById('aziendeGrid');
    if (!grid) return;

    grid.innerHTML = `
        <div class="empty-state-card reveal-up">
            Caricamento aziende...
        </div>
    `;
}

function renderErrorState(message) {
    const grid = document.getElementById('aziendeGrid');
    if (!grid) return;

    grid.innerHTML = `
        <div class="empty-state-card reveal-up">
            ${escapeHtml(message)}
        </div>
    `;
}

function openEditAziendaModal(azienda) {
    const modal = document.getElementById('editAziendaModal');
    const errorBox = document.getElementById('editAziendaError');
    if (!modal) return;

    aziendaInModificaId = azienda.idAzienda ?? azienda.id;

    setValue('editRagioneSociale', azienda.nome || '');
    setValue('editSettore', azienda.settore || '');
    setValue('editCitta', azienda.citta || '');
    setValue('editSitoWeb', azienda.sitoWeb || '');
    setValue('editImmagineUrl', azienda.immagineUrl || azienda.immagine || '');
    setValue('editNote', azienda.notePersonali || '');

    hideError(errorBox);
    openModal(modal);
}

function closeEditAziendaModal() {
    const modal = document.getElementById('editAziendaModal');
    const form = document.getElementById('editAziendaForm');
    const errorBox = document.getElementById('editAziendaError');

    aziendaInModificaId = null;
    hideError(errorBox);

    if (form) form.reset();
    closeModal(modal);
}

async function salvaModificaAzienda(event) {
    event.preventDefault();

    const errorBox = document.getElementById('editAziendaError');
    hideError(errorBox);

    const nome = getValue('editRagioneSociale').trim();
    const settore = getValue('editSettore').trim();
    const citta = getValue('editCitta').trim();
    const sitoWeb = getValue('editSitoWeb').trim();
    const immagineUrl = getValue('editImmagineUrl').trim();
    const notePersonali = getValue('editNote').trim();

    if (!nome) {
        showError(errorBox, 'La ragione sociale è obbligatoria.');
        return;
    }

    if (!immagineUrl || !isValidHttpUrl(immagineUrl)) {
        showError(errorBox, 'Inserisci un URL immagine valido.');
        return;
    }

    if (sitoWeb && !isValidHttpUrl(sitoWeb)) {
        showError(errorBox, 'Il sito web non è un URL valido.');
        return;
    }

    const payload = { nome, settore, citta, sitoWeb, immagineUrl, notePersonali };

    try {
        await ApiService.updateAzienda(aziendaInModificaId, payload);
        closeEditAziendaModal();
        await caricaAziende();
    } catch (error) {
        showError(errorBox, error.message || 'Errore nel salvataggio.');
    }
}

function openDeleteAziendaModal(id) {
    const modal = document.getElementById('deleteAziendaModal');
    if (!modal) return;
    aziendaDaEliminareId = id;
    openModal(modal);
}

function closeDeleteAziendaModal() {
    const modal = document.getElementById('deleteAziendaModal');
    aziendaDaEliminareId = null;
    closeModal(modal);
}

async function confermaEliminazioneAzienda() {
    if (!aziendaDaEliminareId) return;

    try {
        await ApiService.deleteAzienda(aziendaDaEliminareId);
        closeDeleteAziendaModal();
        await caricaAziende();
    } catch (error) {
        alert(error.message || 'Errore durante l’eliminazione dell’azienda.');
    }
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

function isValidHttpUrl(value) {
    try {
        const url = new URL(value);
        return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
        return false;
    }
}

function escapeHtml(value) {
    return String(value)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
}

function escapeAttribute(value) {
    return escapeHtml(value);
}