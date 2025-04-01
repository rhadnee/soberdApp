// This is a simplified Motoko backend for the application
// You would need to deploy this to the Internet Computer blockchain

import List "mo:base/List";
import Time "mo:base/Time";
import Principal "mo:base/Principal";
import HashMap "mo:base/HashMap";
import Text "mo:base/Text";
import Nat "mo:base/Nat";
import Int "mo:base/Int";
import Array "mo:base/Array";
import Iter "mo:base/Iter";

actor RecoveryPath {
    public type UserId = Principal;
    
    public type Reminder = {
        id: Nat;
        name: Text;
        time: Text;
        dosage: Text;
    };
    
    public type Appointment = {
        id: Nat;
        doctor: Text;
        time: Int; // Timestamp
        notes: Text;
    };
    
    public type ChatMessage = {
        id: Nat;
        sender: Text; // "user" or "bot"
        text: Text;
        timestamp: Int;
    };
    
    public type UserData = {
        username: Text;
        daysSober: Nat;
        chatSessions: Nat;
        reminders: [Reminder];
        appointments: [Appointment];
        chatHistory: [ChatMessage];
    };
    
    private var users = HashMap.HashMap<UserId, UserData>(0, Principal.equal, Principal.hash);
    private var nextId: Nat = 1;
    
    // User management
    public shared(msg) func createUser(username: Text) : async () {
        let userId = msg.caller;
        if (not HashMap.has(users, userId)) {
            let newUser: UserData = {
                username = username;
                daysSober = 0;
                chatSessions = 0;
                reminders = [];
                appointments = [];
                chatHistory = [];
            };
            users.put(userId, newUser);
        };
    };
    
    public shared query(msg) func getUserData() : async ?UserData {
        users.get(msg.caller);
    };
    
    // Reminder functions
    public shared(msg) func addReminder(name: Text, time: Text, dosage: Text) : async Nat {
        let userId = msg.caller;
        switch (users.get(userId)) {
            case null { throw Error.reject("User not found"); };
            case (?userData) {
                let newReminder: Reminder = {
                    id = nextId;
                    name = name;
                    time = time;
                    dosage = dosage;
                };
                nextId += 1;
                
                let updatedReminders = Array.append(userData.reminders, [newReminder]);
                let updatedUser: UserData = {
                    username = userData.username;
                    daysSober = userData.daysSober;
                    chatSessions = userData.chatSessions;
                    reminders = updatedReminders;
                    appointments = userData.appointments;
                    chatHistory = userData.chatHistory;
                };
                users.put(userId, updatedUser);
                return newReminder.id;
            };
        };
    };
    
    public shared(msg) func deleteReminder(id: Nat) : async () {
        let userId = msg.caller;
        switch (users.get(userId)) {
            case null { throw Error.reject("User not found"); };
            case (?userData) {
                let updatedReminders = Array.filter<Reminder>(userData.reminders, func (r) { r.id != id });
                let updatedUser: UserData = {
                    username = userData.username;
                    daysSober = userData.daysSober;
                    chatSessions = userData.chatSessions;
                    reminders = updatedReminders;
                    appointments = userData.appointments;
                    chatHistory = userData.chatHistory;
                };
                users.put(userId, updatedUser);
            };
        };
    };
    
    // Appointment functions
    public shared(msg) func addAppointment(doctor: Text, time: Int, notes: Text) : async Nat {
        let userId = msg.caller;
        switch (users.get(userId)) {
            case null { throw Error.reject("User not found"); };
            case (?userData) {
                let newAppointment: Appointment = {
                    id = nextId;
                    doctor = doctor;
                    time = time;
                    notes = notes;
                };
                nextId += 1;
                
                let updatedAppointments = Array.append(userData.appointments, [newAppointment]);
                let updatedUser: UserData = {
                    username = userData.username;
                    daysSober = userData.daysSober;
                    chatSessions = userData.chatSessions;
                    reminders = userData.reminders;
                    appointments = updatedAppointments;
                    chatHistory = userData.chatHistory;
                };
                users.put(userId, updatedUser);
                return newAppointment.id;
            };
        };
    };
    
    public shared(msg) func deleteAppointment(id: Nat) : async () {
        let userId = msg.caller;
        switch (users.get(userId)) {
            case null { throw Error.reject("User not found"); };
            case (?userData) {
                let updatedAppointments = Array.filter<Appointment>(userData.appointments, func (a) { a.id != id });
                let updatedUser: UserData = {
                    username = userData.username;
                    daysSober = userData.daysSober;
                    chatSessions = userData.chatSessions;
                    reminders = userData.reminders;
                    appointments = updatedAppointments;
                    chatHistory = userData.chatHistory;
                };
                users.put(userId, updatedUser);
            };
        };
    };
    
    // Chat functions
    public shared(msg) func addChatMessage(text: Text, isUser: Bool) : async Nat {
        let userId = msg.caller;
        switch (users.get(userId)) {
            case null { throw Error.reject("User not found"); };
            case (?userData) {
                let newMessage: ChatMessage = {
                    id = nextId;
                    sender = if isUser then "user" else "bot";
                    text = text;
                    timestamp = Time.now();
                };
                nextId += 1;
                
                let updatedChatHistory = Array.append(userData.chatHistory, [newMessage]);
                let updatedUser: UserData = {
                    username = userData.username;
                    daysSober = userData.daysSober;
                    chatSessions = userData.chatSessions + 1;
                    reminders = userData.reminders;
                    appointments = userData.appointments;
                    chatHistory = updatedChatHistory;
                };
                users.put(userId, updatedUser);
                return newMessage.id;
            };
        };
    };
    
    public shared(msg) func getBotResponse(userMessage: Text) : async Text {
        // In a real implementation, this would use more sophisticated NLP
        // For now, we'll return simple responses based on keywords
        
        if (Text.contains(userMessage, #text "craving") or Text.contains(userMessage, #text "want to use")) {
            return "I understand you're having cravings right now. This is normal in recovery. Try distracting yourself with a healthy activity or calling your sponsor. The craving will pass.";
        } else if (Text.contains(userMessage, #text "sad") or Text.contains(userMessage, #text "depressed")) {
            return "I'm sorry you're feeling this way. Remember that emotions are temporary, even when they feel overwhelming. Have you tried any of the coping strategies we discussed?";
        } else if (Text.contains(userMessage, #text "happy") or Text.contains(userMessage, #text "good")) {
            return "That's wonderful to hear! Celebrating these positive moments is important in recovery. What do you think contributed to feeling this way today?";
        } else if (Text.contains(userMessage, #text "relapse") or Text.contains(userMessage, #text "slipped")) {
            // Reset days sober
            let userId = msg.caller;
            switch (users.get(userId)) {
                case null { throw Error.reject("User not found"); };
                case (?userData) {
                    let updatedUser: UserData = {
                        username = userData.username;
                        daysSober = 0;
                        chatSessions = userData.chatSessions;
                        reminders = userData.reminders;
                        appointments = userData.appointments;
                        chatHistory = userData.chatHistory;
                    };
                    users.put(userId, updatedUser);
                };
            };
            return "Recovery is a journey with ups and downs. What matters most is that you're reaching out now. Let's talk about what happened and how to move forward.";
        } else {
            let genericResponses = [
                "Thank you for sharing that with me. How does that make you feel?",
                "I hear you. Recovery isn't easy, but you're doing important work.",
                "Let's explore that feeling more. What do you think triggered this?",
                "Remember your reasons for choosing recovery when things get tough.",
                "You're not alone in this. Many people have felt this way and found their path forward."
            ];
            return genericResponses[Int.abs(Time.now() % 5)];
        };
    };
    
    // Progress tracking
    public shared(msg) func incrementDaysSober() : async Nat {
        let userId = msg.caller;
        switch (users.get(userId)) {
            case null { throw Error.reject("User not found"); };
            case (?userData) {
                let newDays = userData.daysSober + 1;
                let updatedUser: UserData = {
                    username = userData.username;
                    daysSober = newDays;
                    chatSessions = userData.chatSessions;
                    reminders = userData.reminders;
                    appointments = userData.appointments;
                    chatHistory = userData.chatHistory;
                };
                users.put(userId, updatedUser);
                return newDays;
            };
        };
    };
};