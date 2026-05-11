# Orion Assistant

Orion Assistant is an AI-powered study assistant web application that helps students upload study materials and generate summaries, important notes, MCQs, exam questions, advanced questions, and chat-based answers.

The project is designed for students who want to quickly convert PDFs, notes, documents, and scanned study material into exam-focused learning content.

## Features

- User login and signup system
- JWT-based authentication
- Upload PDF, DOCX, TXT, PNG, JPG, JPEG, and WEBP files
- OCR support for scanned/image-based notes
- Fast Notes with page range selection
- Full notes generation
- Summary generation
- MCQ generation
- Exam question generation
- Advanced question generation
- Chat with uploaded notes
- Saved notes system using SQLite
- Generation history using SQLite
- Clean React interface with draggable result panels

## Project Structure

```txt
Orion Assistant/
│
├── backend/
│   ├── main.py
│   ├── ocr_utils.py
│   ├── requirements.txt
│   ├── .env.example
│   └── venv/                 # ignored
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── node_modules/         # ignored
│
├── .gitignore
└── README.md
