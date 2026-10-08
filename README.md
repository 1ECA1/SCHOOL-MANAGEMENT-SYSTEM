\# EduManageERP



\*\*EduManageERP\*\* is a comprehensive school management and education administration system designed to help schools manage academic, administrative, student, staff, financial, examination, communication, and reporting operations from a centralized platform.



The system is built with a \*\*Django REST Framework backend\*\* and a \*\*React frontend\*\*, with role-based access control across the different users of a school.



\---



\## Table of Contents



\* \[Overview](#overview)

\* \[Key Features](#key-features)

\* \[User Roles](#user-roles)

\* \[System Modules](#system-modules)

\* \[Technology Stack](#technology-stack)

\* \[Project Structure](#project-structure)

\* \[Backend](#backend)

\* \[Frontend](#frontend)

\* \[Authentication and Authorization](#authentication-and-authorization)

\* \[Academic Management](#academic-management)

\* \[Student Management](#student-management)

\* \[Staff Management](#staff-management)

\* \[Attendance](#attendance)

\* \[Assignments](#assignments)

\* \[Examinations and Results](#examinations-and-results)

\* \[Finance](#finance)

\* \[Library](#library)

\* \[Notifications](#notifications)

\* \[Audit](#audit)

\* \[Graduation and Promotion](#graduation-and-promotion)

\* \[Installation](#installation)

\* \[Backend Setup](#backend-setup)

\* \[Frontend Setup](#frontend-setup)

\* \[Environment Variables](#environment-variables)

\* \[Database](#database)

\* \[Development](#development)

\* \[Production Deployment](#production-deployment)

\* \[Security](#security)

\* \[Git and GitHub](#git-and-github)

\* \[Project Status](#project-status)

\* \[Future Development](#future-development)

\* \[License](#license)



\---



\## Overview



EduManageERP is designed to provide schools with a centralized platform for managing their daily operations.



The platform supports multiple school roles and provides each role with access to the functionality appropriate to its responsibilities.



The system is designed around:



\* Multi-school data separation

\* Role-based permissions

\* Academic session and term management

\* Student enrollment and progression

\* Staff management

\* Examination and result management

\* Financial management

\* Attendance management

\* Assignments

\* Notifications

\* Library management

\* Audit logging

\* Administrative reporting



The application is being developed with scalability and future cloud deployment in mind.



\---



\# Key Features



\## Administration



\* School administration

\* School administrator management

\* User account management

\* Role-based access control

\* School-specific data access

\* Dashboard management

\* System settings



\## Academic Management



\* Academic sessions

\* Terms

\* Classes

\* Subjects

\* Departments

\* Class subjects

\* Academic tracks

\* Current session and term management

\* Class-level education categories



\## Student Management



\* Student registration

\* Student profiles

\* Student enrollment

\* Enrollment history

\* Term continuation

\* Student promotion

\* Graduation

\* Student accounts

\* Parent/guardian relationships

\* Optional subject selection



\## Staff Management



\* Teachers

\* Principals

\* Accountants

\* Admission Officers

\* Examination Officers

\* Librarians

\* Other staff

\* Teacher-subject assignments

\* Class teacher assignments



\## Attendance



\* Attendance settings

\* Daily attendance

\* Student attendance

\* Attendance records

\* Attendance reports

\* Class-based attendance management



\## Assignments



\* Assignment creation

\* Assignment publishing

\* Assignment types

\* Class and subject assignments

\* Student targeting

\* Assignment submission

\* Submission deadlines

\* Late submission handling

\* Grading and returned submissions



\## Examinations



\* Examination creation

\* Examination types

\* Examination schedules

\* Examination subjects

\* Examination dates and times

\* Examination venues

\* Maximum scores

\* Pass marks

\* Examination publishing

\* Examination Officer management

\* CBT/online examination support architecture



\## Results



\* Result entry

\* Teacher result entry

\* Result modification

\* Result posting

\* Grade scales

\* Student results

\* Report cards

\* Result viewing

\* Result printing

\* Class/subject-based result permissions



\## Finance



\* Fee management

\* Fee categories

\* Invoices

\* Payments

\* Scholarships

\* Discounts

\* Financial summaries

\* Income reports

\* Expense reports

\* Student statements

\* Outstanding balances

\* Payment status tracking



Principals have read-only access to relevant financial information while financial management remains restricted to authorized financial/admin roles.



\## Library



\* Library management

\* Librarian role

\* Library-related administrative functionality



\## Notifications



The notification system supports communication between school administrators, staff, students, and parents.



Notification categories include:



\* General

\* Assignments

\* Results

\* Finance

\* Examinations

\* Announcements

\* Hostel

\* Transport

\* Messages



Notifications can be targeted according to the user's role and school permissions.



\## Audit



EduManageERP includes an audit logging system for tracking important system activity.



Supported audit actions include:



\* CREATE

\* UPDATE

\* DELETE

\* LOGIN

\* LOGOUT

\* OTHER



Audit records can contain:



\* User

\* User name

\* Action

\* Model name

\* Object ID

\* Object representation

\* Description

\* IP address

\* Creation timestamp



This provides an administrative history of important system activity.



\---



\# User Roles



EduManageERP supports the following major user roles:



| Role              | Description                                              |

| ----------------- | -------------------------------------------------------- |

| Super Admin       | System-wide administration                               |

| School Admin      | Administration of a specific school                      |

| Principal         | School leadership and oversight                          |

| Teacher           | Teaching, assignments, attendance and authorized results |

| Student           | Student portal and academic information                  |

| Parent            | Parent/guardian portal                                   |

| Accountant        | Financial management                                     |

| Admission Officer | Student admission and enrollment                         |

| Librarian         | Library management                                       |

| Exam Officer      | Examination management                                   |

| Counselor         | Student counseling responsibilities                      |

| Hostel Manager    | Hostel management                                        |

| Transport Manager | Transport management                                     |



Access to functionality is controlled through backend permissions as well as frontend role-specific navigation.



\---



\# System Modules



The Django backend is organized into separate applications for major areas of the system.



Current major applications include:



```text

academics

accounts

admissions

assignments

attendance

audit

examinations

finance

library

notifications

principal

results

schoolsuperadmin

students

teachers

```



Additional supporting applications and infrastructure are also present in the project.



\---



\# Technology Stack



\## Backend



\* Python

\* Django

\* Django REST Framework

\* Django ORM

\* REST APIs

\* Token/session-based authentication infrastructure

\* SQLite for local development

\* PostgreSQL recommended for production



\## Frontend



\* React

\* JavaScript

\* React Router

\* Tailwind CSS

\* Lucide React

\* Fetch/API service architecture

\* Role-specific layouts and navigation



\## Development Tools



\* Git

\* GitHub

\* PowerShell

\* npm

\* Python virtual environments



\---



\# Project Structure



The project is organized into two main applications:



```text

EduManageERP/

│

├── backend/

│   ├── academics/

│   ├── accounts/

│   ├── admissions/

│   ├── assignments/

│   ├── attendance/

│   ├── audit/

│   ├── examinations/

│   ├── finance/

│   ├── library/

│   ├── notifications/

│   ├── principal/

│   ├── results/

│   ├── schoolsuperadmin/

│   ├── students/

│   ├── teachers/

│   ├── config/

│   ├── manage.py

│   └── ...

│

├── frontend/

│   ├── public/

│   ├── src/

│   │   ├── components/

│   │   ├── context/

│   │   ├── layouts/

│   │   ├── pages/

│   │   ├── routes/

│   │   ├── services/

│   │   └── ...

│   ├── package.json

│   └── ...

│

├── .gitignore

└── README.md

```



\---



\# Backend



The backend provides the REST API used by the React application.



The Django project configuration is located under:



```text

backend/config/

```



The Django entry point is:



```text

backend/manage.py

```



To start the development server:



```powershell

cd backend

python manage.py runserver

```



The local development server is normally available at:



```text

http://127.0.0.1:8000/

```



\---



\# Frontend



The frontend is a React application located in:



```text

frontend/

```



Install dependencies:



```powershell

cd frontend

npm install

```



Start the development server:



```powershell

npm run dev

```



The frontend communicates with the Django REST API through the services located under:



```text

frontend/src/services/

```



\---



\# Authentication and Authorization



EduManageERP uses role-based access control.



The backend validates permissions based on:



\* Authenticated user

\* User role

\* School membership

\* Assigned responsibilities

\* Academic class

\* Subject assignments

\* Other module-specific rules



The frontend provides role-specific layouts and navigation.



Examples include:



```text

SchoolAdminLayout

PrincipalLayout

TeacherLayout

StudentLayout

ParentLayout

AccountantLayout

AdmissionOfficerLayout

ExamOfficerLayout

LibrarianLayout

```



Backend authorization remains the primary security boundary. Frontend navigation should not be treated as a security mechanism.



\---



\# Academic Management



Academic administration is centered around:



\* Schools

\* Academic sessions

\* Terms

\* Class levels

\* Subjects

\* Departments

\* Class subjects

\* Teacher-subject assignments



The system supports different education levels, including:



\* Primary

\* JSS

\* SS



Academic sessions and terms allow the school to manage academic data according to the current school year.



\---



\# Student Management



Student management covers the student's lifecycle from admission through graduation.



Major processes include:



```text

Admission

&#x20;  ↓

Student Profile

&#x20;  ↓

Enrollment

&#x20;  ↓

Term Continuation

&#x20;  ↓

Promotion

&#x20;  ↓

Graduation

```



Student information can include:



\* Personal information

\* Academic information

\* Parent/guardian information

\* Enrollment information

\* Class information

\* Optional subjects

\* Academic history

\* Account information



The system supports automatic identification of graduating classes based on the appropriate senior secondary class structure.



\---



\# Staff Management



EduManageERP supports multiple staff categories.



Teacher management includes:



\* Teacher profiles

\* Teacher accounts

\* Subject assignments

\* Class assignments

\* Class teacher assignments



Teacher access to results and assignments is restricted according to assigned classes and subjects where applicable.



Administrative staff can be assigned specialized roles such as:



\* Accountant

\* Examination Officer

\* Librarian

\* Admission Officer



\---



\# Attendance



The attendance module supports:



\* Attendance settings

\* Attendance taking

\* Attendance records

\* Student attendance

\* Attendance reports



Attendance functionality is designed around school, session, term, class, and student relationships.



\---



\# Assignments



The assignment system supports different assignment target types and assignment categories.



Assignments may be:



\* General compulsory

\* Department compulsory

\* Optional



Teachers can create assignments for subjects/classes they are authorized to manage.



Student submission rules take into account:



\* Assignment publication status

\* Student status

\* Deadline

\* Late submission configuration

\* Existing graded/returned submissions

\* Optional subject eligibility



\---



\# Examinations and Results



The examination system separates examination scheduling from examination content and result management.



An examination can include:



\* Academic session

\* Term

\* Class

\* Examination name

\* Examination type

\* Start date

\* End date

\* Publication status

\* Examination subjects



Each examination subject can contain:



\* Subject

\* Examination date

\* Start time

\* End time

\* Maximum score

\* Pass mark

\* Venue



Supported examination types include:



\* First CA

\* Second CA

\* Mid Term

\* Mock

\* Terminal

\* Promotion

\* Entrance



Examination management is restricted to authorized administrative/examination roles.



Teachers can manage results for classes and subjects to which they are assigned.



\---



\# Finance



The finance module handles school financial operations including:



\* Fee categories

\* Invoices

\* Payments

\* Scholarships

\* Discounts

\* Expenses

\* Financial reports

\* Student statements

\* Outstanding balances



Financial access is role-based.



The Accountant is responsible for financial operations.



School administrators have appropriate administrative financial access.



Principals can have read-only access to financial summaries and relevant financial information without receiving permission to modify financial records.



\---



\# Notifications



The notification module provides in-system communication.



Notifications contain information such as:



\* Recipient

\* Sender

\* Notification type

\* Title

\* Message

\* Link

\* Creation timestamp



Supported notification categories include:



```text

GENERAL

ASSIGNMENT

RESULT

FINANCE

EXAMINATION

ANNOUNCEMENT

HOSTEL

TRANSPORT

MESSAGE

```



Recipient targeting is controlled by the sender's role and school permissions.



\---



\# Audit



The audit module provides an activity history for important operations.



The core audit model records:



```text

User

Action

Model

Object

Description

IP Address

Created At

```



Actions include:



```text

CREATE

UPDATE

DELETE

LOGIN

LOGOUT

OTHER

```



The audit system is intended to improve:



\* Accountability

\* Security

\* Administrative monitoring

\* Troubleshooting

\* Compliance

\* System transparency



\---



\# Graduation and Promotion



Student progression is an important part of the academic lifecycle.



Promotion functionality allows students to progress from one class level to another.



Graduation functionality handles students who complete the appropriate final secondary school level.



Graduation records can preserve information about:



\* Graduation session

\* Graduation year

\* Student academic history



This allows historical student records to remain available after graduation.



\---



\# Installation



\## Requirements



Before installing EduManageERP, make sure the following are installed:



\* Python 3.x

\* Node.js

\* npm

\* Git



For production deployment, a PostgreSQL database is recommended.



\---



\# Backend Setup



Clone the repository:



```powershell

git clone https://github.com/1ECA1/SCHOOL-MANAGEMENT-SYSTEM.git

```



Enter the project:



```powershell

cd SCHOOL-MANAGEMENT-SYSTEM

```



Enter the backend:



```powershell

cd backend

```



Create a Python virtual environment:



```powershell

python -m venv venv

```



Activate it on Windows:



```powershell

.\\venv\\Scripts\\Activate.ps1

```



Install Python dependencies:



```powershell

pip install -r requirements.txt

```



If a requirements file is not yet available in the repository, install the required Django and Django REST Framework packages according to the current project configuration.



Run migrations:



```powershell

python manage.py migrate

```



Create an administrator account if required:



```powershell

python manage.py createsuperuser

```



Start Django:



```powershell

python manage.py runserver

```



\---



\# Frontend Setup



Open a new terminal.



Enter the frontend:



```powershell

cd frontend

```



Install dependencies:



```powershell

npm install

```



Start the development server:



```powershell

npm run dev

```



The frontend will display the local development address provided by Vite.



\---



\# Environment Variables



Sensitive configuration should be stored in environment variables.



The project intentionally excludes environment files from Git.



The `.gitignore` contains:



```text

.env

```



The backend environment file should be stored locally as:



```text

backend/.env

```



Never commit production secrets to GitHub.



Typical production configuration may include values such as:



```text

SECRET\_KEY

DEBUG

DATABASE\_URL

ALLOWED\_HOSTS

CORS\_ALLOWED\_ORIGINS

```



The exact variables required depend on the deployment configuration.



\---



\# Database



SQLite is suitable for local development and testing.



The local SQLite database is intentionally ignored by Git:



```text

db.sqlite3

```



This means the database file should not be committed to the repository.



For production deployment, PostgreSQL is recommended.



Production database migrations should be applied using:



```powershell

python manage.py migrate

```



\---



\# Development



A typical development workflow is:



```text

1\. Start Django backend

2\. Start React frontend

3\. Develop/test the feature

4\. Run migrations when models change

5\. Test API endpoints

6\. Test frontend functionality

7\. Review Git changes

8\. Commit changes

9\. Push to GitHub

```



Backend:



```powershell

cd backend

python manage.py runserver

```



Frontend:



```powershell

cd frontend

npm run dev

```



\---



\# Production Deployment



EduManageERP is intended to be deployable as a separate frontend and backend application.



A typical production architecture is:



```text

&#x20;                   Internet

&#x20;                      │

&#x20;                      ▼

&#x20;             ┌─────────────────┐

&#x20;             │   React Frontend │

&#x20;             └────────┬────────┘

&#x20;                      │

&#x20;                      │ HTTPS / REST API

&#x20;                      ▼

&#x20;             ┌─────────────────┐

&#x20;             │ Django Backend  │

&#x20;             │ Django REST API │

&#x20;             └────────┬────────┘

&#x20;                      │

&#x20;                      ▼

&#x20;             ┌─────────────────┐

&#x20;             │   PostgreSQL    │

&#x20;             │    Database     │

&#x20;             └─────────────────┘

```



The frontend and backend can be deployed separately.



Possible production components include:



\* React static hosting

\* Django application hosting

\* PostgreSQL database

\* HTTPS

\* Domain name

\* Media/static file storage



Production deployment should use environment variables for secrets and database configuration.



\---



\# Security



Security is an important part of EduManageERP.



The project follows several security principles:



\* Environment secrets are excluded from Git.

\* SQLite database files are excluded from Git.

\* Virtual environments are excluded from Git.

\* Node modules are excluded from Git.

\* Backend permissions are enforced server-side.

\* School data should be scoped to the appropriate school.

\* Role permissions should be validated by the backend.

\* Sensitive configuration should not be hard-coded.

\* Production deployments should use HTTPS.

\* Production deployments should use secure database credentials.



Never commit:



```text

.env

db.sqlite3

API keys

database passwords

secret keys

private credentials

```



\---



\# Git and GitHub



The project repository is hosted on GitHub:



\*\*SCHOOL-MANAGEMENT-SYSTEM\*\*



Repository:



https://github.com/1ECA1/SCHOOL-MANAGEMENT-SYSTEM.git



The project uses Git for version control.



Before committing changes, review:



```powershell

git status

```



Stage changes:



```powershell

git add .

```



Review staged changes:



```powershell

git diff --cached --stat

```



Commit:



```powershell

git commit -m "Update EduManageERP system"

```



Push:



```powershell

git push origin main

```



\---



\# Project Status



EduManageERP is currently under active development.



The system already contains substantial functionality across:



\* Authentication

\* User roles

\* School administration

\* Academics

\* Students

\* Teachers

\* Parents/Guardians

\* Attendance

\* Assignments

\* Examinations

\* Results

\* Finance

\* Library

\* Notifications

\* Audit

\* Promotion

\* Graduation

\* Role-specific portals

\* Public school website

\* Online admission workflows

\* Parent communication



The application is being developed incrementally, with additional modules and production infrastructure planned.



\---



\# Future Development



Planned and ongoing development may include:



\* Production deployment

\* PostgreSQL integration

\* Cloud media storage

\* Email notifications

\* SMS notifications

\* Advanced reporting

\* Advanced audit dashboards

\* Online/CBT examinations

\* Timetable management

\* Hostel management

\* Transport management

\* Communication features

\*

\* Advanced analytics

\* Automated backups

\* Improved security monitoring

\* API documentation

\* Automated testing

\* CI/CD deployment



\---



\# Contributing



EduManageERP is currently under active development.



Before making changes:



1\. Pull the latest changes.

2\. Create a feature branch when appropriate.

3\. Make the required changes.

4\. Test both backend and frontend functionality.

5\. Review the Git diff.

6\. Commit the changes with a clear message.

7\. Push the branch.

8\. Create a pull request when collaborative development is enabled.



\---



\# License



The licensing terms for EduManageERP have not yet been finalized.



Until a license is explicitly added to the repository, the source code should be treated as \*\*all rights reserved\*\*.



\---



\## EduManageERP



\*\*School Management • Academic Management • Student Management • Finance • Examinations • Results • Administration\*\*



Built with \*\*Django REST Framework + React\*\*.



