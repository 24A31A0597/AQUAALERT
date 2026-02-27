import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { Droplets, Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { useNotifications } from '../contexts/NotificationContext';

// Firebase
import { signInWithEmailAndPassword } from "firebase/auth";
// @ts-ignore - JS module
import { auth, db } from "../firebase";
// @ts-ignore - JS module
import { ref, get } from 'firebase/database';

interface LoginForm {
  email: string;
  password: string;
}

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { addNotification } = useNotifications();
  const navigate = useNavigate();

  const { register, handleSubmit } = useForm<LoginForm>();

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );

      console.log("LOGIN SUCCESS:", userCredential.user.email);

      addNotification({
        type: 'success',
        title: 'Login Successful',
        message: 'Welcome to Aqua Alert'
      });

      // ✅ Redirect based on role
      try {
        const uid = userCredential.user.uid;
        const userRef = ref(db, `users/${uid}`);
        const snap = await get(userRef);
        const role = snap.exists() ? (snap.val().role || 'user') : 'user';
        if (role === 'admin') {
          navigate('/admin', { replace: true });
        } else {
          navigate('/', { replace: true });
        }
      } catch (e) {
        // Fallback: send to home
        navigate('/', { replace: true });
      }

    } catch (error: any) {
      console.error("LOGIN FAILED:", error.message);
      const code = error?.code as string | undefined;

      if (code === 'auth/user-not-found') {
        addNotification({
          type: 'error',
          title: 'No account found',
          message: 'No account found. Please register first.'
        });
      } else if (code === 'auth/wrong-password') {
        addNotification({
          type: 'error',
          title: 'Incorrect password',
          message: 'The password you entered is incorrect.'
        });
      } else {
        addNotification({
          type: 'error',
          title: 'Login Failed',
          message: 'Invalid email or password'
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
            Sign in to Aqua Alert
          </h2>
        </div>

        <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            <strong>Are you an admin?</strong>
            <Link to="/admin-login" className="ml-2 text-yellow-900 underline hover:text-yellow-950 font-semibold">
              Go to Admin Login
            </Link>
          </p>
        </div>

        <div className="bg-white p-8 rounded-lg shadow">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

            <div>
              <label className="text-sm font-medium text-gray-700">Email</label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  {...register('email', { required: 'Email is required' })}
                  className="w-full pl-10 py-3 border rounded-lg"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Password</label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  {...register('password', { required: 'Password is required' })}
                  className="w-full pl-10 pr-10 py-3 border rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3"
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>

          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;