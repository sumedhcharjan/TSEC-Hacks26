# Infralink 🏙️  
**Smart Urban Infrastructure & Resource Management Platform**

> 🏆 **Built at TSEC HACKS 2026 (Social Cause Domain)**

Infralink is a full-stack **Web + ML** platform developed during **TSEC HACKS 2026** to help cities transition from a reactive *“break-fix”* approach to a **predictive, data-driven urban infrastructure management system**.

The platform unifies citizen reporting, AI-assisted analysis, administrative decision-making, and contractor execution into a single, scalable system.

---

## 🚀 Problem Statement

Modern cities face critical challenges:
- Aging roads, bridges, and public utilities
- Fragmented and manual inspection processes
- Delayed responses to infrastructure failures
- Inefficient use of energy, water, and manpower

During **TSEC HACKS 2026**, we aimed to design a system that transforms urban management into a **proactive, intelligent, and scalable workflow**.

---

## ✨ Key Features

### 👥 Citizen Portal
- Report infrastructure issues with **image uploads + geolocation**
- Track complaint status in real time
- Transparent feedback loop with authorities

### 🧠 AI & Analytics (Prototype-Ready)
- Infrastructure damage analysis (computer-vision-ready architecture)
- Risk scoring for predictive maintenance
- Anomaly detection on simulated utility data

### 🏛️ Admin Dashboard
- Centralized complaint management
- Priority-based work order creation
- Budget estimation & operational oversight
- GIS-ready spatial visualization

### 🛠️ Contractor Dashboard
- Assigned work orders with SLA deadlines
- Milestone-based execution flow
- Field evidence upload & verification
- Completion and payment tracking

### 🧭 Intelligent Routing (Prototype)
- OpenStreetMap-based routing
- Optimized paths for maintenance crews & emergency services
- Traffic-aware logic using simulated congestion data

---

## 🧩 System Architecture

Frontend (React + Tailwind)
|
Backend (Node.js + Express)
|
Supabase (Auth + PostgreSQL + Storage)
|
ML Services (Simulated / Extendable)


> ⚠️ Real-world IoT, traffic, and utility data are **simulated** for this hackathon prototype.  
> The architecture is designed to seamlessly integrate live APIs in production.

---

## 🛠️ Tech Stack

### Frontend
- React
- Tailwind CSS
- React Router
- React Hot Toast

### Backend
- Node.js
- Express.js
- RESTful APIs

### Database & Authentication
- Supabase (PostgreSQL)
- Supabase Auth (Google OAuth + Email)
- Role-based access control (Citizen / Admin / Contractor)

### Mapping & Routing
- OpenStreetMap (OSM)
- OpenRouteService / OSRM

### Deployment
- Frontend: **Vercel**
- Backend: **Render**
- Database & Storage: **Supabase**

---

## 🔐 Authentication & Roles

Role-based access is enforced using **Supabase Row Level Security (RLS)**:

- **Citizen** – Report and track issues
- **Admin** – Review complaints, create work orders, manage budgets
- **Contractor** – Execute assigned tasks and upload field evidence

---

## 🧪 Data Strategy (Hackathon Context)

Due to restricted access to live municipal APIs:
- Synthetic and mock datasets are used for:
  - Energy & water consumption
  - Sensor telemetry
  - Traffic congestion
- This ensures **realistic demos** while keeping the system production-ready.

---

## 📦 Local Setup

```bash
git clone https://github.com/kalpm1110/infralink.git
cd infralink
