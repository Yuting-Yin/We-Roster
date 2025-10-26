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
WeRoster is an employee rostering system used by organisations with shift-based workforces (e.g., hospitals, hospitality, retail). The platform's primary purpose is to streamline shift scheduling, improve communication between managers and staff, and reduce inefficiencies in current processes. It currently operates as a mobile app for staff and a web interface for managers, but has gaps in functionality, performance, and integration.

## Quick Setup

### Prerequisites
- **Java 17+** - [Download](https://adoptium.net/)
- **MySQL 8.0+** - [Download](https://dev.mysql.com/downloads/mysql/)
- **Node.js 18+** - [Download](https://nodejs.org/)

### One-Click Setup

**Windows:**
```cmd
# Clone the repository
git clone <repository-url>
cd We-Roster

# Setup backend
.\setup_backend.bat

# Setup frontend (in new terminal)
cd frontend
npm install
npm start
```

**Linux/macOS:**
```bash
# Clone the repository
git clone <repository-url>
cd We-Roster

# Setup backend
chmod +x setup_backend.sh
./setup_backend.sh

# Setup frontend (in new terminal)
cd frontend
npm install
npm start
```

### Alternative: Docker Setup
```bash
# Use Docker for MySQL
.\setup_backend_docker.bat  # Windows
./setup_backend_docker.sh   # Linux/macOS

# Then run backend setup
.\setup_backend.bat         # Windows
./setup_backend.sh          # Linux/macOS
```

### Access the Application
- **Backend API**: http://localhost:8080/api/v1
- **Health Check**: http://localhost:8080/api/v1/health
- **Frontend**: Scan QR code with Expo Go app

### Test Credentials
- **Domain**: `test`
- **Email**: `sarah.johnson@weroster.com`
- **Password**: `hello`

> 📖 **For detailed setup instructions, troubleshooting, and manual setup steps, see [SETUP_GUIDE.md](SETUP_GUIDE.md)**

## Tech Stack

### Backend
- **Framework**: Spring Boot 3.x
- **Language**: Java 17+
- **Database**: MySQL 8.0+
- **Build Tool**: Gradle
- **Authentication**: JWT

### Frontend
- **Framework**: React Native with Expo
- **Language**: TypeScript
- **Navigation**: React Navigation
- **State Management**: React Hooks
- **HTTP Client**: Axios

## Project Structure

```
We-Roster/
├── backend/                       # Spring Boot backend application
│   ├── src/main/java/            # Java source code
│   ├── src/main/resources/       # Configuration files
│   └── build.gradle              # Gradle build configuration
├── frontend/                      # React Native mobile application
│   ├── src/                      # TypeScript source code
│   ├── assets/                   # Images and static assets
│   └── package.json              # Node.js dependencies
├── DataBase/                      # Database schema and scripts
│   └── Database.sql              # MySQL database schema
├── setup_backend.bat             # Windows backend setup script
├── setup_backend.sh              # Linux/macOS backend setup script
├── setup_backend_docker.bat      # Windows Docker MySQL setup
├── setup_backend_docker.sh       # Linux/macOS Docker MySQL setup
├── SETUP_GUIDE.md                # Detailed setup instructions
└── README.md                     # Project overview and quick setup
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
| 26-Sep-2025 | Final version | [59b0979][59b0979b3ab146e79cc755c5c00e01eb8932201c](https://github.com/Yuting-Yin/We-Roster/commit/59b0979b3ab146e79cc755c5c00e01eb8932201c) |

## Repository
**GitHub**: [https://github.com/Yuting-Yin/We-Roster](https://github.com/Yuting-Yin/We-Roster)

---

<p align="right">(<a href="#We-Roster">back to top</a>)</p>
