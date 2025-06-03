import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { useToast } from '../components/ui/use-toast';

export const Login = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      let success;
      if (isRegistering) {
        success = await register(email, password);
        if (success) {
          toast({
            title: 'Account created',
            description: 'Your account has been created successfully.',
          });
          navigate('/');
        } else {
          toast({
            title: 'Registration failed',
            description: 'An account with this email already exists.',
            variant: 'destructive',
          });
        }
      } else {
        success = await login(email, password);
        if (success) {
          toast({
            title: 'Welcome back!',
            description: 'You have been logged in successfully.',
          });
          navigate('/');
        } else {
          toast({
            title: 'Login failed',
            description: 'Invalid email or password.',
            variant: 'destructive',
          });
        }
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{isRegistering ? 'Create Account' : 'Welcome Back'}</CardTitle>
          <CardDescription>
            {isRegistering
              ? 'Create a new account to get started'
              : 'Log in to your account to continue'}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700"
            >
              {isRegistering ? 'Create Account' : 'Log In'}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => setIsRegistering(!isRegistering)}
            >
              {isRegistering
                ? 'Already have an account? Log in'
                : "Don't have an account? Sign up"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default Login;