/**
 * LoginScreen - 로그인/회원가입 화면
 * 실제 API 연동
 */
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthContext } from '@/contexts/AuthContext';
import { toast } from 'sonner';

type AuthMode = 'login' | 'signup';

export default function LoginScreen() {
  const { login, signup } = useAuthContext();
  const [mode, setMode] = useState<AuthMode>('login');
  const [isLoading, setIsLoading] = useState(false);

  // Form states
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [nickname, setNickname] = useState('');

  const resetForm = () => {
    setUsername('');
    setPassword('');
    setConfirmPassword('');
    setNickname('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim() || !password.trim()) {
      toast.error('아이디와 비밀번호를 입력해주세요');
      return;
    }

    setIsLoading(true);
    try {
      await login(username.trim(), password);
      toast.success('로그인 성공!');
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.message || '로그인에 실패했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim() || !password.trim()) {
      toast.error('아이디와 비밀번호를 입력해주세요');
      return;
    }

    if (password.length < 6) {
      toast.error('비밀번호는 6자 이상이어야 합니다');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('비밀번호가 일치하지 않습니다');
      return;
    }

    setIsLoading(true);
    try {
      await signup(username.trim(), password, nickname.trim() || undefined);
      toast.success('회원가입 성공! 로그인되었습니다');
    } catch (error: any) {
      console.error('Signup error:', error);
      if (error.message?.includes('already registered')) {
        toast.error('이미 사용중인 아이디입니다');
      } else {
        toast.error(error.message || '회원가입에 실패했습니다');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
    resetForm();
  };

  return (
    <div className="h-screen w-full flex items-center justify-center bg-gradient-to-br from-[#6AA6FF]/20 via-[#FFFDF9] to-[#9ADBC6]/20 p-4">
      <Card className="w-full max-w-md shadow-2xl border-2 border-[#6AA6FF]/20">
        <CardHeader className="text-center space-y-4 pb-4">
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#6AA6FF] to-[#9ADBC6] flex items-center justify-center shadow-lg">
              <span className="text-4xl">📖</span>
            </div>
          </div>
          <CardTitle className="text-[#6AA6FF]">ToDoc</CardTitle>
          <p className="text-sm text-gray-600">
            {mode === 'login' ? '육아의 모든 순간을 기록하세요' : '새 계정을 만들어주세요'}
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {mode === 'login' ? (
            // 로그인 폼
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">아이디</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="아이디를 입력하세요"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="h-12 border-[#6AA6FF]/30"
                  disabled={isLoading}
                  autoComplete="username"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">비밀번호</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="비밀번호를 입력하세요"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 border-[#6AA6FF]/30"
                  disabled={isLoading}
                  autoComplete="current-password"
                />
              </div>
              <Button
                type="submit"
                className="w-full h-12 bg-[#6AA6FF] hover:bg-[#5a96ef] text-white transition-all"
                disabled={isLoading}
              >
                {isLoading ? '로그인 중...' : '로그인'}
              </Button>
            </form>
          ) : (
            // 회원가입 폼
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signup-username">아이디</Label>
                <Input
                  id="signup-username"
                  type="text"
                  placeholder="사용할 아이디를 입력하세요"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="h-12 border-[#6AA6FF]/30"
                  disabled={isLoading}
                  autoComplete="username"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-nickname">닉네임 (선택)</Label>
                <Input
                  id="signup-nickname"
                  type="text"
                  placeholder="표시될 닉네임"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className="h-12 border-[#6AA6FF]/30"
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-password">비밀번호</Label>
                <Input
                  id="signup-password"
                  type="password"
                  placeholder="6자 이상 입력하세요"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 border-[#6AA6FF]/30"
                  disabled={isLoading}
                  autoComplete="new-password"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-confirm">비밀번호 확인</Label>
                <Input
                  id="signup-confirm"
                  type="password"
                  placeholder="비밀번호를 다시 입력하세요"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="h-12 border-[#6AA6FF]/30"
                  disabled={isLoading}
                  autoComplete="new-password"
                />
              </div>
              <Button
                type="submit"
                className="w-full h-12 bg-[#6AA6FF] hover:bg-[#5a96ef] text-white transition-all"
                disabled={isLoading}
              >
                {isLoading ? '가입 중...' : '회원가입'}
              </Button>
            </form>
          )}

          <Separator />

          <div className="text-center">
            {mode === 'login' ? (
              <p className="text-sm text-gray-500">
                계정이 없으신가요?{' '}
                <button
                  type="button"
                  onClick={() => switchMode('signup')}
                  className="text-[#6AA6FF] hover:underline font-medium"
                  disabled={isLoading}
                >
                  회원가입
                </button>
              </p>
            ) : (
              <p className="text-sm text-gray-500">
                이미 계정이 있으신가요?{' '}
                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className="text-[#6AA6FF] hover:underline font-medium"
                  disabled={isLoading}
                >
                  로그인
                </button>
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
