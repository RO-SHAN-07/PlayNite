# PlayNite: Setup and Running Locally

This guide will walk you through the steps to set up the PlayNite project on your local machine and get it running.

## 1. Prerequisites

*   **Node.js**: Ensure you have Node.js (version 18 or later) installed.
*   **npm**: This project uses `npm` as the package manager. It is included with Node.js.
*   **Firebase Account**: You will need a Google account to create and use a Firebase project.

## 2. Firebase Project Setup

This project is configured to work with Firebase. While in Firebase Studio, a project is automatically provisioned for you. To run it outside of the Studio environment, you would typically follow these steps:

1.  **Create a Firebase Project**: Go to the [Firebase Console](https://console.firebase.google.com/) and create a new project.
2.  **Enable Services**:
    *   In the "Authentication" section, enable the **Email/Password** and **Google** sign-in methods.
    *   In the "Firestore Database" section, create a new database. Start in **test mode** for initial development (this allows open access).
3.  **Get Config Keys**: In your project settings, find your web app's Firebase configuration keys. You would copy these into the `src/firebase/config.ts` file.

**Note**: When using Firebase Studio, the `firebaseConfig` object in `src/firebase/config.ts` is automatically populated for you.

## 3. Installation

Clone the repository and install the necessary dependencies using `npm`.

```bash
# Navigate to your project directory
cd path/to/playnite

# Install dependencies
npm install
```

## 4. Running the Development Server

Once the dependencies are installed, you can start the Next.js development server.

```bash
npm run dev
```

This command will start the application in development mode, typically on `http://localhost:9002`.

## 5. Running Genkit AI Flows

The AI features are powered by Genkit. To run the Genkit development server (which makes the AI flows available to the frontend), open a **new terminal window** and run:

```bash
npm run genkit:dev
```

This will start the Genkit server, usually on `http://localhost:4000`. You can visit this URL in your browser to see the Genkit developer UI, where you can inspect and test your AI flows.

**You need both the Next.js server and the Genkit server running simultaneously for all features to work.**

## 6. Seeding the Database (Optional)

The application includes a utility to seed your Firestore database with sample video data. This is useful for quickly populating the app with content for testing and development.

1.  Navigate to the **Creator Studio** page in the application (accessible from the sidebar).
2.  If no videos are present, you will see a "Seed Sample Videos" button.
3.  Click this button to add 20 sample videos to your Firestore database.
