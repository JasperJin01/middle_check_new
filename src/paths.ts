export const paths = {
  home: '/',
  auth: { signIn: '/auth/sign-in', signUp: '/auth/sign-up', resetPassword: '/auth/reset-password' },
  dashboard: {
    part1: '/dashboard/part1',
    part2: '/dashboard/part2',
    part3: '/dashboard/part3',
    part4: '/dashboard/part4',
    part5: '/dashboard/part5',
  },
  errors: { notFound: '/errors/not-found' },
} as const;
