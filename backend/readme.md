AI ID Verification Backend
Overview

This backend is a Node.js + GraphQL + Prisma service that acts as the core API layer for the AI ID Verification system.
It accepts ID card images from the frontend, communicates with the Python FastAPI service for AI analysis, stores results in PostgreSQL, and exposes them via GraphQL.

The backend is responsible for:

Receiving ID card uploads via GraphQL Upload scalar

Sending uploaded images to the Python verification API

Saving AI-generated results into the PostgreSQL database using Prisma ORM

Exposing queries to fetch verification history

Exposing the verifyID mutation used by the frontend

Managing environment variables and secure configuration

Tech Stack
Component	Purpose
Node.js + Express	Core backend server
Apollo Server (GraphQL)	API layer for queries and mutations
Prisma ORM	Database access layer
PostgreSQL	Persistent storage for verification history
Axios	Sends images to Python FastAPI
graphql-upload-minimal	Handles file uploads via GraphQL
JSON scalar	Stores raw AI JSON output
How the Backend Works
1. Frontend uploads an ID card

The React frontend sends a GraphQL mutation:

verifyID(front: Upload!)


The image is uploaded using the Upload scalar.

2. The backend receives the image

Inside resolvers.js, Apollo receives the file:

Saves the file temporarily inside backend/tmp/

Creates a FormData object

Sends the image to the Python FastAPI service

3. Backend calls Python verification API

Backend sends the file using Axios:

POST http://localhost:8001/verify-front


The Python service:

Preprocesses the image

Calls OpenAI

Generates full JSON verification report

Returns structured data to backend

4. Backend stores results using Prisma

Prisma inserts a new record into PostgreSQL:

verdict

parsed_id_data (JSON)

raw_json (complete AI output)

created_at timestamp

Schema model:

model Verification {
  id            Int      @id @default(autoincrement())
  verdict       String
  parsed_id_data Json?
  raw_json       Json?
  created_at     DateTime @default(now())
}

5. Backend returns result to the frontend

The backend maps database record → GraphQL result:

verdict

parsed ID data

full raw JSON

created timestamp

The React UI renders this automatically.

GraphQL Schema
scalar Upload
scalar JSON

type Verification {
  id: ID!
  verdict: String!
  parsed_id_data: JSON
  raw_json: JSON
  created_at: String!
}

type Query {
  verification(id: ID!): Verification
  recentVerifications(limit: Int): [Verification!]!
}

type Mutation {
  verifyID(front: Upload!): Verification!
}

Important Backend Files
index.js

Initializes Express app

Serves GraphQL endpoint

Loads Prisma client

Applies upload middleware

Connects all resolvers

resolvers.js

Handles:

Receiving file uploads

Sending image to Python API

Parsing AI results

Storing verification in database

Defining Query and Mutation logic

schema.graphql

Defines:

Verification types

Queries

Mutations

Upload and JSON scalars

prisma/schema.prisma

Defines PostgreSQL tables using Prisma ORM.

Folder Structure
backend/
│── graphql/
│   ├── resolvers.js
│   ├── schema.graphql
│
│── prisma/
│   ├── schema.prisma
│   └── migrations/
│
│── python-service/
│   ├── main.py
│   ├── ai_id_verification.py
│   ├── requirements.txt
│
│── tmp/             (temporary uploads)
│── index.js
│── package.json
│── .env
│── README.md

How to Run the Backend
1. Install dependencies
npm install

2. Apply Prisma migrations
npx prisma migrate dev

3. Generate Prisma client
npx prisma generate

4. Start backend server
npm run dev


Server runs at:

http://localhost:4000/graphql

How the Backend Connects to the Python Service

Receives image from frontend

Saves image temporarily

Sends it to FastAPI:

POST /verify-front


Receives JSON output

Saves into PostgreSQL

Sends structured result back to frontend

How the Backend Connects to the Frontend

Frontend calls:

mutation verifyID(front: Upload!)


Backend returns:

Verdict

Parsed ID data

Full AI JSON

Timestamp

Frontend displays everything.
