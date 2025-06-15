// SoulCode PWA - Main Application Logic
class SoulCodeApp {
    constructor() {
        this.currentPage = 'home';
        this.userData = this.loadUserData();
        this.init();
    }

    init() {
        this.registerServiceWorker();
        this.setupEventListeners();
        this.loadPage('home');
        this.updateUI();
        this.handleShortcuts();
    }

    // Service Worker Registration
    async registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('/sw.js');
                console.log('Service Worker registered:', registration);
                
                // Handle updates
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            this.showUpdateAvailable();
                        }
                    });
                });
            } catch (error) {
                console.error('Service Worker registration failed:', error);
            }
        }
    }

    // Load user data from localStorage
    loadUserData() {
        const defaultData = {
            name: '',
            selectedAffirmationCategories: [],
            notificationTimes: [],
            unlockedCalculators: [],
            personalizedMeditations: {},
            dailyCardHistory: [],
            profileAvatar: '✨'
        };

        try {
            const saved = localStorage.getItem('soulcode-userdata');
            return saved ? { ...defaultData, ...JSON.parse(saved) } : defaultData;
        } catch (error) {
            console.error('Error loading user data:', error);
            return defaultData;
        }
    }

    // Save user data to localStorage
    saveUserData() {
        try {
            localStorage.setItem('soulcode-userdata', JSON.stringify(this.userData));
        } catch (error) {
            console.error('Error saving user data:', error);
        }
    }

    // Setup all event listeners
    setupEventListeners() {
        // Menu navigation
        document.querySelectorAll('.menu-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const page = e.currentTarget.dataset.page;
                if (page) this.loadPage(page);
            });
        });

        // Profile circle click
        const profileCircle = document.querySelector('.profile-circle');
        if (profileCircle) {
            profileCircle.addEventListener('click', () => this.loadPage('profile'));
        }

        // Card of the day
        const cardSpinner = document.querySelector('.card-spinner');
        if (cardSpinner) {
            cardSpinner.addEventListener('click', () => this.spinCard());
        }

        // Calculator cards
        document.querySelectorAll('.calculator-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const calculator = e.currentTarget.dataset.calculator;
                this.handleCalculatorClick(calculator);
            });
        });

        // Meditation cards
        document.addEventListener('click', (e) => {
            if (e.target.closest('.meditation-card')) {
                const card = e.target.closest('.meditation-card');
                const meditation = card.dataset.meditation;
                this.playMeditation(meditation);
            }
        });

        // Affirmation categories
        document.addEventListener('click', (e) => {
            if (e.target.closest('.category-card')) {
                const card = e.target.closest('.category-card');
                const category = card.dataset.category;
                this.toggleAffirmationCategory(category);
            }
        });

        // Arcana selection
        document.addEventListener('click', (e) => {
            if (e.target.closest('.arcana-card')) {
                const card = e.target.closest('.arcana-card');
                const arcana = card.dataset.arcana;
                this.selectPersonalizedMeditation(arcana);
            }
        });

        // Form submissions
        document.addEventListener('submit', (e) => {
            e.preventDefault();
            if (e.target.id === 'profile-form') {
                this.saveProfile();
            } else if (e.target.id === 'time-form') {
                this.addNotificationTime();
            }
        });

        // Button clicks
        document.addEventListener('click', (e) => {
            if (e.target.matches('.btn')) {
                this.handleButtonClick(e.target);
            }
        });
    }

    // Handle shortcut URLs
    handleShortcuts() {
        const urlParams = new URLSearchParams(window.location.search);
        const shortcut = urlParams.get('shortcut');
        
        if (shortcut) {
            setTimeout(() => {
                this.loadPage(shortcut);
            }, 500);
        }
    }

    // Load and display pages
    loadPage(pageName) {
        // Hide all pages
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });

        // Show selected page
        const targetPage = document.getElementById(`${pageName}-page`);
        if (targetPage) {
            targetPage.classList.add('active');
            this.currentPage = pageName;
            
            // Update page-specific content
            this.updatePageContent(pageName);
            
            // Add fade-in animation
            targetPage.classList.add('fade-in');
            setTimeout(() => targetPage.classList.remove('fade-in'), 500);
        }
    }

    // Update page-specific content
    updatePageContent(pageName) {
        switch (pageName) {
            case 'home':
                this.updateHomeContent();
                break;
            case 'meditations':
                this.updateMeditationsContent();
                break;
            case 'affirmations':
                this.updateAffirmationsContent();
                break;
            case 'calculators':
                this.updateCalculatorsContent();
                break;
            case 'profile':
                this.updateProfileContent();
                break;
            case 'energy':
                this.updateEnergyContent();
                break;
        }
    }

    // Update home page content
    updateHomeContent() {
        const welcomeText = document.querySelector('.welcome-text');
        if (welcomeText) {
            const name = this.userData.name || 'Soul Seeker';
            const hour = new Date().getHours();
            let greeting = 'Good Evening';
            
            if (hour < 12) greeting = 'Good Morning';
            else if (hour < 17) greeting = 'Good Afternoon';
            
            welcomeText.textContent = `${greeting}, ${name}`;
        }

        // Update profile avatar
        const profileCircle = document.querySelector('.profile-circle');
        if (profileCircle) {
            profileCircle.textContent = this.userData.profileAvatar || '✨';
        }
    }

    // Card spinning functionality
    spinCard() {
        const cardSpinner = document.querySelector('.card-spinner');
        const cardResult = document.getElementById('card-result');
        
        if (!cardSpinner || cardSpinner.classList.contains('card-spinning')) return;

        // Add spinning animation
        cardSpinner.classList.add('card-spinning');
        cardSpinner.innerHTML = '<div style="font-size: 60px;">🔮</div>';

        // Intentions array
        const intentions = [
            "Trust your intuition today",
            "Embrace new opportunities",
            "Practice gratitude and kindness",
            "Focus on inner peace",
            "Let go of what no longer serves you",
            "Believe in your inner strength",
            "Open your heart to love",
            "Find balance in all things",
            "Listen to your soul's wisdom",
            "Create positive energy around you",
            "Transform challenges into growth",
            "Connect with your higher self",
            "Manifest your dreams with intention",
            "Spread light wherever you go",
            "Honor your authentic self"
        ];

        // Show result after spinning
        setTimeout(() => {
            cardSpinner.classList.remove('card-spinning');
            const randomIntention = intentions[Math.floor(Math.random() * intentions.length)];
            
            cardSpinner.innerHTML = `
                <div style="text-align: center; padding: 20px;">
                    <div style="font-size: 40px; margin-bottom: 10px;">✨</div>
                    <div style="font-size: 12px; line-height: 1.4;">${randomIntention}</div>
                </div>
            `;

            // Save to history
            this.userData.dailyCardHistory.unshift({
                date: new Date().toDateString(),
                intention: randomIntention
            });
            
            // Keep only last 30 days
            this.userData.dailyCardHistory = this.userData.dailyCardHistory.slice(0, 30);
            this.saveUserData();

        }, 10000); // 10 seconds spinning
    }

    // Calculator functionality
    handleCalculatorClick(calculatorType) {
        const isUnlocked = this.userData.unlockedCalculators.includes(calculatorType);
        
        if (!isUnlocked) {
            this.showUnlockDialog(calculatorType);
        } else {
            this.openCalculator(calculatorType);
        }
    }

    showUnlockDialog(calculatorType) {
        const dialog = document.createElement('div');
        dialog.className = 'unlock-dialog';
        dialog.innerHTML = `
            <div class="dialog-content">
                <h3>🔒 Unlock ${calculatorType}</h3>
                <p>Connect with our Telegram bot to unlock this calculator and discover your spiritual insights!</p>
                <button class="btn" onclick="this.closest('.unlock-dialog').remove(); app.openTelegram()">
                    Connect to Telegram
                </button>
                <button class="btn" onclick="this.closest('.unlock-dialog').remove()" 
                        style="background: rgba(255,255,255,0.2); margin-top: 10px;">
                    Maybe Later
                </button>
            </div>
        `;
        document.body.appendChild(dialog);
    }

    openTelegram() {
        window.open('https://t.me/YourSoulCodeBot', '_blank');
        // Simulate unlock after telegram interaction
        setTimeout(() => {
            this.userData.unlockedCalculators.push('Life Path', 'Soul Number');
            this.saveUserData();
            this.updateCalculatorsContent();
            this.showSuccess('Calculators unlocked! Welcome to your spiritual journey! ✨');
        }, 3000);
    }

    openCalculator(calculatorType) {
        // Simple calculator implementation
        const result = this.calculateSoulNumber();
        this.showSuccess(`Your ${calculatorType}: ${result} ✨`);
    }

    calculateSoulNumber() {
        // Simple soul number calculation based on current date
        const date = new Date();
        const sum = date.getDate() + date.getMonth() + 1 + date.getFullYear();
        return ((sum % 9) || 9);
    }

    // Meditation functionality
    playMeditation(meditationType) {
        const meditationUrls = {
            'general': 'https://www.youtube.com/embed/1ZYbU82GVz4',
            'chakra': 'https://www.youtube.com/embed/StrbppmsZJw',
            'manifestation': 'https://www.youtube.com/embed/QjZKd756-5w',
            'healing': 'https://www.youtube.com/embed/z6X5oEIg6Ak',
            'sleep': 'https://www.youtube.com/embed/1vkjQbaO4gE'
        };

        const videoContainer = document.querySelector('.video-container');
        if (videoContainer) {
            const url = meditationUrls[meditationType] || meditationUrls['general'];
            videoContainer.innerHTML = `
                <iframe width="100%" height="200" 
                        src="${url}" 
                        frameborder="0" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowfullscreen>
                </iframe>
            `;
        }

        // Mark meditation cards as selected
        document.querySelectorAll('.meditation-card').forEach(card => {
            card.classList.remove('selected');
        });
        document.querySelector(`[data-meditation="${meditationType}"]`)?.classList.add('selected');
    }

    selectPersonalizedMeditation(arcanaNumber) {
        // Personalized meditation URLs (you'll need to add your actual URLs)
        const personalizedUrls = {
            '1': 'https://www.youtube.com/embed/YOUR_ARCANA_1_URL',
            '2': 'https://www.youtube.com/embed/YOUR_ARCANA_2_URL',
            '3': 'https://www.youtube.com/embed/YOUR_ARCANA_3_URL',
            '4': 'https://www.youtube.com/embed/YOUR_ARCANA_4_URL',
            '5': 'https://www.youtube.com/embed/YOUR_ARCANA_5_URL',
            '6': 'https://www.youtube.com/embed/YOUR_ARCANA_6_URL',
            '7': 'https://www.youtube.com/embed/YOUR_ARCANA_7_URL',
            '8': 'https://www.youtube.com/embed/YOUR_ARCANA_8_URL',
            '9': 'https://www.youtube.com/embed/YOUR_ARCANA_9_URL'
        };

        const url = personalizedUrls[arcanaNumber];
        if (url && url !== 'https://www.youtube.com/embed/YOUR_ARCANA_' + arcanaNumber + '_URL') {
            const videoContainer = document.querySelector('.video-container');
            if (videoContainer) {
                videoContainer.innerHTML = `
                    <iframe width="100%" height="200" 
                            src="${url}" 
                            frameborder="0" 
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                            allowfullscreen>
                    </iframe>
                `;
            }
        } else {
            this.showWarning('Personalized meditation for Arcana ' + arcanaNumber + ' coming soon! ✨');
        }

        // Update selection
        document.querySelectorAll('.arcana-card').forEach(card => {
            card.classList.remove('selected');
        });
        document.querySelector(`[data-arcana="${arcanaNumber}"]`)?.classList.add('selected');
    }

    // Affirmation functionality
    toggleAffirmationCategory(category) {
        const index = this.userData.selectedAffirmationCategories.indexOf(category);
        
        if (index === -1) {
            this.userData.selectedAffirmationCategories.push(category);
        } else {
            this.userData.selectedAffirmationCategories.splice(index, 1);
        }
        
        this.saveUserData();
        this.updateAffirmationsContent();
    }

        updateAffirmationsContent() {
        // Update category selection UI
        document.querySelectorAll('.category-card').forEach(card => {
            const category = card.dataset.category;
            const checkbox = card.querySelector('.checkbox');
            const isSelected = this.userData.selectedAffirmationCategories.includes(category);
            
            if (isSelected) {
                card.classList.add('selected');
                if (checkbox) checkbox.classList.add('checked');
                if (checkbox) checkbox.textContent = '✓';
            } else {
                card.classList.remove('selected');
                if (checkbox) checkbox.classList.remove('checked');
                if (checkbox) checkbox.textContent = '';
            }
        });

        // Update selected categories display
        const selectedDisplay = document.querySelector('.selected-categories');
        if (selectedDisplay) {
            if (this.userData.selectedAffirmationCategories.length > 0) {
                selectedDisplay.innerHTML = `
                    <h4>Selected Categories:</h4>
                    ${this.userData.selectedAffirmationCategories.map(cat => 
                        `<span class="category-badge">${cat}</span>`
                    ).join('')}
                `;
            } else {
                selectedDisplay.innerHTML = '<p>Select categories to receive daily affirmations ✨</p>';
            }
        }
    }

    // Add notification time
    addNotificationTime() {
        const timeInput = document.getElementById('notification-time');
        if (!timeInput || !timeInput.value) return;

        const time = timeInput.value;
        if (!this.userData.notificationTimes.includes(time)) {
            this.userData.notificationTimes.push(time);
            this.saveUserData();
            this.updateNotificationTimes();
            this.scheduleNotification(time);
            timeInput.value = '';
            this.showSuccess('Notification time added! ⏰');
        }
    }

    updateNotificationTimes() {
        const currentTimes = document.querySelector('.current-times');
        if (currentTimes) {
            if (this.userData.notificationTimes.length > 0) {
                currentTimes.innerHTML = `
                    <h4>Your Notification Times:</h4>
                    ${this.userData.notificationTimes.map(time => 
                        `<span class="time-badge">${time} <span onclick="app.removeNotificationTime('${time}')" style="cursor:pointer;">×</span></span>`
                    ).join('')}
                `;
            } else {
                currentTimes.innerHTML = '<p>No notification times set</p>';
            }
        }
    }

    removeNotificationTime(time) {
        this.userData.notificationTimes = this.userData.notificationTimes.filter(t => t !== time);
        this.saveUserData();
        this.updateNotificationTimes();
        this.showSuccess('Notification time removed');
    }
    // Schedule notification
    scheduleNotification(time) {
        if ('serviceWorker' in navigator && 'Notification' in window) {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    // Send message to service worker to schedule notification
                    navigator.serviceWorker.ready.then(registration => {
                        registration.active.postMessage({
                            type: 'SCHEDULE_NOTIFICATION',
                            payload: {
                                time: time,
                                affirmation: this.getRandomAffirmation(),
                                category: this.getRandomCategory()
                            }
                        });
                    });
                }
            });
        }
    }

    getRandomAffirmation() {
        const affirmations = [
            "I am worthy of love and happiness",
            "I trust in my ability to create positive change",
            "I am grateful for all the blessings in my life",
            "I choose peace and joy in every moment",
            "I am confident in my unique gifts and talents"
        ];
        return affirmations[Math.floor(Math.random() * affirmations.length)];
    }

    getRandomCategory() {
        return this.userData.selectedAffirmationCategories.length > 0 
            ? this.userData.selectedAffirmationCategories[Math.floor(Math.random() * this.userData.selectedAffirmationCategories.length)]
            : "Daily Inspiration";
    }

    // Profile functionality
    saveProfile() {
        const nameInput = document.getElementById('user-name');
        const avatarInput = document.getElementById('user-avatar');
        
        if (nameInput) this.userData.name = nameInput.value;
        if (avatarInput) this.userData.profileAvatar = avatarInput.value || '✨';
        
        this.saveUserData();
        this.updateUI();
        this.showSuccess('Profile saved! ✨');
    }

    updateProfileContent() {
        const nameInput = document.getElementById('user-name');
        const avatarInput = document.getElementById('user-avatar');
        
        if (nameInput) nameInput.value = this.userData.name || '';
        if (avatarInput) avatarInput.value = this.userData.profileAvatar || '✨';
        
        // Update unlocked calculators display
        const unlockedList = document.querySelector('.unlocked-list');
        if (unlockedList) {
            if (this.userData.unlockedCalculators.length > 0) {
                unlockedList.innerHTML = `
                    <h4>Unlocked Features:</h4>
                    ${this.userData.unlockedCalculators.map(calc => 
                        `<div class="unlocked-item">🔓 ${calc} Calculator</div>`
                    ).join('')}
                `;
            } else {
                unlockedList.innerHTML = '<p>Connect with Telegram to unlock calculators! 🔒</p>';
            }
        }
        
        this.updateNotificationTimes();
    }

    updateCalculatorsContent() {
        document.querySelectorAll('.calculator-card').forEach(card => {
            const calculator = card.dataset.calculator;
            const isUnlocked = this.userData.unlockedCalculators.includes(calculator);
            const lockIcon = card.querySelector('.lock-icon');
            const status = card.querySelector('.status');
            
            if (isUnlocked) {
                card.classList.add('unlocked');
                if (lockIcon) lockIcon.textContent = '🔓';
                if (status) status.textContent = 'Unlocked';
            } else {
                card.classList.remove('unlocked');
                if (lockIcon) lockIcon.textContent = '🔒';
                if (status) status.textContent = 'Locked';
            }
        });
    }
    updateMeditationsContent() {
        // Update meditation selection
        document.querySelectorAll('.meditation-card').forEach(card => {
            card.addEventListener('click', () => {
                const meditation = card.dataset.meditation;
                this.playMeditation(meditation);
            });
        });
    }

    updateEnergyContent() {
        // Energy discovery content is mostly static
        // Add any dynamic content here if needed
    }

    // Button click handler
    handleButtonClick(button) {
        const action = button.dataset.action;
        
        switch (action) {
            case 'save-profile':
                this.saveProfile();
                break;
            case 'add-time':
                this.addNotificationTime();
                break;
            case 'connect-telegram':
                this.openTelegram();
                break;
            case 'spin-card':
                this.spinCard();
                break;
            default:
                // Handle other button clicks
                break;
        }
    }

    // Update UI elements
    updateUI() {
        this.updateHomeContent();
        this.updateProfileContent();
        this.updateAffirmationsContent();
        this.updateCalculatorsContent();
    }

    // Notification functions
    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showWarning(message) {
        this.showNotification(message, 'warning');
    }

    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 10px;
            color: white;
            font-weight: bold;
            z-index: 1000;
            animation: slideIn 0.3s ease;
            max-width: 300px;
        `;
        
        switch (type) {
            case 'success':
                notification.style.background = '#51cf66';
                break;
            case 'error':
                notification.style.background = '#ff6b6b';
                break;
            case 'warning':
                notification.style.background = '#ffd43b';
                notification.style.color = '#333';
                break;
        }
        
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    showUpdateAvailable() {
        const updateBanner = document.createElement('div');
        updateBanner.innerHTML = `
            <div style="position: fixed; top: 0; left: 0; right: 0; background: #ccae79; color: #4c135d; padding: 10px; text-align: center; z-index: 1001;">
                <span>New version available! </span>
                <button onclick="location.reload()" style="background: #4c135d; color: white; border: none; padding: 5px 10px; border-radius: 5px; margin-left: 10px;">
                    Update Now
                </button>
                <button onclick="this.parentElement.parentElement.remove()" style="background: transparent; border: none; color: #4c135d; margin-left: 10px;">
                    ×
                </button>
            </div>
        `;
        document.body.appendChild(updateBanner);
    }
    // Install PWA prompt
    showInstallPrompt() {
        let deferredPrompt;
        
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            
            // Show install button
            const installBtn = document.createElement('button');
            installBtn.className = 'install-btn';
            installBtn.innerHTML = '📱 Install App';
            installBtn.style.cssText = `
                position: fixed;
                bottom: 80px;
                right: 20px;
                background: #ccae79;
                color: #4c135d;
                border: none;
                padding: 10px 15px;
                border-radius: 25px;
                font-weight: bold;
                z-index: 1000;
                box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            `;
            
            installBtn.addEventListener('click', async () => {
                if (deferredPrompt) {
                    deferredPrompt.prompt();
                    const { outcome } = await deferredPrompt.userChoice;
                    
                    if (outcome === 'accepted') {
                        this.showSuccess('App installed successfully! 🎉');
                    }
                    
                    deferredPrompt = null;
                    installBtn.remove();
                }
            });
            
            document.body.appendChild(installBtn);
            
            // Auto-hide after 10 seconds
            setTimeout(() => {
                if (installBtn.parentNode) {
                    installBtn.remove();
                }
            }, 10000);
        });
    }

    // Handle offline/online status
    handleConnectionStatus() {
        window.addEventListener('online', () => {
            this.showSuccess('Connection restored! ✨');
        });
        
        window.addEventListener('offline', () => {
            this.showWarning('You are offline. Some features may be limited.');
        });
    }

    // Initialize animations
    initAnimations() {
        // Add CSS animations
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
            
            .fade-in {
                animation: fadeIn 0.5s ease;
            }
            
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(20px); }
                to { opacity: 1; transform: translateY(0); }
            }
        `;
        document.head.appendChild(style);
    }

    // Cleanup function
    cleanup() {
        // Remove event listeners if needed
        // Clear timeouts/intervals
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new SoulCodeApp();
    app.showInstallPrompt();
    app.handleConnectionStatus();
    app.initAnimations();
});

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && window.app) {
        // Refresh content when app becomes visible
        window.app.updateUI();
    }
});

// Handle back button
window.addEventListener('popstate', (e) => {
    if (window.app) {
        window.app.loadPage('home');
    }
});

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SoulCodeApp;
}

console.log('SoulCode PWA loaded successfully! ✨');

