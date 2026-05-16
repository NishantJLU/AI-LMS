# AI-LMS Platform
**AI-powered Learning Management System built with Next.js 15, TypeScript, PostgreSQL and OpenAI**

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue?style=for-the-badge&logo=postgresql)
![OpenAI](https://img.shields.io/badge/OpenAI-AI-green?style=for-the-badge&logo=openai)
![Prisma](https://img.shields.io/badge/Prisma-ORM-indigo?style=for-the-badge&logo=prisma)
![License](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)

## 🌟 Features
- **AI Quiz Generation**: Automatically generate quizzes from course content using OpenAI.
- **Course Management**: Create, edit, and organize courses with a clean UI.
- **Student Dashboard**: Track progress, view upcoming assignments, and access learning materials.
- **Authentication**: Secure student and teacher login using Auth.js (NextAuth).

## 🚀 Getting Started

### 📋 Prerequisites
- Node.js 18+
- PostgreSQL database

### 📦 Installation
1. **Clone the repository:**
   ```bash
   git clone https://github.com/NishantJLU/AI-LMS.git
   cd AI-LMS
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Set up environment variables:**
   Create a `.env` file in the root directory and add:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/ai_lms"
   OPENAI_API_KEY="your_openai_api_key"
   NEXTAUTH_SECRET="your_nextauth_secret"
   ```
4. **Initialize the database:**
   ```bash
   npx prisma migrate dev
   ```
5. **Run the development server:**
   ```bash
   npm run dev
   ```

## 🌐 Live Demo
*Coming Soon (Vercel)*

## 🤝 Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

## 📜 License
This project is licensed under the MIT License.
