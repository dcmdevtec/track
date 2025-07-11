-- Datos iniciales para el sistema

-- Insertar usuario administrador
INSERT INTO users (email, name, role, department) VALUES
('admin@industriascannon.com', 'Administrador Sistema', 'admin', 'IT'),
('logistica@industriascannon.com', 'Coordinador Logística', 'supervisor', 'Logística'),
('compras@industriascannon.com', 'Analista Compras', 'user', 'Compras');

-- Insertar navieras principales
INSERT INTO carriers (name, code, website, tracking_url_template) VALUES
('Maersk Line', 'MAEU', 'https://www.maersk.com', 'https://www.maersk.com/tracking/{container}'),
('Mediterranean Shipping Company', 'MSCU', 'https://www.msc.com', 'https://www.msc.com/track-a-shipment?agencyPath=msc-com&trackingNumber={container}'),
('CMA CGM', 'CMDU', 'https://www.cma-cgm.com', 'https://www.cma-cgm.com/ebusiness/tracking/{container}'),
('Hapag-Lloyd', 'HLCU', 'https://www.hapag-lloyd.com', 'https://www.hapag-lloyd.com/en/online-business/track/track-by-container-solution.html?container={container}'),
('Evergreen Line', 'EGLV', 'https://www.evergreen-line.com', 'https://www.shipmentlink.com/servlet/TDB1_CargoTracking.do?container={container}'),
('COSCO SHIPPING', 'COSU', 'https://www.cosco-shipping.com', 'https://elines.coscoshipping.com/ebusiness/cargoTracking/{container}');

-- Insertar puertos principales
INSERT INTO ports (name, code, country, city, latitude, longitude, timezone) VALUES
('Puerto de Buenaventura', 'COBUN', 'Colombia', 'Buenaventura', 3.8801, -77.0397, 'America/Bogota'),
('Puerto de Cartagena', 'COCTG', 'Colombia', 'Cartagena', 10.3910, -75.4794, 'America/Bogota'),
('Puerto de Barranquilla', 'COBAQ', 'Colombia', 'Barranquilla', 10.9639, -74.7964, 'America/Bogota'),
('Puerto de Santa Marta', 'COSMT', 'Colombia', 'Santa Marta', 11.2408, -74.1990, 'America/Bogota'),
('Puerto de Los Angeles', 'USLAX', 'Estados Unidos', 'Los Angeles', 33.7361, -118.2639, 'America/Los_Angeles'),
('Puerto de Long Beach', 'USLGB', 'Estados Unidos', 'Long Beach', 33.7701, -118.1937, 'America/Los_Angeles'),
('Puerto de Shanghai', 'CNSHA', 'China', 'Shanghai', 31.2304, 121.4737, 'Asia/Shanghai'),
('Puerto de Shenzhen', 'CNSZX', 'China', 'Shenzhen', 22.5431, 114.0579, 'Asia/Shanghai'),
('Puerto de Hamburgo', 'DEHAM', 'Alemania', 'Hamburgo', 53.5511, 9.9937, 'Europe/Berlin'),
('Puerto de Rotterdam', 'NLRTM', 'Países Bajos', 'Rotterdam', 51.9225, 4.4792, 'Europe/Amsterdam');

-- Insertar proveedores ejemplo
INSERT INTO suppliers (name, code, contact_email, country) VALUES
('Proveedor Asia Pacific Ltd', 'PAP001', 'contact@asiapacific.com', 'China'),
('European Manufacturing Co', 'EMC002', 'sales@euromanuf.com', 'Alemania'),
('American Suppliers Inc', 'ASI003', 'info@amsuppliers.com', 'Estados Unidos'),
('Global Trade Partners', 'GTP004', 'orders@globaltp.com', 'China');

-- Insertar configuración inicial del sistema
INSERT INTO system_config (config_key, config_value, description) VALUES
('tracking_update_interval', '{"hours": 6}', 'Intervalo de actualización automática de tracking'),
('alert_delay_thresholds', '{"warning": 24, "critical": 72}', 'Umbrales de alerta por retraso en horas'),
('api_rate_limits', '{"requests_per_minute": 100}', 'Límites de velocidad para APIs externas'),
('notification_channels', '["email", "slack"]', 'Canales de notificación habilitados'),
('backup_schedule', '{"cron": "0 2 * * *"}', 'Programación de respaldos automáticos');
