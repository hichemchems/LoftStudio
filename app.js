// Application LoftBarber - Version de secours optimisée pour cPanel
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 LoftBarber frontend loaded (version secours)');

    // Simuler React state
    let state = {
        isLoading: false,
        message: null,
        messageType: 'info'
    };

    const loginForm = document.getElementById('loginForm');
    const messageDiv = document.getElementById('message');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const submitBtn = document.querySelector('.btn-login');

    // Vérifier que les éléments existent
    if (!loginForm || !emailInput || !passwordInput || !submitBtn) {
        console.error('❌ Éléments du formulaire non trouvés');
        return;
    }

    function updateUI() {
        if (state.isLoading) {
            submitBtn.textContent = 'Connexion...';
            submitBtn.disabled = true;
        } else {
            submitBtn.textContent = 'Se connecter';
            submitBtn.disabled = false;
        }

        if (state.message) {
            messageDiv.textContent = state.message;
            messageDiv.className = state.messageType;
            messageDiv.style.display = 'block';
        } else {
            messageDiv.style.display = 'none';
        }
    }

    function setState(newState) {
        state = { ...state, ...newState };
        updateUI();
    }

    function showMessage(message, type = 'error') {
        console.log(`📢 Message: ${message} (${type})`);
        setState({ message, messageType: type });

        if (type !== 'info') {
            setTimeout(() => {
                setState({ message: null });
            }, 5000);
        }
    }

    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        console.log('📝 Formulaire soumis');

        // Get values safely with null checks
        const email = emailInput ? emailInput.value.trim() : '';
        const password = passwordInput ? passwordInput.value : '';

        // Validation
        if (!email || !password) {
            showMessage('Veuillez remplir tous les champs');
            return;
        }

        if (!email.includes('@')) {
            showMessage('Veuillez entrer un email valide');
            return;
        }

        setState({ isLoading: true, message: 'Connexion en cours...', messageType: 'info' });

        try {
            console.log('🔄 Tentative de connexion...');

            const response = await fetch('/api/v1/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            console.log(`📡 Réponse HTTP: ${response.status}`);

            const data = await response.json();
            console.log('📦 Données reçues:', data);

            setState({ isLoading: false });

            if (response.ok && data.success) {
                console.log('✅ Connexion réussie');
                showMessage('Connexion réussie ! Redirection...', 'success');
                localStorage.setItem('token', data.data.token);

                // Redirection vers le dashboard
                setTimeout(() => {
                    console.log('🔄 Redirection vers /dashboard');
                    window.location.href = '/dashboard';
                }, 1500);
            } else {
                console.log('❌ Échec de connexion:', data.message);
                showMessage(data.message || 'Email ou mot de passe incorrect');
            }
        } catch (error) {
            console.error('💥 Erreur de connexion:', error);
            setState({ isLoading: false });
            showMessage('Erreur de connexion au serveur. Vérifiez votre connexion internet.');
        }
    });

    // Test de connexion API au chargement
    console.log('🔍 Test de connexion API...');
    fetch('/api/v1/health')
        .then(response => {
            console.log(`🏥 Health check: ${response.status}`);
            return response.json();
        })
        .then(data => {
            console.log('✅ API connectée:', data);
        })
        .catch(error => {
            console.error('❌ API non accessible:', error);
            showMessage('Serveur non accessible. Veuillez réessayer plus tard.');
        });

    console.log('🎉 Application initialisée (version secours)');
});
