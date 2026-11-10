CREATE ROLE metro_core LOGIN PASSWORD 'metro_core_dev';
CREATE DATABASE metro_core OWNER metro_core;

CREATE ROLE metro_validation LOGIN PASSWORD 'metro_validation_dev';
CREATE DATABASE metro_validation OWNER metro_validation;

CREATE ROLE metro_notifications LOGIN PASSWORD 'metro_notifications_dev';
CREATE DATABASE metro_notifications OWNER metro_notifications;
