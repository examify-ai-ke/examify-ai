# Architecture Diagram & Flow Charts

## 🏗️ Application Architecture

### Overall App Structure
```
┌─────────────────────────────────────────────────────────────┐
│                    EXAMPAPEL APPLICATION                    │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              PUBLIC PAGES (No Auth)                  │   │
│  ├──────────────────────────────────────────────────────┤   │
│  │  • Landing Page (/)                                  │   │
│  │  • Browse Papers (/exampapers)                       │   │
│  │  • Browse Questions (/questions)                     │   │
│  │  • Browse Institutions (/institutions)               │   │
│  │  • Auth Pages (/auth/login, /auth/register)          │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         AUTHENTICATED PAGES (Auth Required)          │   │
│  ├──────────────────────────────────────────────────────┤   │
│  │  • User Profile (/profile) ← NEW                     │   │
│  │  • Dashboard (/dashboard)                            │   │
│  │  • Dashboard Profile (/dashboard/profile)            │   │
│  │  • Admin Pages (/admin, /dashboard/admin)            │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## 🔄 User Authentication Flow

```
┌─────────────────────────────────────────────────────────────┐
│                  USER AUTHENTICATION FLOW                   │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  START                                                       │
│    ↓                                                         │
│  [User visits app]                                           │
│    ↓                                                         │
│  [Check auth token]                                          │
│    ↓                                                         │
│  ┌─────────────────────────────────────────┐               │
│  │ Token exists & valid?                   │               │
│  └─────────────────────────────────────────┘               │
│    ↙                                    ↘                   │
│  YES                                    NO                  │
│    ↓                                    ↓                   │
│  [Load user data]                   [Redirect to login]     │
│    ↓                                    ↓                   │
│  [Check user role]                  [User logs in]          │
│    ↓                                    ↓                   │
│  ┌─────────────────────────────────────────┐               │
│  │ User role?                              │               │
│  └─────────────────────────────────────────┘               │
│    ↙              ↓              ↘                          │
│  ADMIN         STUDENT          MANAGER                     │
│    ↓              ↓              ↓                          │
│  [Admin]      [Student]      [Manager]                      │
│  Dashboard    Dashboard      Dashboard                      │
│    ↓              ↓              ↓                          │
│  [Full access]  [Limited]    [Limited]                      │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## 👤 User Profile Update Flow

```
┌─────────────────────────────────────────────────────────────┐
│              USER PROFILE UPDATE FLOW                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  USER LOGS IN                                                │
│    ↓                                                         │
│  [Redirected to /profile or /dashboard]                      │
│    ↓                                                         │
│  [User clicks avatar in header]                              │
│    ↓                                                         │
│  [Dropdown menu appears]                                     │
│    ├─ Dashboard                                              │
│    ├─ Profile ← NEW: Direct link to /profile                │
│    └─ Log out                                                │
│    ↓                                                         │
│  [User clicks "Profile"]                                     │
│    ↓                                                         │
│  [Navigate to /profile]                                      │
│    ↓                                                         │
│  [Profile page loads]                                        │
│    ├─ User info displayed                                    │
│    ├─ Edit button visible                                    │
│    └─ Account settings visible                               │
│    ↓                                                         │
│  [User clicks "Edit Profile"]                                │
│    ↓                                                         │
│  [Form becomes editable]                                     │
│    ↓                                                         │
│  [User types in fields]                                      │
│    ↓                                                         │
│  [Autosave timer starts (2 seconds)]                         │
│    ↓                                                         │
│  [After 2 seconds of inactivity]                             │
│    ↓                                                         │
│  [API PUT /api/v1/user called]                               │
│    ↓                                                         │
│  ┌─────────────────────────────────────────┐               │
│  │ API Response?                           │               │
│  └─────────────────────────────────────────┘               │
│    ↙                                    ↘                   │
│  SUCCESS                              ERROR                 │
│    ↓                                    ↓                   │
│  [Update auth store]              [Show error message]       │
│    ↓                                    ↓                   │
│  [Show "Auto-saved" indicator]     [Retry autosave]         │
│    ↓                                    ↓                   │
│  [Reset status after 2s]            [Continue editing]      │
│    ↓                                                         │
│  [User clicks "Done"]                                        │
│    ↓                                                         │
│  [Exit edit mode]                                            │
│    ↓                                                         │
│  END                                                         │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## 🔐 Password Change Flow

```
┌─────────────────────────────────────────────────────────────┐
│              PASSWORD CHANGE FLOW                           │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  [User on profile page]                                      │
│    ↓                                                         │
│  [Click "Change" in Account Settings]                        │
│    ↓                                                         │
│  [Password change dialog opens]                              │
│    ├─ Current Password field                                 │
│    ├─ New Password field                                     │
│    ├─ Confirm Password field                                 │
│    └─ Eye icons for visibility toggle                        │
│    ↓                                                         │
│  [User enters current password]                              │
│    ↓                                                         │
│  [User can click eye icon to show/hide]                       │
│    ↓                                                         │
│  [User enters new password]                                  │
│    ↓                                                         │
│  [User can click eye icon to show/hide]                       │
│    ↓                                                         │
│  [User confirms new password]                                │
│    ↓                                                         │
│  [User can click eye icon to show/hide]                       │
│    ↓                                                         │
│  [User clicks "Change Password"]                             │
│    ↓                                                         │
│  ┌─────────────────────────────────────────┐               │
│  │ Validation                              │               │
│  ├─ Passwords match?                       │               │
│  ├─ New password >= 8 chars?               │               │
│  └─────────────────────────────────────────┘               │
│    ↙                                    ↘                   │
│  VALID                                INVALID               │
│    ↓                                    ↓                   │
│  [API POST /api/v1/login/change_password]  [Show error]     │
│    ↓                                    ↓                   │
│  ┌─────────────────────────────────────────┐               │
│  │ API Response?                           │               │
│  └─────────────────────────────────────────┘               │
│    ↙                                    ↘                   │
│  SUCCESS                              ERROR                 │
│    ↓                                    ↓                   │
│  [Show success message]           [Show error message]       │
│    ↓                                    ↓                   │
│  [Close dialog]                     [Keep dialog open]       │
│    ↓                                    ↓                   │
│  [Clear password fields]            [User can retry]        │
│    ↓                                                         │
│  END                                                         │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## 🔄 Autosave Mechanism

