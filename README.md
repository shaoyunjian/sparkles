# Sparkles Chat

<p align="center">
  <img src="public/images/sparkles-banner.png" width="350" style="border-radius:5px">
</p>

✨Sparkles Chat provides real-time voice and text communication, allowing you to chat with friends anytime and anywhere.

🔗 Website URL: https://sparklezz.site/

📃 API Documentation: https://app.swaggerhub.com/apis-docs/shaoyunjian/sparkleschat/1.0.0

👤 Test Account and Password:
|  | Account | Password |
| --- | --- | --- |
| ① | sparkles@sparkles.com | 12345678 |
| ② | hina@sparkles.com | 12345678 |


## Table of Contents

- [Main Features](#main-features)
  - [Real-time Text Chat with Socket.IO](#real-time-text-chat-with-socketio)
  - [Real-time Voice Chat with PeerJS](#real-time-voice-chat-with-peerjs)
  - [Image Sharing](#image-sharing)
- [Other Features](#other-features)
  - [User Search](#user-search)
  - [Friend Request](#friend-request)
  - [Avatar Edit](#avatar-edit)
  - [Member System](#member-system)
- [Backend Technique](#backend-technique)
  - [Language / Web Framework](#language--web-framework)
  - [Database](#database)
  - [Cloud Services (AWS)](#cloud-services-aws)
  - [Networking](#networking)
  - [Authentication](#authentication)
  - [MVC Pattern](#architectural-pattern)
  - [Version Control](#version-control)
- [Architecture](#architecture)
- [Database Schema](#database-schema)
- [Frontend Technique](#frontend-technique)
- [API Documentation](#api-documentation)
- [Contact](#contact)



## Main Features
### Real-Time Text Chat with Socket.IO
<img src="public/images/text-msg.gif">

- Use `Socket.IO` for real-time chat.
- Use `Socket.IO` for showing online/offline status.
- Use `Socket.IO` for typing indicator.

<br>

### Real-Time Voice Chat with peer.js
<img src="public/images/voice-chat.gif">

- Use `PeerJS` with WebRTC for real-time voice chat.

### Image Sharing
<img src="public/images/image-msg-2.gif">

- Support image sharing.
- Upload images to S3 if user shares images in chatroom or change their avatar.
- Using `AWS CloudFront` in conjunction with `AWS S3` to store user-uploaded images,<br>
improve the speed and performance of accessing the content.


## Other Features
### User Search
<img src="public/images/user-search.gif" >

### Friend Request
<img src="public/images/friend-request.gif">

- Search friends and send friend requests.
- Add friends or delete friend friend requests.

### Avatar Edit
<img src="public/images/avatar-edit.gif">

- Upload images to S3 if user change their avatar.
- Using `AWS CloudFront` in conjunction with `AWS S3` to store user-uploaded images,<br>
improve the speed and performance of accessing the content.

### Member System
- Authenticate user with `JSON Web Token (JWT)`.
- Use `bcrypt` to hash and verify password.

<br>

## Backend Technique

### Deployment
- Docker
- Setup CI/CD pipeline with GitHub Actions

### Language / Web Framework
- Node.js / Express.js

### Database
- MongoDB / Mongoose

### Cloud Services (AWS)
- EC2
- S3
- CloudFront

### Networking
- HTTP & HTTPS
- Domain Name System (DNS)
- NGINX
- SSL (Let's Encrypt)

### Authentication
- JSON Web Token (JWT)
- Bcrypt

### Version Control
- Git / GitHub

### Architectural Pattern
- MVC pattern

## Architecture
### Server Architecture

<img src="https://user-images.githubusercontent.com/110411867/229297628-5281c586-91f1-4e68-ad57-0fb69bed7a3a.png" width="600px">

<br>

### Socket Architecture

<img src="public/images/socket-architecture.png" width="600px">

## Database Schema
<img src="public/images/sparkles-db-schema.png" width="600px">

## Frontend Technique
- JavaScript
- HTML
- SCSS/CSS
- AJAX
- PeerJS

<img src="public/images/peerjs.png" width="700px">

## API Documentation

https://app.swaggerhub.com/apis-docs/shaoyunjian/sparkleschat/1.0.0

## Contact
☁️ 簡劭芸 Shaoyun Jian 

✉ Email: shaoyunjianfw@gmail.com
