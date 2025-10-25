// LoftBarber Frontend - Version Finale avec Debug
console.log('🚀 Starting LoftBarber frontend...');

// Variable globale pour éviter les réinitialisations multiples
window.loftBarberInitialized = false;

function initializeLoftBarber() {
    if (window.loftBarberInitialized) {
        console.log('⚠️ Already initialized, skipping...');
        return;
    }

    console.log('🎯 Initializing LoftBarber application...');

    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const messageDiv = document.getElementById('message');

    console.log('🔍 Checking DOM elements:');
    console.log('- loginForm:', loginForm ? 'FOUND' : 'NOT FOUND');
    console.log('- emailInput:', emailInput ? 'FOUND' : 'NOT FOUND');
    console.log('- passwordInput:', passwordInput ? 'FOUND' : 'NOT FOUND');
    console.log('- messageDiv:', messageDiv ? 'FOUND' : 'NOT FOUND');

    // Vérification critique
    if (!loginForm) {
        console.error('❌ CRITICAL: loginForm not found! Available IDs:');
        const allIds = Array.from(document.querySelectorAll('[id]')).map(el => el.id);
        console.log('Available IDs:', allIds);
        return;
    }

    if (!emailInput || !passwordInput) {
        console.error('❌ CRITICAL: Input fields not found!');
        return;
    }

    if (!messageDiv) {
        console.error('❌ CRITICAL: Message div not found!');
        return;
    }

    console.log('✅ All DOM elements found, setting up event listeners...');

    // Fonction d'affichage des messages
    function showMessage(message, type = 'error') {
        console.log(`📢 Showing message: "${message}" (${type})`);
        messageDiv.textContent = message;
        messageDiv.className = type;
        messageDiv.style.display = 'block';

        if (type !== 'info') {
            setTimeout(() => {
                messageDiv.style.display = 'none';
            }, 5000);
        }
    }

    // Gestionnaire de soumission du formulaire
    function handleFormSubmit(e) {
        e.preventDefault();
        console.log('📝 Form submitted');

        // Re-check elements to prevent null reference
        const currentEmailInput = document.getElementById('email');
        const currentPasswordInput = document.getElementById('password');
        const currentMessageDiv = document.getElementById('message');

        if (!currentEmailInput || !currentPasswordInput || !currentMessageDiv) {
            console.error('❌ Elements not found during form submit');
            return;
        }

        try {
            // Récupération sécurisée des valeurs
            const email = currentEmailInput.value ? currentEmailInput.value.trim() : '';
            const password = currentPasswordInput.value || '';

            console.log(`📧 Login attempt for: "${email}" (password length: ${password.length})`);

            // Validation
            if (!email) {
                showMessage('Veuillez saisir votre email');
                return;
            }

            if (!password) {
                showMessage('Veuillez saisir votre mot de passe');
                return;
            }

            if (!email.includes('@') || !email.includes('.')) {
                showMessage('Veuillez entrer un email valide');
                return;
            }

            // Tentative de connexion
            showMessage('Connexion en cours...', 'info');

            fetch('/api/v1/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            })
            .then(response => {
                console.log(`📡 Response status: ${response.status}`);
                return response.json();
            })
            .then(data => {
                console.log('📦 Response data:', data);

                if (data.success) {
                    console.log('✅ Login successful');
                    showMessage('Connexion réussie !', 'success');
                    localStorage.setItem('token', data.data.token);

                    setTimeout(() => {
                        window.location.href = '/dashboard';
                    }, 1500);
                } else {
                    console.log('❌ Login failed:', data.message);
                    showMessage(data.message || 'Identifiants incorrects');
                }
            })
            .catch(error => {
                console.error('💥 Fetch error:', error);
                showMessage('Erreur de connexion au serveur');
            });

        } catch (error) {
            console.error('💥 Form submit error:', error);
            showMessage('Erreur lors de la soumission du formulaire');
        }
    }

    // Ajout de l'event listener
    loginForm.addEventListener('submit', handleFormSubmit);
    console.log('✅ Event listener added to form');

    // Test de l'API
    fetch('/api/v1/health')
        .then(response => response.json())
        .then(data => {
            console.log('🏥 API Health check:', data);
        })
        .catch(error => {
            console.error('❌ API Health check failed:', error);
        });

    window.loftBarberInitialized = true;
    console.log('🎉 LoftBarber application initialized successfully!');
}

// Initialize immediately since script is loaded at end of body
initializeLoftBarber();
