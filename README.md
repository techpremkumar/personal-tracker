[README_PREM_AI.md](https://github.com/user-attachments/files/32697912/README_PREM_AI.md)
# PREM AI – Personal Tracker AI Agent

An AI-powered personal productivity assistant built with Java, Spring Boot, Spring AI, Gemini, MySQL, JDBC/JdbcTemplate, HTML, CSS, and JavaScript.

The application lets a user track study progress, expenses, tasks, and daily activity through natural-language conversations instead of manually updating separate records.

## Project Overview

PREM AI acts as a personal tracking assistant. A user can send messages such as:

> I studied Java for 2 hours today.

The application sends the message through a Spring Boot REST API to an LLM. The LLM understands the user's intent and can select an appropriate Java tool. The selected tool performs the database operation in MySQL, and the result is returned to the user through the web dashboard.

## Problem Solved

The project combines several personal productivity activities into one application:

- Study tracking
- Expense tracking
- Task management
- Daily progress and summary
- Natural-language interaction with an AI assistant

Instead of maintaining separate notes or applications, the user can interact with one assistant and let the backend store and retrieve the data.

## Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | HTML | Web page structure |
| Frontend | CSS | Dashboard styling and responsive UI |
| Frontend | JavaScript | User interaction and REST API calls |
| Backend | Java | Application logic |
| Backend | Spring Boot | REST API and application runtime |
| AI Integration | Spring AI | Connects the Java application to the LLM |
| LLM | Gemini | Natural-language understanding and response generation |
| Agent capability | Tool Calling | Lets the LLM select Java backend tools |
| Database | MySQL | Persistent storage for tracker data |
| Database access | JDBC / JdbcTemplate | SQL execution and database access |
| AI extension | RAG | Planned retrieval layer for relevant personal context |

## Architecture

```text
User
  |
  v
Frontend (HTML / CSS / JavaScript)
  |
  | REST API
  v
Spring Boot Backend
  |
  v
Spring AI
  |
  v
Gemini LLM
  |
  +--------------------+
  |                    |
  v                    v
Tool Calling           RAG
  |                    |
  v                    v
Java Tools        Relevant Context
  |                    |
  +---------+----------+
            |
            v
     MySQL Database
     |      |      |
     v      v      v
  Study  Expenses Tasks
            |
            v
      AI Response
            |
            v
        Dashboard
```

## Current Working Flow

Example request:

> I studied Java for 2 hours today.

1. The user enters the message in the web dashboard.
2. JavaScript sends `POST /track` with JSON.
3. Spring Boot receives the request.
4. Spring AI sends the message to Gemini.
5. Gemini understands that study progress must be recorded.
6. Gemini selects the `saveProgress()` tool.
7. The Java tool executes an SQL `INSERT` through `JdbcTemplate`.
8. MySQL stores the study record.
9. The tool returns a result.
10. Gemini generates a user-facing response.
11. The frontend displays the response.
12. JavaScript calls `GET /summary` to refresh the dashboard.

## Tool Calling

The current backend exposes Java tools for tracker operations, including:

- `saveProgress()`
- `getStudyHoursThisWeek()`
- `saveExpense()`
- `getRecentExpenses()`
- `saveTask()`
- `getTasks()`
- `markTaskCompleted()`
- `getTodaySummary()`

The LLM does not directly access MySQL. It selects the appropriate Java tool, and the Java backend performs the actual database operation.

## Retrieval

The application retrieves data using SQL `SELECT` queries through `JdbcTemplate`.

Examples:

```sql
SELECT * FROM study_progress;
```

```sql
SELECT COALESCE(SUM(hours), 0)
FROM study_progress
WHERE YEARWEEK(created_at, 1) = YEARWEEK(CURDATE(), 1);
```

```sql
SELECT * FROM expenses
ORDER BY created_at DESC;
```

```sql
SELECT * FROM tasks
ORDER BY created_at DESC;
```

## RAG

RAG (Retrieval-Augmented Generation) is the planned personalization layer of the project.

The intended flow is:

```text
User question
    |
    v
Retriever
    |
    v
Relevant personal context
    |
    v
LLM
    |
    v
Personalized response
```

The current working application already implements LLM integration, tool calling, MySQL storage, and retrieval through backend tools. A vector-store-based RAG layer is a future extension rather than a fully completed part of the current implementation.

## REST Endpoints

### Health / welcome

```http
GET /hello
```

### AI tracking endpoint

```http
POST /track
Content-Type: application/json
```

Request:

```json
{
  "message": "I studied Java for 2 hours today"
}
```

### Dashboard summary

```http
GET /summary
```

Example response:

```text
Today's Summary:
Study Hours: 13.0
Total Expenses: ₹350.0
Pending Tasks: 0
Completed Tasks: 2
```

## Database

Database: `personal_tracker`

Main tables:

### study_progress

Stores study activity.

Typical fields:

```text
id
subject
hours
created_at
```

### expenses

Stores expense records.

Typical fields:

```text
id
amount
category
description
created_at
```

### tasks

Stores personal tasks.

Typical fields:

```text
id
task
status
created_at
```

## Project Structure

```text
personal-tracker/
├── pom.xml
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/personaltracker/personal_tracker/
│   │   │       ├── PersonalTrackerApplication.java
│   │   │       ├── TrackController.java
│   │   │       ├── TrackerTools.java
│   │   │       ├── TrackRequest.java
│   │   │       └── AiController.java
│   │   │
│   │   └── resources/
│   │       ├── application.properties
│   │       └── static/
│   │           ├── index.html
│   │           ├── style.css
│   │           └── script.js
│   │
│   └── test/
│
└── README.md
```

## Local Setup

### 1. Clone the repository

```bash
git clone <your-repository-url>
cd personal-tracker
```

### 2. Configure MySQL

Create the database:

```sql
CREATE DATABASE personal_tracker;
USE personal_tracker;
```

Create the required tables according to the current Java SQL statements in `TrackerTools.java`.

### 3. Configure environment variables

Set the Gemini API key as an environment variable rather than committing the key to GitHub.

Windows PowerShell example:

```powershell
$env:GEMINI_API_KEY="YOUR_KEY_HERE"
```

Keep database credentials out of source control as well.

### 4. Run the application

From the project root:

```powershell
cd D:\personal-tracker
mvn clean
mvn spring-boot:run
```

Open:

```text
http://localhost:8080/
```

## Important Security Rule

Never commit any real API key or database password to GitHub.

Recommended `.gitignore` entries:

```gitignore
.env
*.env
application-local.properties
```

Use environment variables or local, untracked configuration for secrets.

## Example User Interactions

```text
I studied Java for 2 hours today
```

```text
How many hours did I study this week?
```

```text
I spent 150 rupees for lunch today
```

```text
Show me my recent expenses
```

```text
Add a task to revise Spring Boot
```

```text
Show me my tasks
```

```text
Mark task 2 as completed
```

```text
Give me today's summary
```

## What This Project Demonstrates

- Java backend development
- Spring Boot REST API development
- Spring AI integration
- LLM integration with Gemini
- AI tool calling
- Natural-language application control
- MySQL data persistence
- JDBC / JdbcTemplate
- Frontend and backend integration
- Retrieval of application data
- Agent-style application architecture
- Foundations for RAG and personalized AI

## Current Status

### Working

- Spring Boot backend
- Gemini LLM integration
- AI chat through `/track`
- Tool calling
- Study tracking
- Expense tracking
- Task creation and retrieval
- Task completion
- Daily summary
- MySQL persistence
- Web dashboard
- Frontend-to-backend integration

### Next Improvements

- Complete vector-store-based RAG
- Add richer historical analytics
- Add dedicated Study / Expenses / Tasks pages
- Add authentication and user accounts
- Add charts and trends
- Add automated reminders
- Add production deployment

## Architecture Diagram

Add the project architecture image as:

```text
docs/architecture.png
```

Then embed it in this README with:

```markdown
![PREM AI Architecture](docs/architecture.png)
```

## Author

**Prem Kumar V**

Personal project focused on combining Java backend development with LLMs, tool calling, RAG concepts, and data-driven personal productivity.
