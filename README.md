# We-Roster

<details>
  <summary>Table of Contents</summary>
  <ol>
    <li><a href="#project-overview">Project Overview</a></li>
    <li><a href="#quick-setup">Quick Setup</a></li>
    <li><a href="#tech-stack">Tech Stack</a></li>
    <li><a href="#project-structure">Project Structure</a></li>
    <li><a href="#team-information">Team Information</a></li>
    <li><a href="#change-logs">Change Logs</a></li>
  </ol>
</details>

## Project Overview
WeRoster is an employee rostering system used by organisations with shift-based workforces (e.g., hospitals, hospitality, retail). The platform's primary purpose is to streamline shift scheduling, improve communication between managers and staff, and reduce inefficiencies in current processes. The application is deployed on Railway with a remote MySQL database, providing a cloud-based solution for shift management with a React Native mobile app for staff.

## Quick Setup

### Prerequisites
- **Node.js 18+** - [Download](https://nodejs.org/)
- **Expo CLI** - `npm install -g @expo/cli`

### Production Deployment (Railway)
The application is deployed on Railway with a remote MySQL database:

- **Live Backend**: https://we-roster-production.up.railway.app
- **Health Check**: https://we-roster-production.up.railway.app/api/v1/health
- **Database**: MySQL hosted on Railway

### Local Frontend Development
```bash
# Clone the repository
git clone https://github.com/Yuting-Yin/We-Roster.git
cd We-Roster

# Install frontend dependencies
cd frontend
npm install

# Start the development server
npm start
```

### Access the Application
- **Production Backend**: https://we-roster-production.up.railway.app/api/v1
- **Local Frontend**: Scan QR code with Expo Go app
- **Database Management**: MySQL Workbench (connect to Railway MySQL)

### Test Credentials
- **Domain**: `test`
- **Email**: `sarah.johnson@weroster.com`
- **Password**: `hello`

## Database Schema

The application uses a MySQL database with the following key features:

### Core Entities
- **Hospital** - Hospital information and configuration
- **Department** - Hospital departments (Emergency, ICU, Medical Ward)
- **Staff** - Staff members with user account linking
- **Shift** - Work shifts with status (COMPLETE/INCOMPLETE)
- **Open Shift** - Open shifts linked to base shifts for additional staffing

### Key Relationships
- **Shift-OpenShift**: One-to-one relationship where open shifts extend base shifts
- **User-Staff**: Direct linking for authentication
- **Shift Assignment**: Staff assigned to shifts with status tracking
- **Leave/Swap Requests**: Staff request management system

### Schema Reference
The complete database schema is available in `DataBase/Database.sql` for:
- **Development reference** - Understanding current structure
- **Migration planning** - Planning future schema changes
- **Local setup** - Recreating database locally if needed

> 📋 **Database Schema**: See `DataBase/Database.sql` for complete table structure, relationships, and sample data.

## Tech Stack

### Backend (Deployed on Railway)
- **Framework**: Spring Boot 3.x
- **Language**: Java 21
- **Database**: MySQL 8.0+ (Railway hosted)
- **Build Tool**: Gradle
- **Authentication**: JWT
- **Deployment**: Railway with automatic builds

### Frontend (Local Development)
- **Framework**: React Native with Expo
- **Language**: TypeScript
- **Navigation**: React Navigation
- **State Management**: React Hooks
- **HTTP Client**: Axios
- **API Endpoint**: Railway backend

## Project Structure

```
We-Roster/
├── backend/                       # Spring Boot backend application
│   ├── src/main/java/            # Java source code
│   ├── src/main/resources/       # Configuration files (Railway config)
│   └── build.gradle              # Gradle build configuration
├── frontend/                      # React Native mobile application
│   ├── src/                      # TypeScript source code
│   ├── src/config/               # API configuration for Railway
│   ├── assets/                   # Images and static assets
│   └── package.json              # Node.js dependencies
├── DataBase/                      # Database schema reference
│   └── Database.sql              # MySQL database schema
└── README.md                     # Project overview and setup
```

## Team Information

### Client Contact
| Name            | Email                           |
| --------------- | ------------------------------- |
| Quan Pham       | [client.email@domain.com]      |

### Team Supervisor
| Name            | Email                           |
| --------------- | ------------------------------- |
| Sandy Luo       | sandyluo@unimelb.edu.au        |

### Team Members
| Name            | Email                               | Role          |
| --------------- | ----------------------------------- | ------------- |
| Katherine Xin   | kaxin@student.unimelb.edu.au        | Product owner |
| Haoyu Hu        | haoyu.hu.2@student.unimelb.edu.au  | Scrum master  |
| Yichen Pan      | yichenp2@student.unimelb.edu.au     | Developer     |
| Quan yu         | quyu@student.unimelb.edu.au         | Developer     |
| Yuting Yin      | yuting.yin@student.unimelb.edu.au   | Developer     |

## Change Logs
### Sprint 1
| Date | Description | Commit Log |
| ---- | ----------- | --- |
| 13-Aug-2025 | Initial project setup and repository structure | [b820e99](https://github.com/Yuting-Yin/We-Roster/commit/b820e9900d06e60ff03cbf4abef6afd986f3fa55) |

### Sprint 2
| Date | Description | Commit Log |
| ---- | ----------- | --- |
| 7-Sep-2025 | Modify repository structure and create sprint 1 release | [a771c4e](https://github.com/Yuting-Yin/We-Roster/commit/862beb77090b7c3282d16bf2122bca3faa1d97d1) |

### Sprint 3
| Date | Description | Commit Log |
| ---- | ----------- | --- |
| 8-Oct-2025 | Refactor shift/open-shift data structure and Railway deployment | [setup/remote-database branch] |
| 8-Oct-2025 | Deploy to Railway with remote MySQL database | [setup/remote-database branch] |
| 8-Oct-2025 | Add Railway build configuration and cleanup unused files | [setup/remote-database branch] |
| 8-Oct-2025 | Force database regeneration and restore schema reference | [setup/remote-database branch] |

## Repository
**GitHub**: [https://github.com/Yuting-Yin/We-Roster](https://github.com/Yuting-Yin/We-Roster)

---

<p align="right">(<a href="#We-Roster">back to top</a>)</p>
