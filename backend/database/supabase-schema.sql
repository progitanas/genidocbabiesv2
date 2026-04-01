-- Supabase Migration: SQLite → PostgreSQL
-- This schema will be applied to your Supabase PostgreSQL database

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- genidoc_auth_users table
CREATE TABLE IF NOT EXISTS genidoc_auth_users (
  genidoc_user_id BIGSERIAL PRIMARY KEY,
  nom TEXT NOT NULL,
  prenom TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('ADMIN', 'PEDIATRE', 'TUTEUR', 'ORGANISATION_ADMIN')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- genidoc_enfant table
CREATE TABLE IF NOT EXISTS genidoc_enfant (
  genidoc_enfant_id BIGSERIAL PRIMARY KEY,
  nom TEXT NOT NULL,
  prenom TEXT NOT NULL,
  date_naissance TEXT NOT NULL,
  sexe TEXT NOT NULL CHECK (sexe IN ('M', 'F')),
  groupe_sanguin TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- genidoc_organisation table
CREATE TABLE IF NOT EXISTS genidoc_organisation (
  genidoc_org_id BIGSERIAL PRIMARY KEY,
  org_nom TEXT NOT NULL,
  org_type TEXT NOT NULL,
  org_ville TEXT NOT NULL,
  org_adresse TEXT,
  org_telephone TEXT,
  org_email TEXT,
  org_code TEXT NOT NULL UNIQUE,
  created_by_user_id BIGINT NOT NULL REFERENCES genidoc_auth_users(genidoc_user_id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- genidoc_organisation_settings table
CREATE TABLE IF NOT EXISTS genidoc_organisation_settings (
  genidoc_org_id BIGINT PRIMARY KEY REFERENCES genidoc_organisation(genidoc_org_id) ON DELETE CASCADE,
  validation_mode TEXT NOT NULL DEFAULT 'OBLIGATOIRE',
  domaines_email TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- genidoc_user_organisation table
CREATE TABLE IF NOT EXISTS genidoc_user_organisation (
  genidoc_user_id BIGINT PRIMARY KEY REFERENCES genidoc_auth_users(genidoc_user_id) ON DELETE CASCADE,
  genidoc_org_id BIGINT NOT NULL REFERENCES genidoc_organisation(genidoc_org_id),
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'PENDING')),
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- genidoc_onboarding table
CREATE TABLE IF NOT EXISTS genidoc_onboarding (
  genidoc_user_id BIGINT PRIMARY KEY REFERENCES genidoc_auth_users(genidoc_user_id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  current_step INTEGER NOT NULL DEFAULT 1,
  is_completed INTEGER NOT NULL DEFAULT 0,
  completed_at TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- genidoc_pediatre_profile table
CREATE TABLE IF NOT EXISTS genidoc_pediatre_profile (
  genidoc_user_id BIGINT PRIMARY KEY REFERENCES genidoc_auth_users(genidoc_user_id) ON DELETE CASCADE,
  numero_ordre TEXT,
  telephone_pro TEXT,
  specialite TEXT,
  type_structure TEXT,
  nom_structure TEXT,
  ville TEXT,
  email_pro TEXT,
  adresse TEXT,
  validation_status TEXT NOT NULL DEFAULT 'PENDING' CHECK (validation_status IN ('PENDING', 'APPROVED', 'REJECTED')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- genidoc_tuteur_profile table
CREATE TABLE IF NOT EXISTS genidoc_tuteur_profile (
  genidoc_user_id BIGINT PRIMARY KEY REFERENCES genidoc_auth_users(genidoc_user_id) ON DELETE CASCADE,
  telephone_perso TEXT,
  lien_parentale TEXT,
  adresse TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- genidoc_pediatre_enfant table (mapping)
CREATE TABLE IF NOT EXISTS genidoc_pediatre_enfant (
  genidoc_user_id BIGINT REFERENCES genidoc_auth_users(genidoc_user_id),
  genidoc_enfant_id BIGINT REFERENCES genidoc_enfant(genidoc_enfant_id),
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (genidoc_user_id, genidoc_enfant_id)
);

-- genidoc_vaccination_enfant table
CREATE TABLE IF NOT EXISTS genidoc_vaccination_enfant (
  genidoc_vaccination_id BIGSERIAL PRIMARY KEY,
  genidoc_enfant_id BIGINT REFERENCES genidoc_enfant(genidoc_enfant_id),
  nom_vaccin TEXT NOT NULL,
  date_vaccination TEXT NOT NULL,
  prochain_rappel TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- genidoc_consultation table
CREATE TABLE IF NOT EXISTS genidoc_consultation (
  genidoc_consultation_id BIGSERIAL PRIMARY KEY,
  genidoc_enfant_id BIGINT REFERENCES genidoc_enfant(genidoc_enfant_id),
  genidoc_user_id BIGINT REFERENCES genidoc_auth_users(genidoc_user_id),
  date_consultation TEXT NOT NULL,
  motif TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- genidoc_vital_enfant table
CREATE TABLE IF NOT EXISTS genidoc_vital_enfant (
  genidoc_vital_id BIGSERIAL PRIMARY KEY,
  genidoc_enfant_id BIGINT REFERENCES genidoc_enfant(genidoc_enfant_id),
  poids DECIMAL(5,2),
  taille DECIMAL(5,2),
  temperature DECIMAL(5,2),
  tension TEXT,
  date_mesure TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_genidoc_auth_users_email ON genidoc_auth_users(email);
CREATE INDEX IF NOT EXISTS idx_genidoc_organisation_org_code ON genidoc_organisation(org_code);
CREATE INDEX IF NOT EXISTS idx_genidoc_user_organisation_org ON genidoc_user_organisation(genidoc_org_id);
CREATE INDEX IF NOT EXISTS idx_genidoc_enfant ON genidoc_enfant(genidoc_enfant_id);
CREATE INDEX IF NOT EXISTS idx_genidoc_pediatre_enfant ON genidoc_pediatre_enfant(genidoc_user_id, genidoc_enfant_id);

-- Row Level Security (RLS) - Optional but recommended
ALTER TABLE genidoc_auth_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE genidoc_organisation ENABLE ROW LEVEL SECURITY;
ALTER TABLE genidoc_user_organisation ENABLE ROW LEVEL SECURITY;

-- RLS Policy examples (customize as needed)
-- Users can see their own profile
CREATE POLICY "Users can view their own profile"
  ON genidoc_auth_users
  FOR SELECT
  USING (genidoc_user_id = auth.uid()::bigint OR auth.jwt() ->> 'role' = 'ADMIN');

CREATE POLICY "Users can update their own profile"
  ON genidoc_auth_users
  FOR UPDATE
  USING (genidoc_user_id = auth.uid()::bigint);
