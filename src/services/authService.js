import { useState, useEffect } from "react";

class AuthService {
  constructor() {
    this.users = JSON.parse(localStorage.getItem('zensales_users') || '[]');
    this.currentUser = JSON.parse(localStorage.getItem('zensales_current_user') || 'null');
    this.subscriptions = JSON.parse(localStorage.getItem('zensales_subscriptions') || '{}');
    this.nextUserId = Math.max(0, ...this.users.map(u => u.id)) + 1;
    this.listeners = [];
  }

  // Initialize auth state
  initialize() {
    this.notifyListeners();
  }

  // Subscribe to auth changes
  subscribe(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  // Notify all listeners
  notifyListeners() {
    const authState = {
      user: this.currentUser,
      subscription: this.currentUser ? this.subscriptions[this.currentUser.id] : null,
      loading: false
    };
    this.listeners.forEach(callback => callback(authState));
  }

  // Register new user
  async register(userData) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Check if email already exists
    if (this.users.find(u => u.email === userData.email)) {
      throw new Error('An account with this email already exists');
    }

    const newUser = {
      id: this.nextUserId++,
      ...userData,
      createdAt: new Date().toISOString()
    };

    this.users.push(newUser);
    localStorage.setItem('zensales_users', JSON.stringify(this.users));

    // Set as current user but without active subscription
    this.currentUser = newUser;
    localStorage.setItem('zensales_current_user', JSON.stringify(newUser));

    this.notifyListeners();
    return newUser;
  }

  // Login user
  async login(email, password) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const user = this.users.find(u => u.email === email);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    // In a real app, you'd verify the password hash
    this.currentUser = user;
    localStorage.setItem('zensales_current_user', JSON.stringify(user));

    this.notifyListeners();
    return user;
  }

  // Update user profile
  async updateProfile(profileData) {
    if (!this.currentUser) {
      throw new Error('Not authenticated');
    }

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Update user in users array
    const userIndex = this.users.findIndex(u => u.id === this.currentUser.id);
    if (userIndex === -1) {
      throw new Error('User not found');
    }

    this.users[userIndex] = { ...this.users[userIndex], ...profileData };
    this.currentUser = this.users[userIndex];

    localStorage.setItem('zensales_users', JSON.stringify(this.users));
    localStorage.setItem('zensales_current_user', JSON.stringify(this.currentUser));

    this.notifyListeners();
    return this.currentUser;
  }

  // Activate subscription
  activateSubscription(userId, subscriptionData) {
    this.subscriptions[userId] = {
      ...subscriptionData,
      active: true,
      createdAt: new Date().toISOString()
    };
    localStorage.setItem('zensales_subscriptions', JSON.stringify(this.subscriptions));
    this.notifyListeners();
  }

  // Deactivate subscription
  deactivateSubscription(userId) {
    if (this.subscriptions[userId]) {
      this.subscriptions[userId].active = false;
      localStorage.setItem('zensales_subscriptions', JSON.stringify(this.subscriptions));
      this.notifyListeners();
    }
  }

  // Logout
  logout() {
    this.currentUser = null;
    localStorage.removeItem('zensales_current_user');
    this.notifyListeners();
  }

  // Get current auth state
  getAuthState() {
    return {
      user: this.currentUser,
      subscription: this.currentUser ? this.subscriptions[this.currentUser.id] : null,
      loading: false
    };
  }

  // React hook for auth state
  useAuth() {
    const [authState, setAuthState] = useState(() => this.getAuthState());

    useEffect(() => {
      const unsubscribe = this.subscribe(setAuthState);
      return unsubscribe;
    }, []);

    return authState;
  }
}

export const authService = new AuthService();