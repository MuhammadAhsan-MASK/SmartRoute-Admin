# SafeRoute Admin Dashboard

A modern, responsive admin dashboard for managing the SafeRoute women's safety application. Built with HTML, CSS, Bootstrap, and Firebase.

## Features

### 📊 Dashboard
- Real-time statistics (total users, routes, reports)
- Interactive charts (user activity, user types)
- Recent activity feed
- Beautiful glassmorphism UI design

### 👥 Users Management
- View all registered users
- Filter by gender (Male/Female)
- Track user activity and travel preferences
- User statistics and analytics

### 🗺️ Routes Management
- View all route requests
- Filter by route type (Safe/Shortest)
- Track pickup and dropoff locations
- Monitor route preferences by gender and travel type

### ⚠️ Reports Management
- View unsafe area reports
- Filter by status (Pending/Resolved)
- Severity levels (High/Medium/Low)
- Quick resolution actions

## Tech Stack

- **Frontend**: HTML5, CSS3, Bootstrap 5.3.2
- **Backend**: Firebase (Authentication & Firestore)
- **Charts**: Chart.js 4.4.0
- **Icons**: Font Awesome 6.5.1
- **Fonts**: Google Fonts (Inter)

## Project Structure

```
admin-dashboard/
├── index.html              # Login page
├── dashboard.html          # Main dashboard
├── users.html             # Users management
├── routes.html            # Routes tracking
├── reports.html           # Reports management
├── css/
│   └── style.css          # Main stylesheet
└── js/
    ├── firebase-config.js # Firebase configuration
    ├── auth.js            # Authentication logic
    ├── dashboard.js       # Dashboard functionality
    ├── users.js           # Users page logic
    ├── routes.js          # Routes page logic
    └── reports.js         # Reports page logic
```

## Setup Instructions

### 1. Firebase Configuration

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or use existing one
3. Enable **Authentication** (Email/Password)
4. Enable **Cloud Firestore**
5. Get your Firebase config from Project Settings

### 2. Update Firebase Config

Open `js/firebase-config.js` and replace with your Firebase credentials:

```javascript
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};
```

### 3. Firestore Database Structure

Create these collections in Firestore:

#### `users` Collection
```javascript
{
  email: "user@example.com",
  gender: "Female",           // "Male" or "Female"
  travelType: "Alone",        // "Alone" or "Family"
  lastActive: timestamp,
  createdAt: timestamp
}
```

#### `routes` Collection
```javascript
{
  userEmail: "user@example.com",
  gender: "Female",
  travel: "Alone",
  routeType: "safest",        // "safest" or "shortest"
  pickupLocation: "Location A, Karachi",
  dropoffLocation: "Location B, Karachi",
  timestamp: timestamp
}
```

#### `reports` Collection
```javascript
{
  userEmail: "user@example.com",
  location: "Area Name, Karachi",
  issueType: "Poor Lighting",  // "Poor Lighting", "Harassment", "Unsafe Area", etc.
  description: "Description of the issue",
  severity: "High",            // "High", "Medium", "Low"
  status: "pending",           // "pending" or "resolved"
  timestamp: timestamp,
  resolvedAt: timestamp        // (optional, when resolved)
}
```

### 4. Create Admin User

1. Open `index.html` in a browser
2. The app will show demo data if Firebase is not configured
3. Once Firebase is configured, create an admin account through Firebase Console:
   - Go to Authentication > Users
   - Add user manually with email and password

### 5. Run the Application

Simply open `index.html` in a modern web browser. No build process required!

**For local development**, you can use:
- Python: `python -m http.server 8000`
- Node.js: `npx http-server`
- VS Code: Live Server extension

Then navigate to `http://localhost:8000`

## Features Breakdown

### Authentication
- Secure Firebase email/password authentication
- Password visibility toggle
- Remember me functionality
- Error handling with user-friendly messages
- Auto-redirect for logged-in users

### Dashboard
- Live statistics from Firestore
- Chart.js visualizations
- Demo data fallback for testing
- Real-time updates
- Responsive design

### Data Management
- Real-time Firestore integration
- Filtering and sorting
- Demo data for testing without Firebase
- Refresh functionality
- Status updates

## Design Features

- **Glassmorphism**: Modern frosted glass effect
- **Dark Theme**: Navy blue background with vibrant accents
- **Animations**: Smooth transitions and hover effects
- **Responsive**: Mobile-friendly layout
- **Accessibility**: Semantic HTML and ARIA labels

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge
- Opera

## Security Notes

⚠️ **Important**: 
- Never commit `firebase-config.js` with real credentials to public repositories
- Use Firebase Security Rules to protect your data
- Implement proper admin role checking in production

## Demo Mode

The dashboard includes demo data that displays when Firebase is not configured or data is unavailable. This allows you to:
- Test the UI without setting up Firebase
- Preview the design and functionality
- Develop offline

## Customization

### Colors
Edit CSS variables in `css/style.css`:
```css
:root {
    --primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    --bg-dark: #0f0f23;
    /* ... more variables */
}
```

### Branding
- Update logo icon in sidebar
- Change app name in HTML files
- Modify color scheme in CSS

## License

This project is created for the SafeRoute women's safety application.

## Support

For issues or questions, please contact the development team.
