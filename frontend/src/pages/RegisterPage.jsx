import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import LoginPage from './LoginPage';

/**
 * RegisterPage
 * Students use unified Google authentication for both registration and login.
 * This component delegates directly to the Google-only authentication flow.
 */
const RegisterPage = () => {
  return <LoginPage />;
};

export default RegisterPage;
