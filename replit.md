# Minecraft Bot Dashboard

## Overview

This is a full-stack web application that provides a Discord-style interface for controlling and monitoring a Minecraft bot. The application allows users to manage bot connections, send commands, view chat messages, and monitor bot status in real-time. Built with a modern React frontend and Express backend, it features WebSocket communication for live updates and uses Drizzle ORM for database operations.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The client uses React with TypeScript and follows a component-based architecture:
- **UI Framework**: Built with shadcn/ui components and Radix UI primitives for consistent, accessible design
- **Styling**: Tailwind CSS with a custom Discord-inspired dark theme
- **State Management**: TanStack Query for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Real-time Updates**: Custom WebSocket hook for live chat and status updates

### Backend Architecture
The server follows an Express.js REST API pattern with WebSocket support:
- **API Layer**: Express routes handling bot controls, chat messages, and status endpoints
- **Bot Integration**: Mineflayer library for Minecraft bot functionality with auto-reconnection
- **WebSocket Server**: Real-time bidirectional communication for chat messages and status updates
- **Storage Layer**: Abstracted storage interface supporting both in-memory and database implementations

### Data Storage Solutions
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Schema**: Two main tables - chat_messages for storing conversations and bot_status for tracking bot state
- **Fallback Storage**: In-memory storage implementation for development or when database is unavailable
- **Migrations**: Drizzle Kit for database schema management and migrations

### Real-time Communication
- **WebSocket Integration**: Server broadcasts chat messages and status updates to all connected clients
- **Message Types**: Structured WebSocket messages for chat, status updates, commands, and errors
- **Auto-reconnection**: Client automatically reconnects to WebSocket server if connection is lost

### Build and Development
- **Frontend Build**: Vite for fast development and optimized production builds
- **Backend Build**: ESBuild for server bundling with ES modules support
- **TypeScript**: Shared types between client and server for type safety
- **Path Aliases**: Organized imports with @ prefixes for cleaner code structure

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL serverless driver for database connectivity
- **mineflayer**: Minecraft bot creation and management library
- **ws**: WebSocket implementation for real-time communication
- **drizzle-orm**: Type-safe ORM for database operations
- **express**: Node.js web framework for REST API

### UI and Frontend
- **@radix-ui/***: Comprehensive collection of unstyled, accessible UI primitives
- **@tanstack/react-query**: Server state management and caching
- **tailwindcss**: Utility-first CSS framework
- **lucide-react**: Icon library for consistent iconography
- **react-hook-form**: Form state management and validation

### Development Tools
- **vite**: Frontend build tool and development server
- **tsx**: TypeScript execution for development
- **drizzle-kit**: Database schema management and migration tool
- **wouter**: Lightweight React router
- **clsx**: Utility for conditional CSS classes