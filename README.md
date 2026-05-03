# LFMS — Lost & Found Management System
### SE VLabs Institute Campus Solution

## 1. Project Overview
The SE VLabs Institute is a rapidly growing academic organization with a diverse population of students, faculty, and staff. As campus activity increases, the frequency of lost and found incidents has risen significantly. 

### The Problem
Previously, the institute relied on a manual process involving verbal communication, physical notice boards, and informal reporting. This led to:
*   **Mismanagement**: No centralized tracking of items.
*   **False Claims**: Lack of verification for ownership.
*   **Transparency Issues**: Limited visibility for non-registered users.

### The Solution (LFMS)
The Lost & Found Management System (LFMS) is a centralized digital platform developed to streamline the reporting, verification, and recovery of items. It ensures data security through hashed password storage and provides administrative oversight for all public posts.

---

## 2. Software Requirements Specification (SRS)

### 2.1 Functional Requirements
The system implements the following high-priority functional requirements:

| ID | Requirement | Description | Priority |
|---|---|---|---|
| **R1** | User Registration | Students/Staff can register with unique IDs and hashed passwords. | High |
| **R2** | User Login | Secure authentication with a 3-attempt lockout and security question fallback. | High |
| **R3** | Search Directory | Multi-criteria search (Name, Category, Location, Date) for all users. | High |
| **R4** | Post Lost Item | Registered users can report lost items with optional image uploads. | High |
| **R5** | Post Found Item | Users report found items; requires Admin verification before going public. | High |
| **R6** | Claim Item | Registered users can submit ownership proof for found items. | High |
| **R7** | Admin Approval | Centralized control for verifying posts and approving ownership claims. | High |

### 2.2 Non-Functional Requirements
*   **Security**: Accessible only within the Institute LAN. Passwords are never stored in plain text (Bcrypt hashing).
*   **Performance**: Supports at least 50 concurrent users with 24/7 availability.
*   **Usability**: Minimalist, high-end "Navy & Gold" interface for intuitive navigation.
*   **Reliability**: Centralized SQLite database ensuring consistent record maintenance.

---

## 3. System Architecture & Modeling

### 3.1 Use Case Modeling
The system distinguishes between three primary actors:
1.  **Student (Registered User)**: Can post items, submit claims, and manage their personal dashboard.
2.  **Administrator**: Responsible for verifying every post, approving claims, and managing account suspensions.
3.  **Guest User**: Can browse the public directory and search for items but cannot interact with posts.

### 3.2 Security Mechanisms
*   **Account Protection**: If an incorrect password is entered three times, the system invokes a security question.
*   **Suspension**: Failure to answer the security question correctly results in account suspension, requiring Admin intervention for reactivation.

---

## 4. Visual Walkthrough (Screenshots)

### 4.1 Public Directory & Home Page
The home page provides a centralized view of all verified items. Users can filter by category or type (Lost/Found).
![Home Page Preview](/Users/papalial/.gemini/antigravity/brain/84f4bd34-2a5b-4365-829d-4798cfd049a3/media__1777838434320.png)

### 4.2 Secure Registration
New users must provide an institute email and set an account recovery question.
![Registration Interface](/Users/papalial/.gemini/antigravity/brain/84f4bd34-2a5b-4365-829d-4798cfd049a3/media__1777802334480.png)

### 4.3 Reporting an Item
The reporting form ensures all necessary metadata (location, date, category) is captured for the Admin to review.
![Report Form](/Users/papalial/.gemini/antigravity/brain/84f4bd34-2a5b-4365-829d-4798cfd049a3/media__1777831378331.png)

### 4.4 User Dashboard
Registered users can track the status of their posts and claim requests in real-time.
![Dashboard Overview](/Users/papalial/.gemini/antigravity/brain/84f4bd34-2a5b-4365-829d-4798cfd049a3/media__1777802324827.png)

---

## 5. Technical Stack
*   **Frontend**: Next.js 15 (App Router), HTML5, Vanilla CSS.
*   **Backend**: Node.js, SQLite (Direct SQL for stability).
*   **Security**: JWT for session management, Bcrypt for password hashing.
*   **Environment**: Optimized for Institute LAN deployment.

## 6. Conclusion
The LFMS provides a structured, transparent, and secure solution for the SE VLabs Institute. By replacing informal communication with a centralized portal, the system ensures faster item recovery and administrative accountability.
