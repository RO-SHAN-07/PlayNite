# PlayNite: File Structure Guide

This document explains the organization of the PlayNite project directory.

```
.
├── /docs/                # Project documentation
├── /public/              # Static assets (images, fonts, etc.) - Not used in this project
├── /src/
│   ├── /ai/              # Genkit AI flows and configuration
│   │   ├── /flows/       # Individual AI feature implementations
│   │   └── genkit.ts     # Main Genkit configuration
│   │
│   ├── /app/             # Next.js App Router directory
│   │   ├── /(routes)/    # Each folder represents a URL route
│   │   │   └── page.tsx  # The main component for that route
│   │   ├── globals.css   # Global styles and Tailwind CSS layers
│   │   └── layout.tsx    # The root layout for the entire application
│   │
│   ├── /components/      # Reusable React components
│   │   ├── /ui/          # Core UI components from ShadCN (Button, Card, etc.)
│   │   └── (custom)/     # Custom components like Header, VideoCard, etc.
│   │
│   ├── /firebase/        # Firebase configuration and custom hooks
│   │   ├── /auth/        # Authentication-related hooks
│   │   ├── /firestore/   # Firestore-related hooks (useDoc, useCollection)
│   │   ├── client-provider.tsx # Client-side Firebase initializer
│   │   ├── config.ts     # Firebase project configuration keys
│   │   ├── index.ts      # Barrel file for exporting all Firebase utilities
│   │   └── provider.tsx  # Core Firebase context provider
│   │
│   ├── /hooks/           # Custom React hooks (e.g., use-mobile, use-toast)
│   │
│   └── /lib/             # Utility functions, data types, and constants
│       ├── data.ts       # TypeScript interfaces for all data models (Video, User, etc.)
│       └── utils.ts      # General utility functions (like `cn` for classnames)
│
├── next.config.ts        # Next.js configuration file
├── package.json          # Project dependencies and scripts
├── tailwind.config.ts    # Tailwind CSS configuration
└── tsconfig.json         # TypeScript configuration
```

## Key Directories Explained

*   **`src/app`**: This is the heart of the application, where all pages and layouts are defined using the Next.js App Router. Each folder inside `src/app` corresponds to a URL segment.

*   **`src/components`**: This folder contains all the React components. It's divided into `ui` for the ShadCN base components and custom components built for this specific application (e.g., `video-player.tsx`, `app-sidebar.tsx`).

*   **`src/firebase`**: All Firebase-related code is centralized here. This includes the initialization logic, context providers for making Firebase available throughout the app, and custom hooks (`useUser`, `useDoc`, `useCollection`) that simplify interaction with Firebase services.

*   **`src/ai`**: This directory houses all the Genkit-powered AI features. Each major feature (like video summarization or content moderation) has its own file in the `flows` sub-directory, keeping the AI logic organized and modular.

*   **`src/lib`**: A folder for shared utilities, constants, and type definitions. The most important file here is `data.ts`, which provides TypeScript interfaces for all the data structures used in Firestore, ensuring data consistency across the application.
