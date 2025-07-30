"use client"

import { useState, useCallback, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, Leaf, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

// Validation schema
const VALIDATION_RULES = {
  email: {
    required: "Email is required",
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: "Please enter a valid email address"
  },
  password: {
    required: "Password is required",
    minLength: 3,
    message: "Password must be at least 3 characters"
  }
};

// Custom hook for form validation
const useFormValidation = () => {
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const validateField = useCallback((name, value) => {
    const rules = VALIDATION_RULES[name];
    if (!rules) return "";

    if (!value && rules.required) {
      return rules.required;
    }

    if (value && rules.pattern && !rules.pattern.test(value)) {
      return rules.message;
    }

    if (value && rules.minLength && value.length < rules.minLength) {
      return rules.message;
    }

    return "";
  }, []);

  const validateForm = useCallback((values) => {
    const newErrors = {};
    Object.keys(VALIDATION_RULES).forEach(field => {
      const error = validateField(field, values[field]);
      if (error) newErrors[field] = error;
    });
    return newErrors;
  }, [validateField]);

  const handleBlur = useCallback((name, value) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  }, [validateField]);

  return {
    errors,
    touched,
    validateField,
    validateForm,
    handleBlur,
    setErrors
  };
};

// Custom hook for authentication
const useAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const login = useCallback(async (credentials) => {
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Store session token in cookie with secure settings
        const cookieValue = `admin_session=${data.sessionToken}; path=/; max-age=${24 * 60 * 60}; secure; samesite=strict`;
        document.cookie = cookieValue;
        
        // Store user info in localStorage
        localStorage.setItem('admin_user', JSON.stringify(data.user));
        
        toast({
          title: "Login Successful",
          description: "Welcome to AgriAdmin Dashboard!",
        });
        
        router.push('/dashboard');
        return { success: true };
      } else {
        throw new Error(data.error || "Invalid credentials");
      }
    } catch (error) {
      toast({
        title: "Login Failed",
        description: error.message || "An error occurred during login. Please try again.",
        variant: "destructive",
      });
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  }, [toast, router]);

  return { login, isLoading };
};

// Password input component
const PasswordInput = ({ value, onChange, onBlur, error, touched }) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="space-y-2">
      <Label htmlFor="password">Password</Label>
      <div className="relative">
        <Input
          id="password"
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          className={`pr-10 ${error && touched ? 'border-red-500' : ''}`}
          placeholder="Enter your password"
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
        >
          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      {error && touched && (
        <p className="text-sm text-red-500 flex items-center">
          <AlertCircle className="h-4 w-4 mr-1" />
          {error}
        </p>
      )}
    </div>
  );
};

// Email input component
const EmailInput = ({ value, onChange, onBlur, error, touched }) => (
  <div className="space-y-2">
    <Label htmlFor="email">Email</Label>
    <Input
      id="email"
      type="email"
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      className={error && touched ? 'border-red-500' : ''}
      placeholder="Enter your email"
    />
    {error && touched && (
      <p className="text-sm text-red-500 flex items-center">
        <AlertCircle className="h-4 w-4 mr-1" />
        {error}
      </p>
    )}
  </div>
);

// Logo component
const Logo = () => (
  <div className="text-center mb-8">
    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-full mb-4">
      <Leaf className="h-8 w-8 text-white" />
    </div>
    <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
      AgriAdmin
    </h1>
    <p className="text-gray-600 mt-2">Agricultural Management System</p>
  </div>
);

export function LoginForm() {
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  });

  const { errors, touched, validateForm, handleBlur, setErrors } = useFormValidation();
  const { login, isLoading } = useAuth();

  // Memoized form validation
  const isFormValid = useMemo(() => {
    return credentials.email && credentials.password;
  }, [credentials]);

  const handleInputChange = useCallback((field) => (e) => {
    const value = e.target.value;
    setCredentials(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  }, [errors, setErrors]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    // Validate form
    const formErrors = validateForm(credentials);
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    const result = await login(credentials);
    if (!result.success) {
      // Handle login failure
      console.error('Login failed:', result.error);
    }
  }, [credentials, validateForm, setErrors, login]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 p-4">
      <div className="w-full max-w-md">
        <Logo />

        <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl font-semibold text-center text-gray-800">
              Welcome Back
            </CardTitle>
            <CardDescription className="text-center text-gray-600">
              Sign in to access your admin dashboard
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <EmailInput
                value={credentials.email}
                onChange={handleInputChange('email')}
                onBlur={(e) => handleBlur('email', e.target.value)}
                error={errors.email}
                touched={touched.email}
              />

              <PasswordInput
                value={credentials.password}
                onChange={handleInputChange('password')}
                onBlur={(e) => handleBlur('password', e.target.value)}
                error={errors.password}
                touched={touched.password}
              />

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-3 rounded-lg transition-all duration-200 transform hover:scale-105"
                disabled={isLoading || !isFormValid}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Signing in...
                  </div>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>

            {/* Demo credentials */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Demo Credentials:</h4>
              <div className="space-y-1 text-xs text-gray-600">
                <p><strong>Admin:</strong> admin@agripanel.com / Admin@123</p>
                <p><strong>Super Admin:</strong> superadmin@agripanel.com / SuperAdmin@123</p>
                <p><strong>Demo:</strong> admin@admin.com / admin123</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
