export const paths = {
  home: '/',
  auth: { signIn: '/auth/sign-in', signUp: '/auth/sign-up', resetPassword: '/auth/reset-password' },
  dashboard: {
    part1: '/dashboard/part1',
    part2: '/dashboard/part2',
    part3: '/dashboard/part3',
  },
  errors: { notFound: '/errors/not-found' },
} as const;