```
┌─────────────────────────────────────────────────────────────┐
│              AUTOSAVE MECHANISM                             │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  USER TYPES IN FIELD                                         │
│    ↓                                                         │
│  [handleInputChange triggered]                               │
│    ↓                                                         │
│  [Update formData state]                                     │
│    ↓                                                         │
│  [Set autoSaveStatus = 'saving']                             │
│    ↓                                                         │
│  [Clear existing timeout]                                    │
│    ↓                                                         │
│  [Set new timeout: 2000ms]                                   │
│    ↓                                                         │
│  ┌─────────────────────────────────────────┐               │
│  │ User types again within 2 seconds?      │               │
│  └─────────────────────────────────────────┘               │
│    ↙                                    ↘                   │
│  YES                                    NO                  │
│    ↓                                    ↓                   │
│  [Clear timeout]                   [Timeout expires]        │
│    ↓                                    ↓                   │
│  [Set new timeout]                 [handleAutoSave called]  │
│    ↓                                    ↓                   │
│  [Wait 2 more seconds]             [API PUT /api/v1/user]   │
│    ↓                                    ↓                   │
│  [Repeat...]                       ┌─────────────────────┐  │
│                                    │ API Response?       │  │
│                                    └─────────────────────┘  │
│                                      ↙              ↘       │
│                                    SUCCESS        ERROR      │
│                                      ↓              ↓       │
│                                  [Update auth]  [Log error]  │
│                                      ↓              ↓       │
│                                  [Set status]  [Set status]  │
│                                  'saved'       'idle'        │
│                                      ↓              ↓       │
│                                  [Show ✓]    [Continue]      │
│                                      ↓                       │
│                                  [Reset after 2s]            │
│                                      ↓                       │
│                                  [Set status 'idle']         │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## 🎨 Component Hierarchy

```
ProfilePage
│
├── Header Section
│   ├── Title
│   ├── Description
│   ├── Auto-save Status Indicator
│   │   ├── Saving State (yellow pulsing dot)
│   │   └── Saved State (green checkmark)
│   └── Edit/Done Button
│
├── Main Grid (3 columns on desktop, 1 on mobile)
│   │
│   ├── Sidebar (1 column)
│   │   │
│   │   ├── Profile Card
│   │   │   ├── Avatar
│   │   │   ├── Name
│   │   │   ├── Role Badge
│   │   │   ├── Member Since Badge
│   │   │   ├── Email
│   │   │   ├── Phone (if available)
│   │   │   └── Location (if available)
│   │   │
│   │   └── Quick Stats Card
│   │       ├── Papers Completed
│   │       ├── Study Hours
│   │       ├── Accuracy Rate
│   │       └── Current Streak
│   │
│   └── Main Content (2 columns)
│       │
│       ├── Personal Information Card
│       │   ├── First Name Input
│       │   ├── Last Name Input
│       │   ├── Email Input
│       │   ├── Phone Input
│       │   ├── Address Input
│       │   ├── State Input
│       │   └── Country Input
│       │
│       ├── Account Settings Card
│       │   ├── Change Password
│       │   │   ├── Icon
│       │   │   ├── Description
│       │   │   └── Change Button
│       │   ├── Notification Settings (disabled)
│       │   │   ├── Icon
│       │   │   ├── Description
│       │   │   └── Configure Button
│       │   └── Privacy Settings (disabled)
│       │       ├── Icon
│       │       ├── Description
│       │       └── Manage Button
│       │
│       └── Auto-save Info Banner
│           └── "Changes are automatically saved..."
│
└── Password Change Dialog
    ├── Header
    │   ├── Title
    │   └── Description
    ├── Content
    │   ├── Current Password Field
    │   │   ├── Input
    │   │   └── Eye Toggle Button
    │   ├── New Password Field
    │   │   ├── Input
    │   │   └── Eye Toggle Button
    │   └── Confirm Password Field
    │       ├── Input
    │       └── Eye Toggle Button
    └── Footer
        ├── Cancel Button
        └── Change Password Button
