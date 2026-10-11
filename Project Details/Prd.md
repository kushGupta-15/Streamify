# Product Requirements Document

## Product overview

Streamify is a full-stack language exchange platform. It connects users who want to practice a language with users who already speak it, and gives them the tools to talk: chat and video calls, built on the Stream Chat and Stream Video SDKs.

Stack: React frontend, Node/Express backend, MongoDB for data, JWT auth via httpOnly cookies.

## Problem statement

Learning a language from a textbook or app doesn't get you conversation practice with a real person. Language exchange as a concept solves this, but most existing platforms are clunky, ad-heavy, or don't make it easy to find someone to actually talk to. Streamify aims to be a lightweight platform where finding a practice partner and starting a conversation takes minutes, not days.

## Goals

- Let a user sign up, complete onboarding, and find other users to connect with.
- Support real-time chat and video calls between connected users.
- Manage the connection lifecycle: sending, accepting, and tracking friend requests.
- Keep the codebase and its documentation honest about what's built versus what's planned.

## Target users

- Language learners looking for conversation practice with native or fluent speakers.
- Native speakers of one language who want to learn another, and are open to a reciprocal exchange.
- Recruiters and engineers reviewing this as a portfolio project, assessing real-world full-stack skills: auth, real-time communication, state management, and API design.

## Core features

- **Authentication & Security**: signup and login with JWT stored in httpOnly cookies, password hash non-disclosure (`select: false` and serializer transforms), brute-force rate limiting via `express-rate-limit`, and Helmet HTTP security headers.
- **Onboarding & Profile Security**: required profile-completion step, gated by an `isOnboarded` flag, protected by strict field whitelisting to prevent mass assignment vulnerabilities.
- **User discovery**: a recommended-users list surfaces other signed-up users to connect with without leaking private credentials.
- **Friend requests & Social Lifecycle**: users can send requests, cancel pending outgoing requests, accept or decline incoming requests, unfriend connected users, and dismiss connection notices.
- **Responsive Layout & Navigation**: seamless mobile experience with a sticky bottom navigation bar and adaptive header alongside the desktop sidebar.
- **Real-time chat**: one-to-one messaging via Stream Chat, restricted to authorized friend pairs, with live in-chat call notification banners and explicit socket disconnect lifecycle cleanup.
- **Video calls**: one-to-one video calling via Stream Video with caller auto-redirect, incoming call join prompt, friendship verification, and resilient device resource cleanup.
- **Route protection & Access Verification**: authenticated and onboarding-gated routes, backed by server-side verification endpoints for chat and video channels to prevent unauthorized access.