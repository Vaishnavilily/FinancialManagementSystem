'use client';

import { useState } from 'react';
import { resolveClientAuthUser } from '@/lib/auth-client';

export function useAuthUser() {
  const [authUser] = useState(() => resolveClientAuthUser());
  const authReady = true;
  return { authUser, authReady };
}

