# CISM Client

The customer-facing application for the **Canteen Integrated System of Management (CISM)**. Built with Next.js, this app allows students, staff and teachers to browse stalls, place orders, track deliveries, and manage their profile.

## System Overview

CISM is a multi-platform ecosystem designed to streamline canteen operations:

- **Client App (this repo)**: Mobile-optimized web app for customers to browse, order, and chat.
- **Stall App**: Management dashboard for stall owners to process orders and manage inventory.
- **Core Backend**: Robust Spring Boot API handling business logic, security, and real-time WebSocket communication.

## Getting Started

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Run the development server:**
   ```bash
   pnpm dev
   ```

3. **Access the app:**
   Open [http://localhost:3000](http://localhost:3000)

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4
- **Icons:** Lucide React
- **State Management:** React Query 5
- **Validation:** Zod
- **Notifications:** React Hot Toast
- **API Client:** Axios
- **Real-time:** WebSockets (StompJS & SockJS)

## Features

- **Authentication** - Secure login and registration with OAuth 2.0 and JWT
- **Smart Discovery** - Browse items by categories like Trending, Fresh Drops, and Budget Picks (under Php 50)
- **Interactive Menu** - Explore stall-specific menus with detailed product information and high-quality images
- **School Essentials** - Dedicated section for uniforms, school IDs, and campus-specific business items
- **Global Search** - Instant search functionality for items, categories, and stall names
- **Cart & Checkout** - Manage multiple items with real-time stock validation and secure checkout process
- **Order Management** - Place orders, track real-time delivery status, and view comprehensive order history
- **Notifications** - Real-time push notifications for order updates, status changes, and new messages
- **Live Chat** - Real-time messaging system for direct communication between customers and stall owners
- **Ratings & Reviews** - Share feedback and rate products to help other students discover the best finds
- **Account Management** - Manage user profile and personal settings

## How It Works

1. **Browse & Search** - Find delicious meals or school essentials using the filters or global search.
2. **Add to Cart** - Select your favorite items, select the item variations (if any), and add them to your cart.
3. **Place Order** - Choose your delivery method (Pick-up or Delivery) and place your order.
4. **Real-time Tracking** - Monitor your order status from preparation to delivery and chat with the stall owner if you have questions.
