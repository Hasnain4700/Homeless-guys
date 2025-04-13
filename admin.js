// DOM Elements
const loginSection = document.getElementById('loginSection');
const requestsSection = document.getElementById('requestsSection');
const adminAuthForm = document.getElementById('adminAuthForm');
const requestsGrid = document.getElementById('requestsGrid');
const sectionTitle = document.getElementById('sectionTitle');
const authTitle = document.getElementById('authTitle');
const authSubmitBtn = document.getElementById('authSubmitBtn');
const toggleAuthBtn = document.getElementById('toggleAuth');
const nameField = document.getElementById('nameField');
const adminKeyField = document.getElementById('adminKeyField');

// Navigation Links
const pendingLink = document.getElementById('pendingLink');
const approvedLink = document.getElementById('approvedLink');
const rejectedLink = document.getElementById('rejectedLink');
const logoutLink = document.getElementById('logoutLink');

// Current View State
let currentStatus = 'pending';
let isRegistering = false;

// Admin credentials and secret key
const ADMIN_EMAIL = 'admin@shadowcreed.com';
const ADMIN_PASSWORD = 'Admin@123';
const ADMIN_SECRET_KEY = 'ShadowCreed2024'; // This is the secret key needed to create new admin accounts

// Toggle between login and registration
toggleAuthBtn.addEventListener('click', () => {
    isRegistering = !isRegistering;
    nameField.style.display = isRegistering ? 'block' : 'none';
    adminKeyField.style.display = isRegistering ? 'block' : 'none';
    authTitle.textContent = isRegistering ? 'Create Admin Account' : 'Admin Login';
    authSubmitBtn.textContent = isRegistering ? 'Register' : 'Login';
    toggleAuthBtn.textContent = isRegistering ? 'Back to Login' : 'Create Admin Account';
});

// Admin Login/Register Handler
adminAuthForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        if (isRegistering) {
            const adminName = document.getElementById('adminName').value;
            const adminKey = document.getElementById('adminKey').value;

            // Verify admin secret key
            if (adminKey !== ADMIN_SECRET_KEY) {
                throw new Error('Invalid admin secret key');
            }

            // Create new admin account
            const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);
            
            // Set admin privileges and details in database
            await firebase.database().ref(`admins/${userCredential.user.uid}`).set({
                name: adminName,
                email: email,
                role: 'admin',
                createdAt: Date.now()
            });

            alert('Admin account created successfully!');
        } else {
            await firebase.auth().signInWithEmailAndPassword(email, password);
        }
    } catch (error) {
        alert(error.message);
    }
});

// Auth State Change Handler
firebase.auth().onAuthStateChanged(async (user) => {
    if (user) {
        const adminRef = firebase.database().ref(`admins/${user.uid}`);
        const snapshot = await adminRef.once('value');
        if (snapshot.exists()) {
            loginSection.classList.add('hidden');
            requestsSection.classList.remove('hidden');
            loadRequests(currentStatus);
        } else {
            alert('You do not have admin privileges');
            firebase.auth().signOut();
        }
    } else {
        loginSection.classList.remove('hidden');
        requestsSection.classList.add('hidden');
    }
});

// Load Requests Based on Status
function loadRequests(status) {
    currentStatus = status;
    sectionTitle.textContent = `${status.charAt(0).toUpperCase() + status.slice(1)} Donation Requests`;
    
    const donationsRef = firebase.database().ref('donations');
    donationsRef.orderByChild('status').equalTo(status).on('value', (snapshot) => {
        requestsGrid.innerHTML = '';
        if (!snapshot.exists()) {
            requestsGrid.innerHTML = `<p>No ${status} requests found.</p>`;
            return;
        }

        snapshot.forEach((child) => {
            const request = child.val();
            const card = document.createElement('div');
            card.className = 'request-card';
            card.innerHTML = `
                <h3>${request.name}</h3>
                <p><strong>Reason:</strong> ${request.reason}</p>
                <p><strong>Amount:</strong> $${request.amount}</p>
                <p><strong>Account Number:</strong> ${request.accountNumber}</p>
                <p><strong>Address:</strong> ${request.address}</p>
                <p><strong>Date:</strong> ${new Date(request.timestamp).toLocaleDateString()}</p>
                <div class="status-badge status-${request.status}">${request.status}</div>
                ${status === 'pending' ? `
                    <div class="action-buttons">
                        <button class="btn btn-approve" onclick="handleRequest('${child.key}', 'approve')">
                            Approve
                        </button>
                        <button class="btn btn-reject" onclick="handleRequest('${child.key}', 'reject')">
                            Reject
                        </button>
                    </div>
                ` : ''}
            `;
            requestsGrid.appendChild(card);
        });
    });
}

// Handle Request Approval/Rejection
async function handleRequest(requestId, action) {
    try {
        const requestRef = firebase.database().ref(`donations/${requestId}`);
        await requestRef.update({
            status: action === 'approve' ? 'approved' : 'rejected',
            reviewedAt: Date.now(),
            reviewedBy: firebase.auth().currentUser.uid
        });
        alert(`Request ${action}d successfully`);
    } catch (error) {
        alert(`Error ${action}ing request: ${error.message}`);
    }
}

// Navigation Event Listeners
pendingLink.addEventListener('click', (e) => {
    e.preventDefault();
    loadRequests('pending');
});

approvedLink.addEventListener('click', (e) => {
    e.preventDefault();
    loadRequests('approved');
});

rejectedLink.addEventListener('click', (e) => {
    e.preventDefault();
    loadRequests('rejected');
});

logoutLink.addEventListener('click', (e) => {
    e.preventDefault();
    firebase.auth().signOut();
}); 