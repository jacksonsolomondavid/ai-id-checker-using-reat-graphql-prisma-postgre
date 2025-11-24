AI ID Verification Frontend
Overview

This React-based frontend provides a clean and modern interface for uploading ID cards and performing AI-powered authenticity checks.
It communicates with a Node.js GraphQL backend, which then communicates with a Python FastAPI service for verification.

The frontend is responsible for:

Uploading the front-side photo of an ID card

Triggering the backend GraphQL mutation verifyID

Displaying parsed ID fields such as Name, DOB, ID Number, Gender, etc.

Rendering the full AI verification report

Showing collapsible sections for:

Text Format Checks

Visual Forgery Checks

Security Features

Raw OCR Text

Displaying check results with status colors (Green for PASSED, Red for FAILED)

Fetching and showing verification history from the backend

Tech Stack
Component	Description
React (CRA)	Frontend framework for UI components
Apollo Client	Sends GraphQL queries and mutations
GraphQL Upload Client	Enables file uploads over GraphQL
CSS	Custom responsive styling
Node.js Backend	Handles API logic and stores results via Prisma
Python FastAPI	Runs AI ID verification using OpenAI
How the Frontend Works
1. User selects an ID card image

The user uploads the front side of the ID card using the file input inside App.jsx.

2. Apollo Upload Client processes the file

apollo-upload-client automatically converts the uploaded file into a GraphQL Upload scalar.

3. GraphQL mutation is triggered

The frontend sends the following mutation to the backend:

mutation($front: Upload!) {
  verifyID(front: $front) {
    verdict
    parsed_id_data
    raw_json
    created_at
  }
}

4. Backend receives and processes the image

The Node backend:

Saves the uploaded file temporarily

Sends the image to the Python verification service

Receives AI-generated results

Stores them in PostgreSQL via Prisma

Responds back with the final verification object

5. Frontend displays the results

The React UI then shows:

Verdict (Original or Fake)

Parsed fields from the ID

Dropdown sections with full check results

Raw OCR extracted text

Security feature evaluation

Timestamp of verification

Status coloring:

PASSED = Green

FAILED = Red

Folder Structure
frontend/
│── public/
│── src/
│   ├── App.jsx
│   ├── index.js
│   ├── apolloClient.js
│   ├── style.css
│   └── components/     (optional future expansion)
│── package.json
│── README.md

How to Run the Frontend
1. Install dependencies

Run inside the frontend folder:

npm install --legacy-peer-deps


The flag is required because apollo-upload-client uses older peer dependencies.

2. Start the React development server
npm start


The app will be available at:

http://localhost:3000


Make sure your backend and Python services are also running:

Backend (inside backend folder):

npm run dev


Python service (inside python-service folder):

uvicorn main:app --reload --port 8001

Configuration

The GraphQL API endpoint used by the frontend is:

http://localhost:4000/graphql


Configured in src/apolloClient.js:

createUploadLink({
  uri: "http://localhost:4000/graphql"
});


Change this if deploying to cloud environments.

UI Features

Clean card-based layout

Large image upload area

Loading indicator during verification

Full verification details panel

Expandable dropdown sections

Color-coded check statuses

Error handling UI

Fully responsive design

Important Files
App.jsx

Handles:

Image upload

Calling the GraphQL mutation

Rendering all results

apolloClient.js

Sets up:

Apollo Client

Upload Link

GraphQL connectivity

style.css

Contains:

Layout

Typography

Card design

Color styles

Dropdown animations
