import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { Droplets, Eye, EyeOff, Mail, Lock, Key } from 'lucide-react';
import { useNotifications } from '../contexts/NotificationContext';

// Firebase
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
// @ts-ignore - JS module
import { auth, db } from "../firebase";
// @ts-ignore - JS module
import { ref, set, get } from 'firebase/database';

interface AdminLoginForm {
  email: string;
  password: string;
  secretKey: string;
  name: string;
}

const AdminLogin = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isLogIn, setIsLogIn] = useState(false);
  const { addNotification } = useNotifications();
  const navigate = useNavigate();

  const { register, handleSubmit, reset } = useForm<AdminLoginForm>();

  // Secret key for admin registration (set this in environment variables in production)
  const ADMIN_SECRET_KEY = import.meta.env.VITE_ADMIN_SECRET_KEY || "AQUA_ADMIN_2026";

  const onSubmit = async (data: AdminLoginForm) => {
    setLoading(true);
    try {
      if (isLogIn) {
        // Regular admin login
        const userCredential = await signInWithEmailAndPassword(
          auth,
          data.email,
          data.password
        );

        console.log("ADMIN LOGIN SUCCESS:", userCredential.user.email);

        addNotification({
          type: 'success',
          title: 'Admin Login Successful',
          message: 'Welcome to Aqua Alert Admin'
        });

        navigate('/admin', { replace: true });
      } else {
        // Admin registration
        if (data.secretKey !== ADMIN_SECRET_KEY) {
          addNotification({
            type: 'error',
            title: 'Invalid Secret Key',
            message: 'The secret key you entered is incorrect.'
          });
          setLoading(false);
          return;
        }

        // Create account in Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          data.email,
          data.password
        );

        const uid = userCredential.user.uid;

        // Create admin profile in Realtime Database
        const userRef = ref(db, `users/${uid}`);
        await set(userRef, {
          name: data.name.trim() || "Admin",
          email: data.email,
          role: "admin",
          createdAt: Date.now(),
        });

        console.log("ADMIN REGISTRATION SUCCESS:", data.email);

        addNotification({
          type: 'success',
          title: 'Admin Account Created',
          message: 'Your admin account has been created successfully!'
        });

        // Auto login after registration
        navigate('/admin', { replace: true });
      }
    } catch (error: any) {
      console.error("ADMIN AUTH FAILED:", error.message);
      const code = error?.code as string | undefined;

      if (code === 'auth/email-already-in-use') {
        addNotification({
          type: 'error',
          title: 'Email Already Registered',
          message: 'This email is already registered. Try logging in instead.'
        });
      } else if (code === 'auth/weak-password') {
        addNotification({
          type: 'error',
          title: 'Weak Password',
          message: 'Password should be at least 6 characters.'
        });
      } else if (code === 'auth/user-not-found') {
        addNotification({
          type: 'error',
          title: 'No Account Found',
          message: 'No admin account found with this email.'
        });
      } else if (code === 'auth/wrong-password') {
        addNotification({
          type: 'error',
          title: 'Incorrect Password',
          message: 'The password you entered is incorrect.'
        });
      } else {
        addNotification({
          type: 'error',
          title: isLogIn ? 'Login Failed' : 'Registration Failed',
          message: error.message || 'An error occurred. Please try again.'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full space-y-8"
      >
        <div className="text-center">
          <Link to="/" className="inline-flex items-center space-x-2">
            <Droplets className="h-12 w-12 text-blue-600" />
          </Link>
          <h2 className="mt-4 text-3xl font-bold text-gray-900">
            {isLogIn ? 'Admin Login' : 'Admin Registration'}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {isLogIn
              ? 'Sign in to your admin account'
              : 'Create a new admin account with secret key'}
          </p>
        </div>

        <div className="bg-white p-8 rounded-lg shadow">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

            {!isLogIn && (
              <div>
                <label className="text-sm font-medium text-gray-700">Admin Name</label>
                <div className="relative mt-1">
                  <input
                    type="text"
                    placeholder="Your full name"
                    {...register('name', { required: !isLogIn })}
                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-gray-700">Email</label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  placeholder="admin@example.com"
                  {...register('email', { required: 'Email is required' })}
                  className="w-full pl-10 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Password</label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  {...register('password', { required: 'Password is required' })}
                  className="w-full pl-10 pr-10 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {!isLogIn && (
              <div>
                <label className="text-sm font-medium text-gray-700">Secret Admin Key</label>
                <div className="relative mt-1">
                  <Key className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="password"
                    placeholder="Enter secret key"
                    {...register('secretKey', { required: !isLogIn })}
                    className="w-full pl-10 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  Contact your system administrator for the secret key.
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading
                ? isLogIn
                  ? "Signing in..."
                  : "Creating account..."
                : isLogIn
                ? "Sign In as Admin"
                : "Create Admin Account"}
            </button>

          </form>

          <div className="mt-6 text-center border-t pt-6">
            <button
              onClick={() => {
                setIsLogIn(!isLogIn);
                reset();
              }}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              {isLogIn
                ? 'Need to register? Create account'
                : 'Already have an account? Sign in'}
            </button>
          </div>

          <div className="mt-4 text-center">
            <Link to="/login" className="text-gray-600 hover:text-gray-700 text-sm">
              ← Back to regular login
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
