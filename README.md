# ForensiLock: Secure Digital Evidence Management System

Project for the course 23CSE313 - Foundations of Cyber Security for Lab Evaluation 1

## Project Overview

**ForensiLock** is a secure, role-based Digital Evidence Management System designed for forensic artifacts. The application ensures that digital evidence collected by officers is stored immutably, accessed only by authorized detectives, and audited by Internal Affairs for integrity.

This project was developed to demonstrate practical implementation of core security concepts: Authentication, Authorization (Access Control), Encryption, Hashing, and Encoding.

## Key Features & Security Implementation
This application implements all required security components as defined in the evaluation rubric.

### 1\. Authentication (NIST SP 800-63-2 Compliant)
- **Single-Factor Authentication (SFA):** Username and Password login. Passwords are hashed and salted using scrypt before storage, preventing rainbow table attacks.
- **Multi-Factor Authentication (MFA):** Implemented Time-based One-Time Password (TOTP) using speakeasy. All users (Officer, Detective, IA) must scan a QR code with Google Authenticator during registration. The login flow enforces a two-step verification process (Password → TOTP).
- Passwords are checked for a minimum length of 8 characters.
 - Common passwords (blacklist) and username-based passwords are rejected.
 - Artificial delays are implemented to prevent brute-force attacks.

### 2\. Authorization & Access Control (RBAC)
- **Access Control Matrix:**
 - **Subjects (Roles):**
 - **Officer:** Can WRITE (upload) evidence, ENCRYPT data, and view their _own_ submitted cases (Read-Only).
 - **Detective:** Can READ (view) all evidence, DECRYPT data, and WRITE notes (for a specific evidence or private notes).
 - **Internal Affairs (IA):** Can AUDIT (scan hashes) and VIEW access logs. Cannot view raw decrypted evidence content.
- **Enforcement:** Server Actions verify the session role before executing any database query. Next.js Middleware protects route access.

### 3\. Encryption & Decryption (AES-256-CBC)
- **Data at Rest:** All sensitive fields (Evidence Description, Image Data, Case Notes) are encrypted using **AES-256-CBC**.
- **Key Management:** The encryption key is derived from environment variables (ENCRYPTION_PASSWORD, ENCRYPTION_SALT) using scrypt, ensuring keys are never hardcoded.
- **Initialization Vector (IV):** A unique, random 16-byte IV is generated for _every_ record to prevent pattern analysis attacks (semantic security).
- **Graceful Failure:** The system detects decryption failures (e.g., wrong keys) and returns a specific DECRYPTION_FAILURE flag to the UI instead of crashing or showing garbage data.

### 4\. Secure Key Exchange (Hybrid Cryptosystem)
- **Feature:** Private Notebook for Detectives.
- **Mechanism:**
 - **Symmetric:** The client generates an **AES-GCM-256** key in the browser.
 - **Asymmetric:** This AES key is wrapped (encrypted) using the **Server's RSA Public Key** (loaded from .env).
 - **Exchange:** The wrapped key is sent to the database.
 - **Result:** The server stores the key but cannot use it without the Private Key (which is protected via environment variables).

### 5\. Data Integrity & Tamper Detection (Hashing)
- **Hashing & Salting:** Using `bcrypt` to hash and salt to store passwords.
- **Chain of Custody:** Upon submission, a **SHA-256** hash is generated combining the _Encrypted Description + Category + Encrypted Image_.
- **The Audit Scan:** The Internal Affairs dashboard allows a re-calculation of these hashes. If the current database state does not match the stored hash, the record is flagged as **TAMPERED** in the UI.

### 6\. Encoding
- Binary image data is converted to **Base64** strings before being encrypted and stored. This ensures safe handling of binary blobs within the JSON/text-based database fields.


## Tech Stack
- **Framework:** Next.js
- **Database:** SQLite
- **Language:** TypeScript
- **Styling:** Tailwind CSS (Dark Mode UI)

## Running
Install Dependencies
```
bun install
```
Environment Setup - Create a .env file in the root directory with your RSA keys and Secrets:  
```
JWT_SECRET="your-256-bit-secret"  
ENCRYPTION_PASSWORD="your-strong-password"  
ENCRYPTION_SALT="random-salt-string"  
NEXT_PUBLIC_PUBLIC_KEY="-----BEGIN PUBLIC KEY..."  
PRIVATE_KEY="-----BEGIN PRIVATE KEY..."  
```
Run the Server
```
bun dev
```