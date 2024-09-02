// Links not affected by the auth status
export const publicauthLinks = [
  {
    name: 'Home',
    link: '/',
  },
];

// Links affected bythe auth status
export const authLinks = [
  {
    name: 'Dashboard',
    link: '/dashboard',
    auth: true,
    role: ['USER', 'ADMIN'],
  },
  {
    name: 'Settings',
    link: '/settings',
    auth: true,
    role: ['USER', 'ADMIN'],
  },
  {
    name: 'Admin',
    link: '/admin',
    auth: true,
    role: ['ADMIN'],
  },
  {
    name: 'Log In',
    link: '/login',
    auth: false,
    role: ['USER', 'ADMIN', ''],
  },
  {
    name: 'Sign Up',
    link: '/signup',
    auth: false,
    role: ['USER', 'ADMIN', ''],
  },
];