```

## 📊 Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    DATA FLOW                                │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  USER INPUT                                                  │
│    ↓                                                         │
│  [React Component State]                                     │
│    ├─ formData (IUserUpdate)                                 │
│    ├─ passwordData                                           │
│    ├─ autoSaveStatus                                         │
│    └─ showPasswords                                          │
│    ↓                                                         │
│  [Autosave Trigger]                                          │
│    ↓                                                         │
│  [API Client (openapi-fetch)]                                │
│    ├─ PUT /api/v1/user                                       │
│    └─ POST /api/v1/login/change_password                     │
│    ↓                                                         │
│  [Backend API]                                               │
│    ├─ Validate data                                          │
│    ├─ Update database                                        │
│    └─ Return updated user                                    │
│    ↓                                                         │
│  [API Response]                                              │
│    ├─ Success: Updated user data                             │
│    └─ Error: Error message                                   │
│    ↓                                                         │
│  [Update Auth Store (Zustand)]                               │
│    ├─ setUser(updatedUser)                                   │
│    └─ Update global user state                               │
│    ↓                                                         │
│  [Update UI Store (Zustand)]                                 │
│    ├─ addNotification()                                      │
│    └─ Show success/error message                             │
│    ↓                                                         │
│  [Component Re-render]                                       │
│    ├─ Display updated data                                   │
│    ├─ Show status indicator                                  │
│    └─ Show notification                                      │
│    ↓                                                         │
│  USER SEES CHANGES                                           │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## 🔐 Security Flow

```
┌─────────────────────────────────────────────────────────────┐
│                  SECURITY FLOW                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  USER REQUEST                                                │
│    ↓                                                         │
│  [Middleware Check]                                          │
│    ├─ Check auth token exists                                │
│    ├─ Check token not expired                                │
│    └─ Check route is protected                               │
│    ↓                                                         │
│  ┌─────────────────────────────────────────┐               │
│  │ Authenticated?                          │               │
│  └─────────────────────────────────────────┘               │
│    ↙                                    ↘                   │
│  YES                                    NO                  │
│    ↓                                    ↓                   │
│  [Allow access]                     [Redirect to login]      │
│    ↓                                                         │
│  [API Request]                                               │
│    ├─ Include auth token in header                           │
│    ├─ HTTPS encryption                                       │
│    └─ CSRF token (if needed)                                 │
│    ↓                                                         │
│  [Backend Validation]                                        │
│    ├─ Verify token                                           │
│    ├─ Verify user ownership                                  │
│    ├─ Validate input data                                    │
│    └─ Check permissions                                      │
│    ↓                                                         │
│  ┌─────────────────────────────────────────┐               │
│  │ All checks pass?                        │               │
│  └─────────────────────────────────────────┘               │
│    ↙                                    ↘                   │
│  YES                                    NO                  │
│    ↓                                    ↓                   │
│  [Update database]                  [Return error]          │
│    ↓                                    ↓                   │
│  [Return success]                   [Log security event]     │
│    ↓                                                         │
│  [Frontend receives response]                                │
│    ├─ Update local state                                     │
│    ├─ Update auth store                                      │
│    └─ Show notification                                      │
│    ↓                                                         │
│  USER SEES RESULT                                            │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

**These diagrams show the complete architecture and flow of the profile page implementation.**
