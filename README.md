# GrabbCMS

GrabbCMS is a custom CMS built using FireCMS for managing products, users, promotions, and various other collections associated with the Grabb platform. The CMS provides an admin interface with real-time Firebase integration to manage content effectively.

## Features
* Firebase Authentication: Secured with Firebase Auth, only users with @gograbb.it emails are allowed access.
* Custom Views: Includes administrative views for controlling the Grabb platform and viewing logs.
* Dynamic Collections: Manages multiple collections, including products, shipping options, promotions, users, and more.
Custom Admin Panel: Includes custom views such as a controller for Grabb operations and a log viewer.

## Tech Stack
* React: Frontend framework for building the interface.
* FireCMS: Provides the core content management functionalities.
* Firebase: Used for authentication, Firestore as the database, and Firebase storage for media files.

## Prerequisites
Node.js and npm (Node Package Manager) installed.
Firebase Project with Firestore and Authentication enabled.
Doppler for managing environment variables securely.
Environment Setup
You'll need the following environment variables for configuring Firebase:

```bash
Copy code
REACT_APP_FIREBASE_CONFIG='{"apiKey": "...", "authDomain": "...", "projectId": "...", "storageBucket": "...", "messagingSenderId": "...", "appId": "..."}'
```
## Installation
Clone the repository:

```bash
Copy code
git clone https://github.com/yourusername/grabbcms.git
cd grabbcms
```
### Install the dependencies:

```bash
Copy code
npm install
Set up Firebase by providing your project configuration in .env.local:
```

```bash
Copy code
REACT_APP_FIREBASE_CONFIG='Your Firebase Config JSON'
Run the development server:
```

```bash
Copy code
npm run dev
Collections
The CMS manages the following Firestore 
```
## Collections:

* Products: Manages Grabb's product listings.

* Shipping Options: Configures shipping details for different products.

* Users: Displays registered users and their roles.

* Pages: Allows management of various CMS pages and content.

* Content Blocks: Reusable content blocks for site design.

* Promotions: Manages active promotions and discounts.

* Press Releases: Handles press releases for the platform.

* Tickets: Manages internal support tickets and feedback.

* Custom Collections: To add or modify collections, navigate to the /collections/ directory. Define your schema and fields, then import it into the main App.tsx file.

## Custom Views
Add custom views in the /views/ directory. Views can include dashboards, custom content editors, or any UI components specific to Grabb's needs.

#### Grabb Controller
This custom view allows admins to control Grabb operations like handling product drops, adjusting pricing, and starting/stopping key platform functions.

#### Logger Dashboard
A custom log viewer to monitor and analyze the logs generated by GrabbCMS.


## Authentication
GrabbCMS uses Firebase authentication with a custom authenticator. Only users with the @gograbb.it email domain are allowed access.

## Usage
Log in using your email and password.
Manage Products: Navigate to the product collection to add, update, or delete products.
View Logs: Admins can view platform logs for debugging and monitoring purposes.
Control Grabb Operations: Use the controller view to manage platform functions.

## Development
This CMS is built with FireCMS, which is a React-based, open-source framework for building Firebase-powered content management systems.

## Contribution Guidelines

We are not currently accepting external contributions. Any code submitted through pull requests will be reviewed on a case-by-case basis.

## License
GrabbCMS is proprietary software developed by Grabbit LLC.