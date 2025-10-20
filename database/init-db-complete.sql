-- ============================================================================
-- AZORA WORLD - COMPLETE DATABASE SCHEMA
-- Domain: azora.world
-- Purpose: Government, Enterprise, Education, Global Operations
-- Security Level: Nation-State Intelligence Grade
-- ============================================================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";
CREATE EXTENSION IF NOT EXISTS "btree_gist";
CREATE EXTENSION IF NOT EXISTS "tablefunc";

-- ============================================================================
-- IDENTITY & ACCESS MANAGEMENT
-- ============================================================================

CREATE TYPE user_type AS ENUM ('individual', 'student', 'business', 'enterprise', 'government', 'ngo', 'developer');
CREATE TYPE verification_status AS ENUM ('unverified', 'pending', 'verified', 'rejected', 'suspended');
CREATE TYPE security_clearance AS ENUM ('public', 'confidential', 'secret', 'top_secret', 'cosmic_top_secret');

CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    legal_name VARCHAR(255),
    type VARCHAR(50) NOT NULL,
    country_code CHAR(2) NOT NULL,
    tax_id VARCHAR(100),
    registration_number VARCHAR(100),
    industry VARCHAR(100),
    size VARCHAR(50),
    website VARCHAR(255),
    security_clearance security_clearance DEFAULT 'public',
    kyb_status verification_status DEFAULT 'unverified',
    kyb_data JSONB,
    billing_address JSONB,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP
);

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    email_verified BOOLEAN DEFAULT false,
    phone VARCHAR(50),
    phone_verified BOOLEAN DEFAULT false,
    username VARCHAR(100) UNIQUE,
    user_type user_type NOT NULL,
    organization_id UUID REFERENCES organizations(id),
    
    -- Personal Information (encrypted)
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    date_of_birth DATE,
    nationality CHAR(2),
    
    -- Identity Verification
    kyc_status verification_status DEFAULT 'unverified',
    kyc_level INTEGER DEFAULT 0,
    kyc_data JSONB,
    biometric_hash TEXT,
    
    -- Blockchain & Wallet
    wallet_address VARCHAR(42) UNIQUE,
    did_identifier TEXT UNIQUE,
    public_key TEXT,
    
    -- Financial
    azr_balance NUMERIC(20, 8) DEFAULT 0,
    total_earned NUMERIC(20, 8) DEFAULT 0,
    total_spent NUMERIC(20, 8) DEFAULT 0,
    
    -- Education (for students)
    student_id VARCHAR(100),
    institution VARCHAR(255),
    github_username VARCHAR(100),
    copilot_enrolled BOOLEAN DEFAULT false,
    learning_tier VARCHAR(50),
    
    -- Security
    security_clearance security_clearance DEFAULT 'public',
    two_factor_enabled BOOLEAN DEFAULT false,
    two_factor_method VARCHAR(50),
    password_hash TEXT,
    last_login TIMESTAMP,
    login_count INTEGER DEFAULT 0,
    failed_login_attempts INTEGER DEFAULT 0,
    account_locked BOOLEAN DEFAULT false,
    
    -- Preferences
    language CHAR(5) DEFAULT 'en',
    timezone VARCHAR(50),
    preferences JSONB,
    
    -- Metadata
    metadata JSONB,
    tags TEXT[],
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP,
    
    CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- ============================================================================
-- AZORA PAY - PAYMENT INFRASTRUCTURE
-- ============================================================================

CREATE TYPE payment_method AS ENUM ('azr', 'crypto', 'credit_card', 'debit_card', 'bank_transfer', 'swift', 'sepa', 'ach', 'wire', 'mobile_money');
CREATE TYPE payment_status AS ENUM ('pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded', 'disputed');
CREATE TYPE transaction_type AS ENUM ('payment', 'transfer', 'mint', 'burn', 'stake', 'reward', 'fee', 'refund');

