import { withAuth } from 'next-auth/middleware';

export default withAuth({
  pages: { signIn: '/login' },
});

export const config = {
  matcher: [
    '/settings/:path*',
    '/api-keys/:path*',
    '/history/:path*',
    '/bookmarks/:path*',
    '/monitor/:path*',
    '/bulk/:path*',
    '/digest/:path*',
    '/backlinks/:path*',
    '/admin/:path*',
  ],
};
