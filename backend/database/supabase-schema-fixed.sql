-- Supabase Migration: Genidoc Schema (PostgreSQL)
-- Optimized for Supabase with UUID primary keys

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- genidoc_auth_users table
CREATE TABLE IF NOT EXISTS genidoc_auth_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  genidoc_user_id BIGSERIAL UNIQUE,
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
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  genidoc_enfant_id BIGSERIAL UNIQUE,
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
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  genidoc_org_id BIGSERIAL UNIQUE,
  org_nom TEXT NOT NULL,
  org_type TEXT NOT NULL,
  org_ville TEXT NOT NULL,
  org_adresse TEXT,
  org_telephone TEXT,
  org_email TEXT,
  org_code TEXT NOT NULL UNIQUE,
  created_by_user_id UUID NOT NULL REFERENCES genidoc_auth_users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- genidoc_organisation_settings table
CREATE TABLE IF NOT EXISTS genidoc_organisation_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  genidoc_org_id UUID NOT NULL UNIQUE REFERENCES genidoc_organisation(id) ON DELETE CASCADE,
  validation_mode TEXT NOT NULL DEFAULT 'OBLIGATOIRE',
  domaines_email TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- genidoc_user_organisation table
CREATE TABLE IF NOT EXISTS genidoc_user_organisation (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  genidoc_user_id UUID NOT NULL REFERENCES genidoc_auth_users(id) ON DELETE CASCADE,
  genidoc_org_id UUID NOT NULL REFERENCES genidoc_organisation(id),
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'PENDING')),
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(genidoc_user_id, genidoc_org_id)
);

-- genidoc_onboarding table
CREATE TABLE IF NOT EXISTS genidoc_onboarding (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  genidoc_user_id UUID NOT NULL UNIQUE REFERENCES genidoc_auth_users(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  current_step INTEGER NOT NULL DEFAULT 1,
  is_completed INTEGER NOT NULL DEFAULT 0,
  completed_at TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- genidoc_pediatre_profile table
CREATE TABLE IF NOT EXISTS genidoc_pediatre_profile (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  genidoc_user_id UUID NOT NULL UNIQUE REFERENCES genidoc_auth_users(id) ON DELETE CASCADE,
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
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  genidoc_user_id UUID NOT NULL UNIQUE REFERENCES genidoc_auth_users(id) ON DELETE CASCADE,
  telephone_perso TEXT,
  lien_parentale TEXT,
  adresse TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- genidoc_pediatre_enfant table (mapping)
CREATE TABLE IF NOT EXISTS genidoc_pediatre_enfant (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  genidoc_user_id UUID NOT NULL REFERENCES genidoc_auth_users(id),
  genidoc_enfant_id UUID NOT NULL REFERENCES genidoc_enfant(id),
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(genidoc_user_id, genidoc_enfant_id)
);

-- genidoc_vaccination_enfant table
CREATE TABLE IF NOT EXISTS genidoc_vaccination_enfant (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  genidoc_vaccination_id BIGSERIAL UNIQUE,
  genidoc_enfant_id UUID REFERENCES genidoc_enfant(id),
  nom_vaccin TEXT NOT NULL,
  date_vaccination TEXT NOT NULL,
  prochain_rappel TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- genidoc_consultation table
CREATE TABLE IF NOT EXISTS genidoc_consultation (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  genidoc_consultation_id BIGSERIAL UNIQUE,
  genidoc_enfant_id UUID REFERENCES genidoc_enfant(id),
  genidoc_user_id UUID REFERENCES genidoc_auth_users(id),
  date_consultation TEXT NOT NULL,
  motif TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- genidoc_vital_enfant table
CREATE TABLE IF NOT EXISTS genidoc_vital_enfant (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  genidoc_vital_id BIGSERIAL UNIQUE,
  genidoc_enfant_id UUID REFERENCES genidoc_enfant(id),
  poids DECIMAL(5,2),
  taille DECIMAL(5,2),
  temperature DECIMAL(5,2),
  tension TEXT,
  date_mesure TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_genidoc_auth_users_email ON genidoc_auth_users(email);
CREATE INDEX IF NOT EXISTS idx_genidoc_auth_users_genidoc_user_id ON genidoc_auth_users(genidoc_user_id);
CREATE INDEX IF NOT EXISTS idx_genidoc_organisation_org_code ON genidoc_organisation(org_code);
CREATE INDEX IF NOT EXISTS idx_genidoc_user_organisation_org ON genidoc_user_organisation(genidoc_org_id);
CREATE INDEX IF NOT EXISTS idx_genidoc_enfant_genidoc_enfant_id ON genidoc_enfant(genidoc_enfant_id);
CREATE INDEX IF NOT EXISTS idx_genidoc_pediatre_enfant ON genidoc_pediatre_enfant(genidoc_user_id, genidoc_enfant_id);

-- Row Level Security (RLS) - Enable for security
ALTER TABLE genidoc_auth_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE genidoc_organisation ENABLE ROW LEVEL SECURITY;
ALTER TABLE genidoc_user_organisation ENABLE ROW LEVEL SECURITY;
ALTER TABLE genidoc_pediatre_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE genidoc_tuteur_profile ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can see their own profile
CREATE POLICY "Users can view their own profile"
  ON genidoc_auth_users
  FOR SELECT
  USING (auth.uid() = id OR auth.jwt() ->> 'role' = 'ADMIN');

-- RLS Policy: Users can update their own profile
CREATE POLICY "Users can update their own profile"
  ON genidoc_auth_users
  FOR UPDATE
  USING (auth.uid() = id);

-- RLS Policy: Pediatres can see their patients
CREATE POLICY "Pediatres can see their patients"
  ON genidoc_pediatre_enfant
  FOR SELECT
  USING (auth.uid() = genidoc_user_id);

-- RLS Policy: Tuteurs can see their children
CREATE POLICY "Tuteurs can see their children"
  ON genidoc_enfant
  FOR SELECT
  USING (id IN (SELECT genidoc_enfant_id FROM genidoc_pediatre_enfant WHERE genidoc_user_id = auth.uid()));
