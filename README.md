# Dentist+ 🦷

A modern, containerized web application designed to streamline the clinical and administrative operations of a dental practice. Dentist+ facilitates comprehensive electronic health record (EHR) management, dynamic odontogram charting, appointment scheduling, and secure medical imaging storage.

> **Notice:** This is only frontend version of Dentist+. Complete architectural documentation, which includes database ER diagrams, API specifications, and interface flows is located in the **`documentation`** folder.

---

## System Architecture

Dentist+ combines a Spring Boot backend with a responsive React and TypeScript frontend, containerized using Docker Compose. Centralized authentication and authorization are delegated to a Keycloak server running on OAuth2/OpenID Connect.

### Architecture Highlights:
* **Medical Record Management (EHR):** Tracks patient profiles, medical procedures, diagnostics, and longitudinal treatment histories per individual tooth surface.
* **Interactive Odontogram Charting:** Dynamic dental charting component visualizing current and historical oral health states across visit timelines.
* **Centralized IAM:** Identity governance managed by Keycloak using OpenID Connect, standard credentials, and Google OAuth2 social login.
* **Diagnostic Imaging Repository:** Direct upload and association of diagnostic assets (pantomographic X-rays, intraoral photos) with patient records and clinical visits.
* **Automated Data Persistence:** Code-First relational schema mapping managed through Hibernate and Spring Data JPA on PostgreSQL.

---

## Project Structure

```text
dentist-plus/
├── backend-application/    # Spring Boot REST API service (Port: 3000)
├── frontend/               # React SPA (TypeScript, TanStack Router, Tailwind CSS)
├── keycloak/               # Keycloak themes, realm imports, and configuration
├── postgres/               # PostgreSQL database data and initialization scripts
├── postgres-keycloak/      # Dedicated database instance for Keycloak identity data
├── documentation/          # Project documentation PDF, ERD diagrams, and screenshots
├── docker-compose.yml      # Multi-container runtime orchestration
└── .env.example            # Environment variables template

```
## Complete Tech Stack & Infrastructure

### Backend & Core Services
* **Language & Runtime:** Java 21, Spring Boot 3
* **ORM & Persistence:** Spring Data JPA, Hibernate
* **Database Engine:** PostgreSQL 16 (Relational persistence for patients, visits, odontogram data, and documents)
* **API Contracts & Testing:** OpenAPI 3.0 / Swagger UI, Insomnia

### Identity, Authentication & Security
* **Identity Server:** Keycloak (Quay.io containerized distribution)
* **Protocols:** OAuth2, OpenID Connect (OIDC), JWT Bearer Tokens
* **Federated Auth:** Google OAuth2 Integration
* **Access Control:** Role-Based Access Control (RBAC) separating Doctor and Patient capabilities

### Frontend & Client Application
* **Framework & Language:** React.js, TypeScript
* **Client-Side Routing:** TanStack Router (Route guards, authentication checks)
* **Styling & UI Components:** Tailwind CSS
* **Architecture:** Single Page Application (SPA)

### DevOps & Containerization
* **Containerization Engine:** Docker Engine & Docker Compose
* **Network Topology:** Isolated bridge network (`dentist-network`)

---

## Port Mapping & Infrastructure Overview (Docker Compose)

| Container Name | Service Role | Technology |
| :--- | :--- | :--- |
| `backend-application` | REST API Backend | Spring Boot 3 |
| `keycloak` | Authentication & IAM Server | Keycloak |
| `postgres-keycloak` | Keycloak Identity Persistence | PostgreSQL |
| `postgres` | Clinical Application Database | PostgreSQL |

---

## Quick Start & Setup

### Prerequisites
* Docker & Docker Compose
* Java 21 JDK (for building the backend locally)
* Node.js 20+ (for local frontend development)
