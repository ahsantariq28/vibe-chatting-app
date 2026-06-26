# Vibe

A real-time chat application built with modern web technologies.

## Features

- 🔐 **Authentication**: Secure user authentication with NextAuth.js
- 💬 **Real-time Messaging**: Instant message delivery with Socket.io
- 📸 **Image Upload**: Send and receive images in conversations
- 🗨️ **Typing Indicators**: See when someone is typing
- ✅ **Read Receipts**: Know when your messages have been read
- 🟢 **Online Status**: See which users are currently online
- 📱 **Responsive Design**: Works on desktop and mobile devices
- 🎨 **Customizable Profiles**: Update your name and avatar
- 🗑️ **Message Deletion**: Delete your own messages
- 🎯 **Conversation List**: Keep track of all your chats

## Tech Stack

### Frontend

- **Next.js 14** - React framework for production
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Socket.io Client** - Real-time communication

### Backend

- **Node.js** - JavaScript runtime
- **Express/Next.js API Routes** - Server-side logic
- **Socket.io** - Real-time bidirectional communication
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB
- **NextAuth.js** - Authentication library
- **bcryptjs** - Password hashing

## Prerequisites

- Node.js 18+
- MongoDB (local or cloud)
- npm or yarn

## Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd vibe-chatting-app
```

2. Install dependencies:

```bash
npm install
```

3. Copy the environment example file:

```bash
cp .env.local.example .env.local
```

4. Update the `.env.local` file with your configuration:

```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/vibe-chat

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# Optional: Cloudinary for image uploads (if implemented)
# CLOUDINARY_URL=your-cloudinary-url
```

5. Start the development server:

```bash
npm run dev
```

6. Open your browser and navigate to `http://localhost:3000`

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Project Structure

```
src/
├── app/
│   ├── (auth)/          # Authentication pages (login, register)
│   ├── (main)/          # Main app pages (chat)
│   ├── api/             # API routes
│   ├── globals.css      # Global styles
│   └── layout.tsx       # Root layout
├── assets/             # Static assets
├── components/         # React components
├── hooks/              # Custom hooks
├── lib/                # Utility libraries
├── models/             # Mongoose models
├── providers/          # Context providers
└── types/              # TypeScript types
```

## API Routes

### Authentication

- `POST /api/auth/register` - Register a new user
- `GET /api/auth/[...nextauth]` - NextAuth.js endpoints

### Conversations

- `GET /api/conversations` - Get user's conversations
- `POST /api/conversations` - Create a new conversation
- `GET /api/conversations/[id]/messages` - Get messages for a conversation
- `POST /api/conversations/[id]/messages` - Send a new message
- `DELETE /api/conversations/messages/[id]` - Delete a message

### Users

- `GET /api/users` - Search users
- `PATCH /api/users` - Update user profile

## License

MIT