CREATE TABLE payment_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    organization_id UUID REFERENCES organizations(id),
    account_type VARCHAR(50) NOT NULL,
    currency CHAR(3) NOT NULL,
    balance NUMERIC(20, 8) DEFAULT 0,
    available_balance NUMERIC(20, 8) DEFAULT 0,
    held_balance NUMERIC(20, 8) DEFAULT 0,
    account_number VARCHAR(100),
    routing_number VARCHAR(50),
    iban VARCHAR(34),
    swift_bic VARCHAR(11),
    bank_name VARCHAR(255),
    is_primary BOOLEAN DEFAULT false,
    is_verified BOOLEAN DEFAULT false,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_hash VARCHAR(66) UNIQUE,
    
    -- Parties
    from_user_id UUID REFERENCES users(id),
    to_user_id UUID REFERENCES users(id),
    from_account_id UUID REFERENCES payment_accounts(id),
    to_account_id UUID REFERENCES payment_accounts(id),
    
    -- Transaction Details
    type transaction_type NOT NULL,
    amount NUMERIC(20, 8) NOT NULL,
    currency CHAR(3) NOT NULL,
    fee NUMERIC(20, 8) DEFAULT 0,
    net_amount NUMERIC(20, 8),
    
    -- Payment Processing
    payment_method payment_method,
    payment_processor VARCHAR(100),
    processor_transaction_id VARCHAR(255),
    status payment_status DEFAULT 'pending',
    
    -- Smart Contract
    contract_address VARCHAR(42),
    block_number BIGINT,
    gas_used BIGINT,
    
    -- Metadata
    description TEXT,
    reference VARCHAR(255),
    category VARCHAR(100),
    tags TEXT[],
    metadata JSONB,
    
    -- Risk & Compliance
    risk_score NUMERIC(5, 2),
    aml_flagged BOOLEAN DEFAULT false,
    fraud_score NUMERIC(5, 2),
    
    -- Timestamps
    initiated_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP,
    failed_at TIMESTAMP,
    
    -- Audit
    created_by UUID REFERENCES users(id),
    ip_address INET,
    user_agent TEXT
);

CREATE TABLE payment_methods_stored (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    type payment_method NOT NULL,
    
    -- Card Details (encrypted)
    card_last_four CHAR(4),
    card_brand VARCHAR(50),
    card_exp_month INTEGER,
    card_exp_year INTEGER,
    card_holder_name VARCHAR(255),
    
    -- Bank Details (encrypted)
    bank_account_last_four CHAR(4),
    bank_name VARCHAR(255),
    
    -- Crypto
    crypto_address VARCHAR(100),
    crypto_network VARCHAR(50),
    
    -- Tokenization
    token_id TEXT NOT NULL,
    processor VARCHAR(100),
    
    is_default BOOLEAN DEFAULT false,
    is_verified BOOLEAN DEFAULT false,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP
);

-- ============================================================================
-- AZORA CLOUD - INFRASTRUCTURE MANAGEMENT
-- ============================================================================

CREATE TYPE cloud_resource_type AS ENUM ('compute', 'storage', 'database', 'network', 'serverless', 'container', 'kubernetes');
CREATE TYPE cloud_status AS ENUM ('provisioning', 'running', 'stopped', 'terminated', 'error', 'maintenance');

CREATE TABLE cloud_projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    organization_id UUID REFERENCES organizations(id),
    description TEXT,
    region VARCHAR(50),
    environment VARCHAR(50),
    budget_limit NUMERIC(15, 2),
    current_spend NUMERIC(15, 2) DEFAULT 0,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE cloud_resources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES cloud_projects(id),
    resource_type cloud_resource_type NOT NULL,
    name VARCHAR(255) NOT NULL,
    status cloud_status DEFAULT 'provisioning',
    
    -- Specifications
    specs JSONB NOT NULL,
    region VARCHAR(50),
    availability_zone VARCHAR(50),
    
    -- Networking
    ip_address INET,
    public_ip INET,
    dns_name VARCHAR(255),
    
    -- Billing
    hourly_cost NUMERIC(10, 4),
    total_cost NUMERIC(15, 2) DEFAULT 0,
    
    -- Monitoring
    cpu_usage NUMERIC(5, 2),
    memory_usage NUMERIC(5, 2),
    disk_usage NUMERIC(5, 2),
    network_in BIGINT,
    network_out BIGINT,
    
    created_at TIMESTAMP DEFAULT NOW(),
    started_at TIMESTAMP,
    stopped_at TIMESTAMP,
    terminated_at TIMESTAMP
);

-- ============================================================================
-- AZORA LEARN - EDUCATION PLATFORM
-- ============================================================================

