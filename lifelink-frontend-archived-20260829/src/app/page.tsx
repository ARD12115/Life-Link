'use client';

import React from 'react';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div>
      <h1>Hello LifeLink</h1>
      <Link href="/login">Login</Link>
      <Link href="/register">Register</Link>
    </div>
  );
}