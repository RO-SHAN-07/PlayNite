# PlayNite: Features Deep Dive

This document provides a more detailed look into the core features of the PlayNite application.

## 1. Authentication and User Management

*   **Secure Sign-Up & Login**: Users can register and log in using their email and password or with their Google account, powered by Firebase Authentication.
*   **Account Page**: A dedicated page (`/account`) where users can view their profile information, including their name, email, and bio.
*   **Settings Page**: Users can manage their application preferences on the (`/settings`) page, such as language and playback options.

## 2. Content Discovery

*   **Homepage**: The landing page features a hero section with a featured video, along with carousels for "Trending Now" and "New Releases."
*   **Explore Page**: A central discovery hub (`/explore`) with an AI-generated tag cloud for browsing topics and a list of popular videos.
*   **Categories Page**: Users can browse videos by pre-defined categories like Action, Comedy, and Sci-Fi.
*   **AI-Powered Search**: The global search bar provides intelligent, real-time search suggestions as the user types.

## 3. Social & Community

*   **Creator Profiles**: Every user has a public-facing profile page (`/creator/[id]`) that showcases their uploaded videos and follower count.
*   **Follow System**: Users can follow their favorite creators.
*   **Personalized Feed**: The "Feed" page (`/feed`) is a personalized stream of the latest videos from all creators a user follows.
*   **Notifications**: A real-time notification system alerts users to new content from followed creators.
*   **Video Comments**: Users can post comments on video watch pages.
*   **Likes/Dislikes**: Users can react to videos with a thumbs up or thumbs down.

## 4. Personalized Library (`/library`)

This is the user's personal space within the application.

*   **Favorites**: Users can mark videos as favorites for easy access.
*   **Watch History**: The platform automatically tracks a user's viewing history.
*   **Custom Playlists**: A full-featured playlist system allows users to:
    *   Create, name, and delete playlists.
    *   Add or remove videos from any playlist.
    *   View all videos within a specific playlist.
*   **Memory Bank**: A unique and powerful feature for knowledge management.
    *   Users can create "memory entries"—notes, insights, or quotes—linked to videos or standalone.
    *   Memories can be categorized, tagged, and assigned a priority.
    *   The Memory Bank is fully searchable and filterable, turning passive video consumption into an active learning tool.

## 5. Creator Studio (`/studio`)

*   **Video Management**: A dashboard where users can see a list of all the videos they have uploaded.
*   **Upload Page**: A dedicated page for uploading new video content.
*   **AI-Assisted Uploads**: When uploading, creators can use AI to automatically generate a video description and relevant tags, simplifying the upload process and improving discoverability.