CREATE TABLE courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    instructor_id UUID REFERENCES users(id),
    category VARCHAR(100),
    difficulty VARCHAR(50),
    duration_hours INTEGER,
    price_azr NUMERIC(10, 2),
    thumbnail_url TEXT,
    syllabus JSONB,
    learning_outcomes TEXT[],
    prerequisites TEXT[],
    is_published BOOLEAN DEFAULT false,
    enrollment_count INTEGER DEFAULT 0,
    rating NUMERIC(3, 2),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE enrollments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    course_id UUID REFERENCES courses(id),
    progress NUMERIC(5, 2) DEFAULT 0,
    completed BOOLEAN DEFAULT false,
    certificate_issued BOOLEAN DEFAULT false,
    certificate_url TEXT,
    grade NUMERIC(5, 2),
    started_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP,
    UNIQUE(user_id, course_id)
);

CREATE TABLE bounties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    difficulty VARCHAR(50),
    reward_azr NUMERIC(10, 2) NOT NULL,
    requirements JSONB,
    verification_criteria JSONB,
    max_completions INTEGER DEFAULT 1,
    current_completions INTEGER DEFAULT 0,
    sponsor_id UUID REFERENCES users(id),
    expires_at TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE bounty_completions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bounty_id UUID REFERENCES bounties(id),
    user_id UUID REFERENCES users(id),
    proof_url TEXT,
    proof_data JSONB,
    verification_status verification_status DEFAULT 'pending',
    verified_by UUID REFERENCES users(id),
    azr_awarded NUMERIC(10, 2),
    feedback TEXT,
    completed_at TIMESTAMP DEFAULT NOW(),
    verified_at TIMESTAMP
);

-- ============================================================================
-- AZORA MARKETPLACE
-- ============================================================================

CREATE TABLE marketplace_listings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    seller_id UUID REFERENCES users(id),
    seller_org_id UUID REFERENCES organizations(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    subcategory VARCHAR(100),
    listing_type VARCHAR(50),
    price_azr NUMERIC(15, 2),
    price_usd NUMERIC(15, 2),
    pricing_model VARCHAR(50),
    
    -- Service/Product Details
    specifications JSONB,
    features TEXT[],
    requirements TEXT[],
    delivery_time VARCHAR(100),
    
    -- Media
    images TEXT[],
    videos TEXT[],
    documents TEXT[],
    
    -- Stats
    views INTEGER DEFAULT 0,
    sales INTEGER DEFAULT 0,
    rating NUMERIC(3, 2),
    review_count INTEGER DEFAULT 0,
    
    is_active BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE marketplace_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number VARCHAR(50) UNIQUE NOT NULL,
    buyer_id UUID REFERENCES users(id),
    seller_id UUID REFERENCES users(id),
    listing_id UUID REFERENCES marketplace_listings(id),
    
    amount NUMERIC(15, 2) NOT NULL,
    currency CHAR(3) NOT NULL,
    status payment_status DEFAULT 'pending',
    
    escrow_amount NUMERIC(15, 2),
    escrow_released BOOLEAN DEFAULT false,
    
    delivery_details JSONB,
    completed_at TIMESTAMP,
    disputed_at TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- API MANAGEMENT
-- ============================================================================

CREATE TABLE api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    organization_id UUID REFERENCES organizations(id),
    key_hash TEXT NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    scopes TEXT[],
    rate_limit INTEGER,
    rate_limit_period VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    last_used_at TIMESTAMP,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE api_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    api_key_id UUID REFERENCES api_keys(id),
    endpoint VARCHAR(255) NOT NULL,
    method VARCHAR(10) NOT NULL,
    status_code INTEGER,
    response_time_ms INTEGER,
    request_size BIGINT,
    response_size BIGINT,
    ip_address INET,
    user_agent TEXT,
    timestamp TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- ANALYTICS & INTELLIGENCE
-- ============================================================================

CREATE TABLE user_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    activity_type VARCHAR(100) NOT NULL,
    activity_data JSONB,
    ip_address INET,
    user_agent TEXT,
    location JSONB,
    device_fingerprint TEXT,
    session_id UUID,
    timestamp TIMESTAMP DEFAULT NOW()
);

