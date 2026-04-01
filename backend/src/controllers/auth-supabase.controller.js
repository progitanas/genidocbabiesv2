const { supabase, supabaseAdmin } = require('../db-supabase');
const jwt = require('jsonwebtoken');
const { normalizeRole } = require('../utils/role');

function signToken(user) {
  const secret = process.env.JWT_SECRET || 'genidoc-secret-key-2024';
  return jwt.sign(
    { user_id: user.genidoc_user_id, role: user.role, email: user.email },
    secret,
    { expiresIn: process.env.JWT_EXPIRES || '7d' }
  );
}

async function signup(req, res) {
  try {
    const {
      genidoc_nom,
      genidoc_prenom,
      genidoc_email,
      genidoc_password,
      genidoc_confirm_password,
      genidoc_role,
      org_code,
    } = req.body;

    if (!genidoc_nom || !genidoc_prenom || !genidoc_email || !genidoc_password || !genidoc_confirm_password || !genidoc_role) {
      return res.status(400).json({ message: 'Tous les champs sont obligatoires' });
    }

    if (genidoc_password !== genidoc_confirm_password) {
      return res.status(400).json({ message: 'Mots de passe ne correspondent pas' });
    }

    const role = normalizeRole(genidoc_role);
    if (!role) return res.status(400).json({ message: 'Rôle invalide' });

    // Check if organization exists (except for ADMIN)
    if (role !== 'ADMIN') {
      const { data: orgs } = await supabase
        .from('genidoc_organisation')
        .select('genidoc_org_id')
        .limit(1);

      if (!orgs || orgs.length === 0) {
        return res.status(400).json({ message: 'Aucune organisation. Crée d\'abord un compte ADMIN.' });
      }

      // If org_code provided, verify it exists
      if (org_code) {
        const { data: org } = await supabase
          .from('genidoc_organisation')
          .select('genidoc_org_id')
          .eq('org_code', org_code)
          .single();

        if (!org) {
          return res.status(400).json({ message: 'Code organisation invalide' });
        }
      }
    }

    // Check if email already exists
    const { data: existing } = await supabase
      .from('genidoc_auth_users')
      .select('genidoc_user_id')
      .eq('email', genidoc_email)
      .single();

    if (existing) {
      return res.status(400).json({ message: 'Cet email est déjà utilisé' });
    }

    // Hash password
    const bcrypt = require('bcryptjs');
    const password_hash = await bcrypt.hash(genidoc_password, 10);

    // Insert user
    const { data: user, error: userError } = await supabase
      .from('genidoc_auth_users')
      .insert([
        {
          nom: genidoc_nom,
          prenom: genidoc_prenom,
          email: genidoc_email,
          password_hash,
          role,
        },
      ])
      .select()
      .single();

    if (userError) {
      console.error('Supabase createUser error:', userError);
      return res.status(500).json({ message: 'Erreur création utilisateur', error: userError.message });
    }

    // Initialize onboarding
    const { error: onboardingError } = await supabase
      .from('genidoc_onboarding')
      .insert([{ genidoc_user_id: user.genidoc_user_id, role, current_step: 1 }]);

    if (onboardingError) {
      console.error('Onboarding creation error:', onboardingError);
    }

    // Assign organization if not ADMIN
    if (role !== 'ADMIN' && org_code) {
      const { data: org } = await supabase
        .from('genidoc_organisation')
        .select('genidoc_org_id')
        .eq('org_code', org_code)
        .single();

      if (org) {
        await supabase
          .from('genidoc_user_organisation')
          .insert([{ genidoc_user_id: user.genidoc_user_id, genidoc_org_id: org.genidoc_org_id }]);
      }
    }

    const token = signToken(user);
    res.status(201).json({
      message: 'Inscription réussie',
      token,
      user: { genidoc_user_id: user.genidoc_user_id, role: user.role, email: user.email },
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
}

async function login(req, res) {
  try {
    const { genidoc_email, genidoc_password } = req.body;

    if (!genidoc_email || !genidoc_password) {
      return res.status(400).json({ message: 'Email et mot de passe requis' });
    }

    // Fetch user
    const { data: user, error } = await supabase
      .from('genidoc_auth_users')
      .select('*')
      .eq('email', genidoc_email)
      .single();

    if (error || !user) {
      return res.status(401).json({ message: 'Email ou mot de passe invalide' });
    }

    // Verify password
    const bcrypt = require('bcryptjs');
    const isValidPassword = await bcrypt.compare(genidoc_password, user.password_hash);

    if (!isValidPassword) {
      return res.status(401).json({ message: 'Email ou mot de passe invalide' });
    }

    const token = signToken(user);
    res.json({
      message: 'Connexion réussie',
      token,
      user: { genidoc_user_id: user.genidoc_user_id, role: user.role, email: user.email },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
}

async function getProfile(req, res) {
  try {
    const userId = req.user.user_id;

    const { data: user, error } = await supabase
      .from('genidoc_auth_users')
      .select('*')
      .eq('genidoc_user_id', userId)
      .single();

    if (error) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
}

module.exports = {
  signup,
  login,
  getProfile,
  signToken,
};
