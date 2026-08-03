// =========================================================
// FORM AZIENDA
// - create azienda
// - validazione campi
// - sessione obbligatoria
// =========================================================

document.addEventListener('DOMContentLoaded', () => {
    const utente = requireSession();
    if (!utente) return;

    const form = document.getElementById('aziendaForm');
    const errorBox = document.getElementById('errorBox');

    if (window.initRevealAnimations) {
        initRevealAnimations();
    }

    if (!form) return;

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        hideError(errorBox);

        const payload = {
            nome: document.getElementById('nome')?.value.trim() || '',
            settore: document.getElementById('settore')?.value.trim() || '',
            citta: document.getElementById('citta')?.value.trim() || '',
            sitoWeb: document.getElementById('sitoWeb')?.value.trim() || '',
            immagine: document.getElementById('immagine')?.value.trim() || '',
            notePersonali: document.getElementById('notePersonali')?.value.trim() || ''
        };

        if (!payload.nome) {
            showError(errorBox, 'La ragione sociale è obbligatoria.');
            return;
        }

        if (!payload.immagine || !isValidHttpUrl(payload.immagine)) {
            showError(errorBox, 'Inserisci un URL immagine valido.');
            return;
        }

        if (payload.sitoWeb && !isValidHttpUrl(payload.sitoWeb)) {
            showError(errorBox, 'Il sito web non è un URL valido.');
            return;
        }

        try {
            await ApiService.creaAzienda(payload);
            window.location.href = 'dashboard.html';
        } catch (error) {
            showError(errorBox, error.message || 'Errore nel salvataggio.');
        }
    });
});

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

function isValidHttpUrl(value) {
    try {
        const url = new URL(value);
        return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
        return false;
    }
}