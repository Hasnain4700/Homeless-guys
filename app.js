// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const sections = {
        login: document.getElementById('loginSection'),
        home: document.getElementById('homeSection'),
        donationRequest: document.getElementById('donationRequestSection'),
        becomeShadow: document.getElementById('becomeShadowSection'),
        profile: document.getElementById('profileSection')
    };

    const navLinks = {
        home: document.getElementById('homeLink'),
        profile: document.getElementById('profileLink'),
        donationRequest: document.getElementById('donationRequestLink'),
        becomeShadow: document.getElementById('becomeShadowLink')
    };

    // Forms
    const authForm = document.getElementById('authForm');
    const requestForm = document.getElementById('requestForm');
    const shadowForm = document.getElementById('shadowForm');
    const toggleAuthBtn = document.getElementById('toggleAuth');

    // Auth State
    let isRegistering = false;

    // Achievement Definitions
    const achievements = {
        firstDonation: {
            id: 'firstDonation',
            title: 'First Light',
            description: 'Made your first donation',
            icon: '🌟'
        },
        rapidHelper: {
            id: 'rapidHelper',
            title: 'Rapid Helper',
            description: 'Made 3 donations in a single month',
            icon: '⚡'
        },
        consistentDonor: {
            id: 'consistentDonor',
            title: 'Consistent Shadow',
            description: 'Donated for 3 consecutive months',
            icon: '🌙'
        },
        majorImpact: {
            id: 'majorImpact',
            title: 'Major Impact',
            description: 'Total donations exceeded $1,000',
            icon: '💫'
        },
        communityHero: {
            id: 'communityHero',
            title: 'Community Hero',
            description: 'Helped 10 different people',
            icon: '👑'
        }
    };

    // Navigation Functions
    function showSection(sectionId) {
        Object.values(sections).forEach(section => {
            if (section) {
                section.classList.remove('active');
                section.classList.add('hidden');
            }
        });
        if (sections[sectionId]) {
            sections[sectionId].classList.remove('hidden');
            setTimeout(() => sections[sectionId].classList.add('active'), 10);
        }

        // Update navigation active state
        Object.values(navLinks).forEach(link => {
            if (link) link.classList.remove('active');
        });
        if (navLinks[sectionId]) navLinks[sectionId].classList.add('active');
    }

    // Auth Functions
    function updateAuthUI(user) {
        if (user) {
            if (sections.login) sections.login.classList.add('hidden');
            showSection('home');
            loadDonations();
        } else {
            showSection('login');
        }
    }

    // Toggle Auth Form UI
    function updateAuthFormUI() {
        const formTitle = authForm.querySelector('h2');
        const submitBtn = authForm.querySelector('button[type="submit"]');
        const nameField = document.getElementById('fullName')?.parentElement;
        const phoneField = document.getElementById('phone')?.parentElement;

        if (isRegistering) {
            formTitle.textContent = 'Create Account';
            submitBtn.textContent = 'Register';
            toggleAuthBtn.textContent = 'Already have an account? Sign in';

            // Add registration fields if they don't exist
            if (!nameField) {
                const nameDiv = document.createElement('div');
                nameDiv.className = 'form-group';
                nameDiv.innerHTML = '<input type="text" id="fullName" placeholder="Full Name" required>';
                authForm.insertBefore(nameDiv, authForm.firstChild);
            }

            if (!phoneField) {
                const phoneDiv = document.createElement('div');
                phoneDiv.className = 'form-group';
                phoneDiv.innerHTML = '<input type="tel" id="phone" placeholder="Phone Number" required>';
                authForm.insertBefore(phoneDiv, document.getElementById('email').parentElement);
            }
        } else {
            formTitle.textContent = 'Welcome to Shadow Creed';
            submitBtn.textContent = 'Sign In';
            toggleAuthBtn.textContent = 'Create Account';

            // Remove registration fields if they exist
            if (nameField) nameField.remove();
            if (phoneField) phoneField.remove();
        }
    }

    // Event Listeners
    toggleAuthBtn.addEventListener('click', () => {
        isRegistering = !isRegistering;
        updateAuthFormUI();
    });

    authForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const oath = document.getElementById('oath').checked;

        if (!oath) {
            alert('Please accept the oath to continue');
            return;
        }

        try {
            if (isRegistering) {
                const fullName = document.getElementById('fullName').value;
                const phone = document.getElementById('phone').value;
                
                // Create user account
                const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);
                
                // Save additional user info to database
                await firebase.database().ref(`users/${userCredential.user.uid}`).set({
                    fullName: fullName,
                    phone: phone,
                    email: email,
                    createdAt: Date.now()
                });
                
                alert('Account created successfully!');
            } else {
                await firebase.auth().signInWithEmailAndPassword(email, password);
            }
        } catch (error) {
            alert(error.message);
        }
    });

    // Navigation Event Listeners
    Object.entries(navLinks).forEach(([sectionId, link]) => {
        if (link) {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                showSection(sectionId);
            });
        }
    });

    // Firebase Auth Listener
    firebase.auth().onAuthStateChanged((user) => {
        updateAuthUI(user);
    });

    // Load Profile with Enhanced Features
    async function loadProfile() {
        const user = firebase.auth().currentUser;
        if (!user || !sections.profile) return;

        const profileCard = sections.profile.querySelector('.profile-card');
        const statsGrid = document.getElementById('profileStats');

        // Load user data
        const userRef = firebase.database().ref(`users/${user.uid}`);
        const shadowRef = firebase.database().ref(`shadows/${user.uid}`);
        const donationsRef = firebase.database().ref('donations');

        try {
            const [userSnapshot, shadowSnapshot] = await Promise.all([
                userRef.once('value'),
                shadowRef.once('value')
            ]);

            const userData = userSnapshot.val() || {};
            const shadowData = shadowSnapshot.val() || {};

            // Update profile info
            document.getElementById('profileName').textContent = userData.fullName || 'Anonymous Shadow';
            document.getElementById('profileEmail').textContent = userData.email || user.email;

            // Calculate statistics and achievements
            const donationsQuery = donationsRef.orderByChild('donorId').equalTo(user.uid);
            const donationsSnapshot = await donationsQuery.once('value');
            const donations = [];
            let totalDonated = 0;
            let peopleHelped = 0;

            donationsSnapshot.forEach(child => {
                const donation = child.val();
                donations.push(donation);
                totalDonated += Number(donation.amount);
                peopleHelped++;
            });

            // Update stats
            statsGrid.innerHTML = `
                <div class="stat-card">
                    <div class="stat-icon">💰</div>
                    <div class="stat-value">$${totalDonated.toLocaleString()}</div>
                    <div class="stat-label">Total Impact</div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">🤝</div>
                    <div class="stat-value">${peopleHelped}</div>
                    <div class="stat-label">People Helped</div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">⭐</div>
                    <div class="stat-value">${donations.length}</div>
                    <div class="stat-label">Total Donations</div>
                </div>
            `;

            // Check and award achievements
            const userAchievements = [];
            
            if (donations.length >= 1) userAchievements.push(achievements.firstDonation);
            
            // Check for rapid helper (3 donations in a month)
            const monthlyDonations = donations.reduce((acc, donation) => {
                const month = new Date(donation.timestamp).toYYYYMM();
                acc[month] = (acc[month] || 0) + 1;
                return acc;
            }, {});
            
            if (Object.values(monthlyDonations).some(count => count >= 3)) {
                userAchievements.push(achievements.rapidHelper);
            }

            if (totalDonated >= 1000) userAchievements.push(achievements.majorImpact);
            if (peopleHelped >= 10) userAchievements.push(achievements.communityHero);

            // Display achievements
            const achievementsSection = document.createElement('div');
            achievementsSection.className = 'achievements-section';
            achievementsSection.innerHTML = `
                <h3>Your Achievements</h3>
                <div class="achievements-grid">
                    ${userAchievements.map(achievement => `
                        <div class="achievement-card" onclick="shareAchievement('${achievement.id}')">
                            <div class="achievement-icon">${achievement.icon}</div>
                            <div class="achievement-title">${achievement.title}</div>
                            <div class="achievement-desc">${achievement.description}</div>
                        </div>
                    `).join('')}
                </div>
            `;
            profileCard.appendChild(achievementsSection);

            // Add donation history
            const historySection = document.createElement('div');
            historySection.className = 'history-section';
            historySection.innerHTML = `
                <h3>Your Impact History</h3>
                <div class="timeline">
                    ${donations.sort((a, b) => b.timestamp - a.timestamp).map(donation => `
                        <div class="timeline-item">
                            <div class="timeline-icon">💝</div>
                            <div class="timeline-content">
                                <h4>Donated $${donation.amount}</h4>
                                <p>${donation.reason}</p>
                                <small>${new Date(donation.timestamp).toLocaleDateString()}</small>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
            profileCard.appendChild(historySection);

        } catch (error) {
            console.error('Error loading profile:', error);
        }
    }

    // Add social sharing functionality
    window.shareAchievement = function(achievementId) {
        const achievement = achievements[achievementId];
        const text = `I just earned the "${achievement.title}" achievement on Shadow Creed! ${achievement.description} 🎉`;
        
        if (navigator.share) {
            navigator.share({
                title: 'Shadow Creed Achievement',
                text: text,
                url: window.location.origin
            }).catch(console.error);
        } else {
            // Fallback to clipboard
            navigator.clipboard.writeText(text)
                .then(() => alert('Achievement copied to clipboard! Share it with your friends!'))
                .catch(console.error);
        }
    };

    // Helper function for date formatting
    Date.prototype.toYYYYMM = function() {
        return this.getFullYear() + '-' + String(this.getMonth() + 1).padStart(2, '0');
    };

    // Enhance donation cards with progress and impact
    function createDonationCard(donation) {
        const card = document.createElement('div');
        card.className = 'card donation-card';
        
        // Calculate progress percentage
        const received = donation.receivedAmount || 0;
        const needed = donation.amount;
        const progress = (received / needed) * 100;

        card.innerHTML = `
            <h3>${donation.name}</h3>
            <p><strong>Amount:</strong> $${donation.amount}</p>
            <p><strong>Reason:</strong> ${donation.reason}</p>
            <div class="donation-progress">
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${progress}%"></div>
                </div>
                <div class="progress-text">
                    $${received} raised of $${needed}
                </div>
            </div>
            <div class="impact-info">
                <div class="impact-stat">
                    <span class="impact-icon">👥</span>
                    <span class="impact-value">${donation.donorsCount || 0}</span>
                    <span class="impact-label">Donors</span>
                </div>
                <div class="impact-stat">
                    <span class="impact-icon">💕</span>
                    <span class="impact-value">${donation.sharesCount || 0}</span>
                    <span class="impact-label">Shares</span>
                </div>
            </div>
            ${donation.status === 'pending' ? `
                <div class="card-actions">
                    <button onclick="handleDonate('${donation.id}')" class="btn btn-primary">Donate Now</button>
                    <button onclick="shareRequest('${donation.id}')" class="btn btn-secondary">Share</button>
                </div>
            ` : ''}
            <div class="status-badge status-${donation.status || 'pending'}">${donation.status || 'pending'}</div>
        `;
        return card;
    }

    // Update loadDonations function to use enhanced card
    function loadDonations() {
        const donationsGrid = document.getElementById('donationsGrid');
        if (!donationsGrid) return;

        const donationsRef = firebase.database().ref('donations');
        donationsRef.on('value', (snapshot) => {
            donationsGrid.innerHTML = '';
            if (!snapshot.exists()) {
                donationsGrid.innerHTML = '<p>No donation requests found.</p>';
                return;
            }

            snapshot.forEach((child) => {
                const donation = { ...child.val(), id: child.key };
                const card = createDonationCard(donation);
                donationsGrid.appendChild(card);
            });
        });
    }

    // Handle donation sharing
    window.shareRequest = function(requestId) {
        const donationCard = document.querySelector(`[data-request-id="${requestId}"]`);
        const donation = donationCard.donation;
        
        const text = `Help needed: ${donation.name} needs $${donation.amount} for ${donation.reason}. Join me in making a difference!`;
        
        if (navigator.share) {
            navigator.share({
                title: 'Shadow Creed - Help Someone in Need',
                text: text,
                url: `${window.location.origin}/donate/${requestId}`
            }).catch(console.error);
        } else {
            navigator.clipboard.writeText(text)
                .then(() => alert('Request copied to clipboard! Share it with your friends!'))
                .catch(console.error);
        }
    };

    // Handle Forms
    if (requestForm) {
        requestForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const user = firebase.auth().currentUser;
            if (!user) {
                alert('Please sign in to create a request');
                return;
            }

            try {
                await firebase.database().ref('donations').push({
                    userId: user.uid,
                    name: document.getElementById('name').value,
                    amount: document.getElementById('amount').value,
                    reason: document.getElementById('reason').value,
                    accountNumber: document.getElementById('accountNumber').value,
                    address: document.getElementById('address').value,
                    status: 'pending',
                    timestamp: Date.now()
                });

                alert('Request submitted successfully!');
                requestForm.reset();
                showSection('home');
            } catch (error) {
                alert(error.message);
            }
        });
    }

    if (shadowForm) {
        shadowForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const user = firebase.auth().currentUser;
            if (!user) {
                alert('Please sign in to become a shadow');
                return;
            }

            try {
                await firebase.database().ref(`shadows/${user.uid}`).set({
                    name: document.getElementById('donorName').value,
                    phone: document.getElementById('phone').value,
                    motivation: document.getElementById('motivation').value,
                    status: 'pending',
                    timestamp: Date.now()
                });

                alert('Shadow registration submitted successfully!');
                shadowForm.reset();
                showSection('home');
            } catch (error) {
                alert(error.message);
            }
        });
    }

    // Initialize profile when showing profile section
    Object.entries(navLinks).forEach(([sectionId, link]) => {
        if (link) {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                showSection(sectionId);
                if (sectionId === 'profile') {
                    loadProfile();
                }
            });
        }
    });
}); 