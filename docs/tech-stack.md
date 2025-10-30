# PlayNite: Technology Stack

This document provides a detailed overview of the technologies used to build the PlayNite application.

## 1. Frontend

*   **Framework**: **Next.js 15 (App Router)**
    *   **Reasoning**: Chosen for its high-performance, server-first rendering capabilities, which improve load times and SEO. The App Router provides a flexible and powerful way to structure the application with nested layouts and server components.

*   **Language**: **TypeScript**
    *   **Reasoning**: Ensures type safety and code quality, making the codebase more robust, maintainable, and less prone to runtime errors.

*   **Styling**: **Tailwind CSS** with **ShadCN UI**
    *   **Reasoning**: Tailwind CSS allows for rapid UI development with a utility-first approach. ShadCN provides a set of beautifully designed, accessible, and customizable React components that are built on top of Tailwind CSS and Radix UI, accelerating development without locking us into a specific design system.

*   **UI Components**:
    *   **Radix UI**: The underlying primitives for our accessible components (Dropdowns, Dialogs, etc.).
    *   **Lucide React**: For a clean and extensive set of icons.

*   **State Management**: **React Hooks** (`useState`, `useEffect`, `useContext`)
    *   **Reasoning**: For most scenarios, React's built-in hooks are sufficient and lightweight. Global state (like the authenticated user) is managed through a custom Firebase context provider.

## 2. Backend & Database

*   **Platform**: **Firebase**
    *   **Reasoning**: Provides a comprehensive suite of backend services that are easy to integrate and scale.

*   **Authentication**: **Firebase Authentication**
    *   **Providers**: Email/Password and Google Sign-In.
    *   **Reasoning**: Offers a secure, easy-to-implement, and free authentication solution with built-in UI flows and robust security.

*   **Database**: **Firestore**
    *   **Reasoning**: A flexible, scalable NoSQL database with real-time data synchronization capabilities. Its security rules provide granular control over data access, which is critical for a multi-user application.

## 3. Generative AI

*   **Framework**: **Genkit**
    *   **Reasoning**: An open-source framework from Google that simplifies the development of AI-powered features. It provides a structured way to define AI flows, prompts, and tools.

*   **AI Model**: **Google Gemini (via the `google-genai` plugin)**
    *   **Reasoning**: A powerful and versatile multimodal AI model capable of handling a wide range of tasks, from text summarization and tag generation to content moderation.

*   **AI Features Implemented**:
    *   **Video Summarization**: AI-generated summaries for video descriptions.
    *   **Automated Tagging**: AI suggests relevant tags based on video content.
    *   **Search Suggestions**: AI provides intelligent search query suggestions.
    *   **Content Moderation**: An AI flow to check content against policies.

## 4. Development & Tooling

*   **Package Manager**: **npm**
*   **Testing**: **Jest** and **React Testing Library** for unit and component testing.
*   **Linting/Formatting**: Handled by the Next.js integrated ESLint configuration.
*   **Development Environment**: Firebase Studio, providing a cloud-based IDE with integrated tooling and deployment.
