**AI ID Verification System**
Overview

This project is a complete end-to-end ID verification system powered by AI.
The user uploads the front side of an ID card, and the system analyzes it using OpenAI to determine authenticity and extract key data fields.

The system consists of:

A React frontend for uploading ID cards and viewing results

A Node.js GraphQL backend for handling requests and storing verification history

A Python FastAPI service for image preprocessing and AI-based ID verification

Architecture Summary

Frontend (React)

Uploads the ID card

Calls GraphQL mutation verifyID

Displays verdict, extracted fields, and reports

Backend (Node + GraphQL + Prisma)

Receives image upload via Upload scalar

Sends the image to Python for verification

Stores results in PostgreSQL

Provides APIs for verification history

Python FastAPI Service

Preprocesses the image

Runs OpenAI-based ID verification

Returns structured JSON output

Technologies Used

React (CRA)

Apollo Client

Node.js + Express

GraphQL (Apollo Server)

Prisma ORM

PostgreSQL

Python FastAPI

OpenAI API

Folder Structure
project-root/
│── frontend/        React UI
│── backend/         Node.js + GraphQL + Prisma
│── backend/python-service/   FastAPI + AI verification

How to Run
1. Start Python Service

Inside backend/python-service:

pip install -r requirements.txt
uvicorn main:app --reload --port 8001

2. Start Backend

Inside backend:

npm install
npx prisma migrate dev
npm run dev


Backend runs on:

http://localhost:4000/graphql

3. Start Frontend

Inside frontend:

npm install --legacy-peer-deps
npm start


Frontend runs on:

http://localhost:3000

Environment Variables

Each service uses its own .env file (not included in GitHub).

Backend .env:

DATABASE_URL=postgres://...
PYTHON_SERVICE_URL=http://localhost:8001/verify-front
PORT=4000


Python .env:

OPENAI_API_KEY=your_key

Features

Upload front-side ID card for verification

AI-based text extraction, validation, and forgery analysis

Auto-structured JSON output

Clean UI with expandable sections

Persistent verification history

Color-coded status indicators
