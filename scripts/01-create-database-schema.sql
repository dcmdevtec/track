-- Maritime Control System Database Schema

-- Tabla de usuarios
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'user', -- admin, supervisor, user, viewer
    department VARCHAR(100),
    phone VARCHAR(20),
    notification_preferences JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de navieras
CREATE TABLE carriers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(10) UNIQUE NOT NULL,
    website VARCHAR(255),
    api_endpoint VARCHAR(255),
    api_credentials JSONB,
    tracking_url_template VARCHAR(500),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de puertos
CREATE TABLE ports (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(10) UNIQUE NOT NULL,
    country VARCHAR(100) NOT NULL,
    city VARCHAR(100) NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    timezone VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de proveedores
CREATE TABLE suppliers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE,
    contact_email VARCHAR(255),
    contact_phone VARCHAR(20),
    country VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de barcos
CREATE TABLE vessels (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    imo_number VARCHAR(20) UNIQUE,
    mmsi VARCHAR(20),
    carrier_id INTEGER REFERENCES carriers(id),
    vessel_type VARCHAR(50),
    flag_country VARCHAR(100),
    current_latitude DECIMAL(10, 8),
    current_longitude DECIMAL(11, 8),
    current_speed DECIMAL(5, 2),
    current_heading INTEGER,
    last_position_update TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla principal de embarques
CREATE TABLE shipments (
    id SERIAL PRIMARY KEY,
    bl_number VARCHAR(100) UNIQUE NOT NULL,
    container_number VARCHAR(50) NOT NULL,
    carrier_id INTEGER REFERENCES carriers(id),
    supplier_id INTEGER REFERENCES suppliers(id),
    vessel_id INTEGER REFERENCES vessels(id),
    origin_port_id INTEGER REFERENCES ports(id),
    destination_port_id INTEGER REFERENCES ports(id),
    
    -- Fechas importantes
    etd_original DATE,
    etd_actual DATE,
    eta_original DATE,
    eta_current DATE,
    ata DATE, -- Actual Time of Arrival
    
    -- Estados
    status VARCHAR(50) NOT NULL DEFAULT 'pending', -- pending, in_transit, arrived, delayed, critical
    priority VARCHAR(20) DEFAULT 'normal', -- low, normal, high, critical
    
    -- Información adicional
    cargo_description TEXT,
    container_type VARCHAR(20),
    container_size VARCHAR(10),
    weight_kg DECIMAL(10, 2),
    value_usd DECIMAL(12, 2),
    
    -- Tracking
    last_tracking_update TIMESTAMP,
    tracking_status VARCHAR(100),
    current_location VARCHAR(255),
    
    -- Metadatos
    tags JSONB DEFAULT '[]',
    notes TEXT,
    is_active BOOLEAN DEFAULT true,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de eventos de embarque
CREATE TABLE shipment_events (
    id SERIAL PRIMARY KEY,
    shipment_id INTEGER REFERENCES shipments(id),
    event_type VARCHAR(50) NOT NULL, -- departure, arrival, delay, status_change, location_update
    event_date TIMESTAMP NOT NULL,
    location VARCHAR(255),
    description TEXT,
    source VARCHAR(50), -- email, api, manual, system
    raw_data JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de correos electrónicos procesados
CREATE TABLE email_processing (
    id SERIAL PRIMARY KEY,
    email_subject VARCHAR(500),
    email_from VARCHAR(255),
    email_date TIMESTAMP,
    email_body TEXT,
    extracted_data JSONB,
    validation_status VARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected
    validated_by INTEGER REFERENCES users(id),
    validation_date TIMESTAMP,
    validation_notes TEXT,
    shipment_id INTEGER REFERENCES shipments(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de alertas
CREATE TABLE alerts (
    id SERIAL PRIMARY KEY,
    shipment_id INTEGER REFERENCES shipments(id),
    alert_type VARCHAR(50) NOT NULL, -- delay, arrival, critical, discrepancy
    severity VARCHAR(20) NOT NULL, -- low, medium, high, critical
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    is_resolved BOOLEAN DEFAULT false,
    assigned_to INTEGER REFERENCES users(id),
    resolved_by INTEGER REFERENCES users(id),
    resolved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de notificaciones
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    alert_id INTEGER REFERENCES alerts(id),
    channel VARCHAR(20) NOT NULL, -- email, slack, teams, sms
    status VARCHAR(20) DEFAULT 'pending', -- pending, sent, delivered, failed
    sent_at TIMESTAMP,
    delivered_at TIMESTAMP,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de reportes programados
CREATE TABLE scheduled_reports (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    report_type VARCHAR(50) NOT NULL,
    schedule_cron VARCHAR(100) NOT NULL,
    recipients JSONB NOT NULL, -- array of email addresses
    parameters JSONB DEFAULT '{}',
    format VARCHAR(20) DEFAULT 'pdf', -- pdf, excel, csv
    is_active BOOLEAN DEFAULT true,
    last_run TIMESTAMP,
    next_run TIMESTAMP,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de configuración del sistema
CREATE TABLE system_config (
    id SERIAL PRIMARY KEY,
    config_key VARCHAR(100) UNIQUE NOT NULL,
    config_value JSONB NOT NULL,
    description TEXT,
    updated_by INTEGER REFERENCES users(id),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para optimizar consultas
CREATE INDEX idx_shipments_status ON shipments(status);
CREATE INDEX idx_shipments_carrier ON shipments(carrier_id);
CREATE INDEX idx_shipments_eta ON shipments(eta_current);
CREATE INDEX idx_shipments_bl ON shipments(bl_number);
CREATE INDEX idx_shipments_container ON shipments(container_number);
CREATE INDEX idx_shipment_events_shipment ON shipment_events(shipment_id);
CREATE INDEX idx_shipment_events_date ON shipment_events(event_date);
CREATE INDEX idx_alerts_unread ON alerts(is_read, created_at);
CREATE INDEX idx_email_processing_status ON email_processing(validation_status);
