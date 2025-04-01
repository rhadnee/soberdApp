// Main application logic
document.addEventListener('DOMContentLoaded', async () => {
    // UI Elements
    const loginBtn = document.getElementById('login-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const userInfo = document.getElementById('user-info');
    const usernameSpan = document.getElementById('username');
    const appContent = document.getElementById('app-content');
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    // Chat elements
    const chatMessages = document.getElementById('chat-messages');
    const userMessageInput = document.getElementById('user-message');
    const sendBtn = document.getElementById('send-btn');
    
    // Reminder elements
    const remindersList = document.getElementById('reminders-list');
    const addReminderForm = document.getElementById('add-reminder-form');
    
    // Appointment elements
    const appointmentsList = document.getElementById('appointments-list');
    const addAppointmentForm = document.getElementById('add-appointment-form');
    
    // Progress elements
    const daysSoberEl = document.getElementById('days-sober');
    const chatSessionsEl = document.getElementById('chat-sessions');
    
    // State
    let currentUser = null;
    let daysSober = 0;
    let chatSessions = 0;
    
    // Initialize Internet Identity
    const identityProvider = `http://localhost:4943?canisterId=be2us-64aaa-aaaaa-qaabq-cai`;
    
    // Check for existing auth
    checkAuth();
    
    // Event listeners
    loginBtn.addEventListener('click', login);
    logoutBtn.addEventListener('click', logout);
    sendBtn.addEventListener('click', sendMessage);
    userMessageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    
    addReminderForm.addEventListener('submit', addReminder);
    addAppointmentForm.addEventListener('submit', addAppointment);
    
    // Tab switching
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabId = button.getAttribute('data-tab');
            switchTab(tabId);
        });
    });
    
    // Initialize charts
    let progressChart;
    initChart();
    
    // Functions
    async function checkAuth() {
        // In a real app, you would check Internet Identity auth here
        // For demo, we'll use localStorage
        const storedUser = localStorage.getItem('recoveryPathUser');
        if (storedUser) {
            currentUser = JSON.parse(storedUser);
            showAppContent();
        }
    }
    
    async function login() {
        // In a real app, this would use Internet Identity
        // For demo purposes, we'll simulate login
        currentUser = {
            principal: 'demo-principal-123',
            username: 'RecoveryUser'
        };
        
        localStorage.setItem('recoveryPathUser', JSON.stringify(currentUser));
        showAppContent();
        
        // Load user data from blockchain
        await loadUserData();
    }
    
    function logout() {
        currentUser = null;
        localStorage.removeItem('recoveryPathUser');
        hideAppContent();
    }
    
    function showAppContent() {
        loginBtn.classList.add('hidden');
        userInfo.classList.remove('hidden');
        appContent.classList.remove('hidden');
        usernameSpan.textContent = currentUser.username;
        
        // Load initial data
        loadReminders();
        loadAppointments();
    }
    
    function hideAppContent() {
        loginBtn.classList.remove('hidden');
        userInfo.classList.add('hidden');
        appContent.classList.add('hidden');
    }
    
    function switchTab(tabId) {
        // Update active tab button
        tabButtons.forEach(button => {
            button.classList.toggle('active', button.getAttribute('data-tab') === tabId);
        });
        
        // Update active tab content
        tabContents.forEach(content => {
            content.classList.toggle('active', content.id === `${tabId}-tab`);
        });
    }
    
    // Chat functions
    function sendMessage() {
        const message = userMessageInput.value.trim();
        if (!message) return;
        
        addMessage('user', message);
        userMessageInput.value = '';
        
        // Simulate bot response (in a real app, this would call Motoko backend)
        setTimeout(() => {
            const botResponse = generateBotResponse(message);
            addMessage('bot', botResponse);
            chatSessions++;
            chatSessionsEl.textContent = chatSessions;
            
            // Update chart
            updateChart();
        }, 1000);
    }
    
    function addMessage(sender, text) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('chat-message', `${sender}-message`);
        messageDiv.textContent = text;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    function generateBotResponse(userMessage) {
        // Simple response logic - in a real app, this would be more sophisticated
        const lowerMsg = userMessage.toLowerCase();
        
        if (lowerMsg.includes('craving') || lowerMsg.includes('want to use')) {
            return "I understand you're having cravings right now. This is normal in recovery. Try distracting yourself with a healthy activity or calling your sponsor. The craving will pass.";
        } else if (lowerMsg.includes('sad') || lowerMsg.includes('depressed')) {
            return "I'm sorry you're feeling this way. Remember that emotions are temporary, even when they feel overwhelming. Have you tried any of the coping strategies we discussed?";
        } else if (lowerMsg.includes('happy') || lowerMsg.includes('good')) {
            return "That's wonderful to hear! Celebrating these positive moments is important in recovery. What do you think contributed to feeling this way today?";
        } else if (lowerMsg.includes('relapse') || lowerMsg.includes('slipped')) {
            daysSober = 0;
            daysSoberEl.textContent = daysSober;
            return "Recovery is a journey with ups and downs. What matters most is that you're reaching out now. Let's talk about what happened and how to move forward.";
        } else {
            const genericResponses = [
                "Thank you for sharing that with me. How does that make you feel?",
                "I hear you. Recovery isn't easy, but you're doing important work.",
                "Let's explore that feeling more. What do you think triggered this?",
                "Remember your reasons for choosing recovery when things get tough.",
                "You're not alone in this. Many people have felt this way and found their path forward."
            ];
            return genericResponses[Math.floor(Math.random() * genericResponses.length)];
        }
    }
    
    // Reminder functions
    function loadReminders() {
        // In a real app, this would fetch from Motoko backend
        const demoReminders = [
            { id: 1, name: "Naltrexone", time: "08:00", dosage: "50mg" },
            { id: 2, name: "Buprenorphine", time: "20:00", dosage: "8mg" }
        ];
        
        remindersList.innerHTML = '';
        demoReminders.forEach(reminder => {
            addReminderToDOM(reminder);
        });
    }
    
    function addReminder(e) {
        e.preventDefault();
        
        const name = document.getElementById('med-name').value;
        const time = document.getElementById('med-time').value;
        const dosage = document.getElementById('med-dosage').value;
        
        // In a real app, this would call Motoko backend
        const newReminder = {
            id: Date.now(),
            name,
            time,
            dosage
        };
        
        addReminderToDOM(newReminder);
        addReminderForm.reset();
        
        // Set up notification
        scheduleNotification(newReminder);
    }
    
    function addReminderToDOM(reminder) {
        const reminderEl = document.createElement('div');
        reminderEl.className = 'reminder-item';
        reminderEl.innerHTML = `
            <div>
                <h3>${reminder.name}</h3>
                <p class="time">${reminder.time} - ${reminder.dosage}</p>
            </div>
            <button class="delete-btn" data-id="${reminder.id}">Delete</button>
        `;
        remindersList.appendChild(reminderEl);
        
        // Add delete handler
        reminderEl.querySelector('.delete-btn').addEventListener('click', () => {
            // In a real app, this would call Motoko backend
            reminderEl.remove();
        });
    }
    
    function scheduleNotification(reminder) {
        // In a real app, this would use browser notifications API
        console.log(`Scheduled notification for ${reminder.name} at ${reminder.time}`);
    }
    
    // Appointment functions
    function loadAppointments() {
        // In a real app, this would fetch from Motoko backend
        const demoAppointments = [
            { 
                id: 1, 
                doctor: "Dr. Smith", 
                time: "2023-06-15T10:00", 
                notes: "Follow-up on medication" 
            }
        ];
        
        appointmentsList.innerHTML = '';
        demoAppointments.forEach(appointment => {
            addAppointmentToDOM(appointment);
        });
    }
    
    function addAppointment(e) {
        e.preventDefault();
        
        const doctor = document.getElementById('doctor-name').value;
        const time = document.getElementById('appointment-time').value;
        const notes = document.getElementById('appointment-notes').value;
        
        // In a real app, this would call Motoko backend
        const newAppointment = {
            id: Date.now(),
            doctor,
            time,
            notes
        };
        
        addAppointmentToDOM(newAppointment);
        addAppointmentForm.reset();
    }
    
    function addAppointmentToDOM(appointment) {
        const appointmentEl = document.createElement('div');
        appointmentEl.className = 'appointment-item';
        
        const formattedTime = new Date(appointment.time).toLocaleString();
        
        appointmentEl.innerHTML = `
            <div>
                <h3>${appointment.doctor}</h3>
                <p class="time">${formattedTime}</p>
                <p>${appointment.notes}</p>
            </div>
            <button class="delete-btn" data-id="${appointment.id}">Delete</button>
        `;
        appointmentsList.appendChild(appointmentEl);
        
        // Add delete handler
        appointmentEl.querySelector('.delete-btn').addEventListener('click', () => {
            // In a real app, this would call Motoko backend
            appointmentEl.remove();
        });
    }
    
    // Progress functions
    function initChart() {
        const ctx = document.getElementById('progress-chart').getContext('2d');
        progressChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
                datasets: [{
                    label: 'Cravings Intensity (1-10)',
                    data: [8, 6, 5, 4],
                    borderColor: 'rgb(75, 192, 192)',
                    tension: 0.1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 10
                    }
                }
            }
        });
    }
    
    function updateChart() {
        const newData = progressChart.data.datasets[0].data.map(value => {
            return Math.max(0, Math.min(10, value - 0.5 + (Math.random() - 0.3)));
        });
        
        progressChart.data.datasets[0].data = newData;
        progressChart.update();
        
        // Update days sober
        daysSober++;
        daysSoberEl.textContent = daysSober;
    }
    
    
    // Motoko interaction functions (placeholder)
    async function loadUserData() {
        // In a real implementation, this would call your Motoko backend
        console.log("Loading user data from blockchain...");
        
        // Simulate loading data
        daysSober = 7;
        chatSessions = 5;
        
        daysSoberEl.textContent = daysSober;
        chatSessionsEl.textContent = chatSessions;
    }
});

// This would be replaced with actual Motoko/Internet Identity integration
// For a real implementation, you would:
// 1. Set up the Internet Identity canister
// 2. Use @dfinity/auth-client for authentication
// 3. Create Motoko canisters to handle the backend logic
// 4. Use the agent-js library to interact with your canisters