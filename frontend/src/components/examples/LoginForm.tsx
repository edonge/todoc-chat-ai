/**
 * Example: Login Form Component
 * Demonstrates authentication with useAuth hook
 */
import { useState } from 'react';
import { useAuth } from '@/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

interface LoginFormProps {
  onSuccess?: () => void;
}

export default function LoginForm({ onSuccess }: LoginFormProps) {
  const { login, register, loading, error } = useAuth();
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

  const [loginData, setLoginData] = useState({
    username: '',
    password: '',
  });

  const [registerData, setRegisterData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    nickname: '',
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!loginData.username || !loginData.password) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      await login({
        username: loginData.username,
        password: loginData.password,
      });
      toast.success('Login successful!');
      onSuccess?.();
    } catch (err: any) {
      toast.error(err.message || 'Login failed');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!registerData.username || !registerData.password) {
      toast.error('Please fill in required fields');
      return;
    }

    if (registerData.password !== registerData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (registerData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    try {
      await register({
        username: registerData.username,
        password: registerData.password,
        nickname: registerData.nickname || undefined,
      });
      toast.success('Registration successful! Please login.');
      setActiveTab('login');
      setLoginData({
        username: registerData.username,
        password: '',
      });
    } catch (err: any) {
      toast.error(err.message || 'Registration failed');
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center">Welcome to Todoc</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <form onSubmit={handleLogin} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="login-username">Username</Label>
                <Input
                  id="login-username"
                  value={loginData.username}
                  onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                  placeholder="Enter username"
                  autoComplete="username"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="login-password">Password</Label>
                <Input
                  id="login-password"
                  type="password"
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  placeholder="Enter password"
                  autoComplete="current-password"
                />
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Logging in...' : 'Login'}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="register">
            <form onSubmit={handleRegister} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="register-username">Username *</Label>
                <Input
                  id="register-username"
                  value={registerData.username}
                  onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })}
                  placeholder="Choose a username"
                  autoComplete="username"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-nickname">Nickname</Label>
                <Input
                  id="register-nickname"
                  value={registerData.nickname}
                  onChange={(e) => setRegisterData({ ...registerData, nickname: e.target.value })}
                  placeholder="Display name (optional)"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-password">Password *</Label>
                <Input
                  id="register-password"
                  type="password"
                  value={registerData.password}
                  onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                  placeholder="At least 6 characters"
                  autoComplete="new-password"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-confirm">Confirm Password *</Label>
                <Input
                  id="register-confirm"
                  type="password"
                  value={registerData.confirmPassword}
                  onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                  placeholder="Confirm your password"
                  autoComplete="new-password"
                />
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Registering...' : 'Create Account'}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
