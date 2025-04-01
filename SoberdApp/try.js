// Main Application Script for RecoveryPath DApp
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
    let progressChart;
    
    // Initialize the application
    init();
    
    async function init() {
        try {
            // Initialize chart
            initChart();
            
            // Set up event listeners
            setupEventListeners();
            
            // Check for existing auth (simplified for demo)
            const storedUser = localStorage.getItem('recoveryPathUser');
            if (storedUser) {
                currentUser = JSON.parse(storedUser);
                showAppContent();
                await loadUserData();
            }
        } catch (error) {
            console.error("Initialization error:", error);
            alert("Failed to initialize the application. Please try again.");
        }
    }
    
    // Authentication Functions
    async function login() {
        // Simplified for demo - in real app use Internet Identity
        currentUser = {
            principal: 'demo-principal-123',
            username: 'RecoveryUser'
        };
        
        localStorage.setItem('recoveryPathUser', JSON.stringify(currentUser));
        showAppContent();
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
    }
    
    function hideAppContent() {
        loginBtn.classList.remove('hidden');
        userInfo.classList.add('hidden');
        appContent.classList.add('hidden');
    }
    
    // UI Functions
    function setupEventListeners() {
        loginBtn.addEventListener('click', login);
        logoutBtn.addEventListener('click', logout);
        sendBtn.addEventListener('click', sendMessage);
        
        userMessageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
        
        addReminderForm.addEventListener('submit', (e) => {
            e.preventDefault();
            addReminder();
        });
        
        addAppointmentForm.addEventListener('submit', (e) => {
            e.preventDefault();
            addAppointment();
        });
        
        // Tab switching
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const tabId = button.getAttribute('data-tab');
                switchTab(tabId);
            });
        });
    }
    
    function switchTab(tabId) {
        tabButtons.forEach(button => {
            button.classList.toggle('active', button.getAttribute('data-tab') === tabId);
        });
        
        tabContents.forEach(content => {
            content.classList.toggle('active', content.id === `${tabId}-tab`);
        });
    }
    
    // Chat Functions
    async function sendMessage() {
        const message = userMessageInput.value.trim();
        if (!message || !currentUser) return;
        
        // Add user message to UI
        addMessage('user', message);
        userMessageInput.value = '';
        
        // Simulate bot response
        setTimeout(() => {
            const botResponse = generateBotResponse(message);
            addMessage('bot', botResponse);
            chatSessions++;
            chatSessionsEl.textContent = chatSessions;
            
            // Update chart
            updateChart();
            
            // Check for relapse keywords
            if (message.toLowerCase().includes('relapse') || 
                message.toLowerCase().includes('slipped')) {
                daysSober = 0;
                daysSoberEl.textContent = daysSober;
            }
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
        const lowerMsg = userMessage.toLowerCase();
        
        if (lowerMsg.includes('craving') || lowerMsg.includes('want to use')) {
            return "I understand you're having cravings right now. This is normal in recovery. Try distracting yourself with a healthy activity or calling your sponsor. The craving will pass.";
        } else if (lowerMsg.includes('sad') || lowerMsg.includes('depressed')) {
            return "I'm sorry you're feeling this way. Remember that emotions are temporary, even when they feel overwhelming. Have you tried any of the coping strategies we discussed?";
        } else if (lowerMsg.includes('happy') || lowerMsg.includes('good')) {
            return "That's wonderful to hear! Celebrating these positive moments is important in recovery. What do you think contributed to feeling this way today?";
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
    
    // Reminder Functions
    async function loadReminders() {
        // Demo data - in real app fetch from backend
        const demoReminders = [
            { id: 1, name: "Naltrexone", time: "08:00", dosage: "50mg" },
            { id: 2, name: "Buprenorphine", time: "20:00", dosage: "8mg" }
        ];
        
        remindersList.innerHTML = '';
        demoReminders.forEach(reminder => {
            addReminderToDOM(reminder);
        });
    }
    
    async function addReminder() {
        const name = document.getElementById('med-name').value;
        const time = document.getElementById('med-time').value;
        const dosage = document.getElementById('med-dosage').value;
        
        if (!name || !time || !dosage) return;
        
        const newReminder = {
            id: Date.now(),
            name,
            time,
            dosage
        };
        
        addReminderToDOM(newReminder);
        addReminderForm.reset();
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
        
        reminderEl.querySelector('.delete-btn').addEventListener('click', () => {
            reminderEl.remove();
        });
    }
    
    function scheduleNotification(reminder) {
        console.log(`Scheduled notification for ${reminder.name} at ${reminder.time}`);
    }
    
    // Appointment Functions
    async function loadAppointments() {
        // Demo data - in real app fetch from backend
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
    
    async function addAppointment() {
        const doctor = document.getElementById('doctor-name').value;
        const time = document.getElementById('appointment-time').value;
        const notes = document.getElementById('appointment-notes').value;
        
        if (!doctor || !time) return;
        
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
        
        appointmentEl.querySelector('.delete-btn').addEventListener('click', () => {
            appointmentEl.remove();
        });
    }
    
    // Progress Tracking
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
    
    // Data Loading
    async function loadUserData() {
        // Demo data - in real app fetch from backend
        daysSober = 7;
        chatSessions = 5;
        
        daysSoberEl.textContent = daysSober;
        chatSessionsEl.textContent = chatSessions;
        
        await loadReminders();
        await loadAppointments();
    }
});