CREATE TABLE behavioral_patterns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    pattern_type VARCHAR(100),
    pattern_data JSONB,
    confidence_score NUMERIC(5, 2),
    detected_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP
);

CREATE TABLE threat_intelligence (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    threat_type VARCHAR(100) NOT NULL,
    severity VARCHAR(50),
    indicators JSONB,
    affected_entities JSONB,
    mitigation_steps TEXT[],
    status VARCHAR(50),
    detected_at TIMESTAMP DEFAULT NOW(),
    resolved_at TIMESTAMP
);

-- ============================================================================
-- GOVERNMENT SERVICES
-- ============================================================================

CREATE TABLE government_entities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id),
    country_code CHAR(2) NOT NULL,
    entity_type VARCHAR(100),
    department VARCHAR(255),
    authority_level VARCHAR(50),
    jurisdiction JSONB,
    security_clearance security_clearance,
    contact_info JSONB,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE digital_identities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    did_method VARCHAR(50) NOT NULL,
    did_document JSONB NOT NULL,
    verification_method JSONB,
    authentication JSONB,
    assertion_method JSONB,
    capability_delegation JSONB,
    capability_invocation JSONB,
    service_endpoints JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- COMPLIANCE & AUDIT
-- ============================================================================

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(255) NOT NULL,
    resource_type VARCHAR(100),
    resource_id UUID,
    changes JSONB,
    ip_address INET,
    user_agent TEXT,
    severity VARCHAR(50),
    compliance_relevant BOOLEAN DEFAULT false,
    retention_until TIMESTAMP,
    timestamp TIMESTAMP DEFAULT NOW()
);

CREATE TABLE compliance_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id),
    report_type VARCHAR(100),
    jurisdiction CHAR(2),
    regulation VARCHAR(100),
    period_start DATE,
    period_end DATE,
    report_data JSONB,
    generated_by UUID REFERENCES users(id),
    generated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_wallet ON users(wallet_address);
CREATE INDEX idx_users_org ON users(organization_id);
CREATE INDEX idx_users_type ON users(user_type);

-- Transactions
CREATE INDEX idx_transactions_from ON transactions(from_user_id);
CREATE INDEX idx_transactions_to ON transactions(to_user_id);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_created ON transactions(initiated_at);
CREATE INDEX idx_transactions_hash ON transactions(transaction_hash);

-- Cloud Resources
CREATE INDEX idx_cloud_project ON cloud_resources(project_id);
CREATE INDEX idx_cloud_status ON cloud_resources(status);
CREATE INDEX idx_cloud_type ON cloud_resources(resource_type);

-- Marketplace
CREATE INDEX idx_marketplace_seller ON marketplace_listings(seller_id);
CREATE INDEX idx_marketplace_category ON marketplace_listings(category);
CREATE INDEX idx_marketplace_active ON marketplace_listings(is_active);

-- Analytics
CREATE INDEX idx_activities_user ON user_activities(user_id);
CREATE INDEX idx_activities_type ON user_activities(activity_type);
CREATE INDEX idx_activities_timestamp ON user_activities(timestamp);

-- API Usage
CREATE INDEX idx_api_usage_key ON api_usage(api_key_id);
CREATE INDEX idx_api_usage_timestamp ON api_usage(timestamp);

-- Audit
CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_action ON audit_logs(action);
CREATE INDEX idx_audit_timestamp ON audit_logs(timestamp);

-- ============================================================================
-- SAMPLE DATA FOR TESTING
-- ============================================================================

-- Insert system organization
INSERT INTO organizations (name, type, country_code, security_clearance) VALUES
('Azora World', 'platform', 'XX', 'cosmic_top_secret');

-- Insert sample bounties for students
INSERT INTO bounties (title, description, category, difficulty, reward_azr) VALUES
('Complete GitHub Copilot Tutorial', 'Finish the official Copilot onboarding', 'learning', 'beginner', 50),
('Build Your First API', 'Create a REST API with authentication', 'coding', 'intermediate', 200),
('Contribute to Open Source', 'Make a meaningful PR to an OSS project', 'contribution', 'advanced', 500),
('Deploy on Azora Cloud', 'Deploy an application on Azora Cloud', 'cloud', 'intermediate', 300),
('Complete Security Audit', 'Perform security audit on a web application', 'security', 'advanced', 1000);

GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO azora_admin;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO azora_admin;
