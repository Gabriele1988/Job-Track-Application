// =========================================================
// LOGIN
// Gestisce autenticazione frontend e salvataggio sessione
// =========================================================

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('loginForm');
    const errorBox = document.getElementById('loginError');

    if (window.initRevealAnimations) {
        initRevealAnimations();
    }

    const guestBtn = document.getElementById('guestBtn');
    if (guestBtn) {
        guestBtn.addEventListener('click', () => {
            sessionStorage.setItem('utente', JSON.stringify({
                nome: 'Ospite',
                username: 'ospite'
            }));
            window.location.href = 'dashboard.html';
        });
    }

    if (!form) return;

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        hideError(errorBox);

        const username = document.getElementById('username')?.value.trim() || '';
        const password = document.getElementById('password')?.value.trim() || '';

        if (!username || !password) {
            showError(errorBox, 'Inserisci username e password.');
            return;
        }

        try {
            const utenteLoggato = await ApiService.login(username, password);

            if (!utenteLoggato || !utenteLoggato.username) {
                showError(errorBox, 'Credenziali non valide.');
                return;
            }

            sessionStorage.setItem('utente', JSON.stringify({
                nome: utenteLoggato.nome || utenteLoggato.username,
                username: utenteLoggato.username
            }));

            window.location.href = 'dashboard.html';
        } catch (error) {
            showError(errorBox, error.message || 'Errore durante il login.');
        }
    });
});

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