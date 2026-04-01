/**
 * 🔐 GeniDoc API Client - Production Ready
 *
 * Configuration centralisée pour tous les appels API
 * Points vers le backend Supabase déployé
 */

// ============================================
// CONFIGURATION - À METTRE À JOUR APRÈS DÉPLOIEMENT
// ============================================
// Update BACKEND_API_URL avec votre URL de déploiement
const BACKEND_API_URL = "https://backend-h79ptgxsa-progitanas-projects.vercel.app"; // Backend Vercel

// En développement local (uncomment si testé localement)
// const BACKEND_API_URL = window.location.hostname === 'localhost'
//   ? 'http://localhost:5000'
//   : 'https://genidoc-api.vercel.app';

const API_BASE = BACKEND_API_URL;

// ============================================
// UTILITY FUNCTIONS
// ============================================

async function apiFetch(endpoint, options = {}) {
  const token = localStorage.getItem("token");
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    if (
      !window.location.pathname.includes("/frontend/src/public/auth/login.html")
    ) {
      window.location.href = "/frontend/src/public/auth/login.html";
    }
  }

  let data;
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    data = await response.json();
  } else {
    const text = await response.text();
    data = { message: text || `Erreur ${response.status}` };
  }

  if (!response.ok) {
    throw new Error(data.message || "Une erreur est survenue");
  }
  return data;
}

// ============================================
// API OBJECT - All endpoints
// ============================================

const api = {
  // ========== AUTH ==========
  login: (email, password) =>
    apiFetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({
        genidoc_email: email,
        genidoc_password: password,
      }),
    }),

  signup: (userData) =>
    apiFetch("/api/auth/signup", {
      method: "POST",
      body: JSON.stringify(userData),
    }),

  getMe: () => apiFetch("/api/auth/profile"),

  // ========== ADMIN ==========
  admin: {
    step1: (data) =>
      apiFetch("/api/admin/onboarding/step1", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    step2: (formData) =>
      fetch(`${API_BASE}/api/admin/onboarding/step2`, {
        method: "POST",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        body: formData,
      }).then((r) => r.json()),
    step3: () => apiFetch("/api/admin/onboarding/step3", { method: "POST" }),
    getStats: () => apiFetch("/api/admin/dashboard/stats"),
    getPediatres: () => apiFetch("/api/admin/pediatres"),
    getPendingPediatres: () => apiFetch("/api/admin/pediatres/pending"),
    updatePediatreStatus: (id, status) =>
      apiFetch("/api/admin/pediatres/update-status", {
        method: "POST",
        body: JSON.stringify({ pediatre_id: id, status }),
      }),
    sendInvitation: (data) =>
      apiFetch("/api/admin/invitations/send", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    getInvitations: () => apiFetch("/api/admin/invitations"),
  },

  // ========== PEDIATRE ==========
  pediatre: {
    step1: (data) =>
      apiFetch("/api/pediatre/onboarding/step1", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    step2: (formData) =>
      fetch(`${API_BASE}/api/pediatre/onboarding/step2`, {
        method: "POST",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        body: formData,
      }).then((r) => r.json()),
    step3: () => apiFetch("/api/pediatre/onboarding/step3", { method: "POST" }),
    getPatients: () => apiFetch("/api/pediatre/patients"),
    getPatientDetails: (id) => apiFetch(`/api/pediatre/patients/${id}`),
    getGrowthData: (id) => apiFetch(`/api/pediatre/patients/${id}/growth`),
    getVaccinationSchedule: (id) =>
      apiFetch(`/api/pediatre/patients/${id}/schedule`),
    addVital: (data) =>
      apiFetch("/api/pediatre/patients/vitals", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    addConsultation: (data) =>
      apiFetch("/api/pediatre/patients/consultations", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    addVaccination: (data) =>
      apiFetch("/api/pediatre/patients/vaccinations", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    getVaccins: () => apiFetch("/api/pediatre/catalog/vaccins"),
  },

  // ========== TUTEUR ==========
  tuteur: {
    step1: (data) =>
      apiFetch("/api/tuteur/onboarding/step1", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    step2: (formData) =>
      fetch(`${API_BASE}/api/tuteur/onboarding/step2`, {
        method: "POST",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        body: formData,
      }).then((r) => r.json()),
    step3: () => apiFetch("/api/tuteur/onboarding/step3", { method: "POST" }),
    getEnfants: () => apiFetch("/api/tuteur/enfants"),
    getCarnet: (id) => apiFetch(`/api/tuteur/enfants/${id}/carnet`),
    getNotifications: () => apiFetch("/api/tuteur/notifications"),
    createUrgence: (data) =>
      apiFetch("/api/tuteur/urgences", {
        method: "POST",
        body: JSON.stringify(data),
      }),
  },
};

window.genidocApi = api;
window.API_BASE = API_BASE;

// ============================================
// PRODUCTION NOTES
// ============================================
//
// 1. Remplace BACKEND_API_URL avec l'URL réelle après déploiement
// 2. Les appels API utilisent automatiquement le token JWT depuis localStorage
// 3. En cas de 401, l'utilisateur est redirigé vers la page de login
// 4. Toutes les requêtes vont vers le backend Supabase (pas de local)
//
