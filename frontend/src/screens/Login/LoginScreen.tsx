import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface LoginScreenProps {
  onLogin: () => void;
}

export default function LoginScreen({ onLogin }: LoginScreenProps) {
  const handleSocialLogin = (provider: string) => {
    console.log(`Login with ${provider}`);
    onLogin();
  };

  const handleEmailLogin = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin();
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
          <p className="text-sm text-gray-600">The All-in-One Parenting Platform for Infant Care</p>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Button
              onClick={() => handleSocialLogin('Google')}
              variant="outline"
              className="w-full h-12 border-2 hover:bg-gray-50 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 bg-white rounded flex items-center justify-center">
                  <span className="text-sm">G</span>
                </div>
                <span>Continue with Google</span>
              </div>
            </Button>

            <Button
              onClick={() => handleSocialLogin('Kakao')}
              className="w-full h-12 bg-[#FEE500] hover:bg-[#FDD835] text-gray-900 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 bg-gray-900 rounded flex items-center justify-center">
                  <span className="text-[#FEE500] text-xs">K</span>
                </div>
                <span>Continue with Kakao</span>
              </div>
            </Button>

            <Button
              onClick={() => handleSocialLogin('Naver')}
              className="w-full h-12 bg-[#03C75A] hover:bg-[#02b350] text-white transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 bg-white rounded flex items-center justify-center">
                  <span className="text-[#03C75A] text-xs">N</span>
                </div>
                <span>Continue with Naver</span>
              </div>
            </Button>
          </div>

          <div className="flex items-center gap-4">
            <Separator className="flex-1" />
            <span className="text-sm text-gray-400">OR</span>
            <Separator className="flex-1" />
          </div>

          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="example@email.com"
                className="h-12 border-[#6AA6FF]/30"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                className="h-12 border-[#6AA6FF]/30"
              />
            </div>
            <Button
              type="submit"
              className="w-full h-12 bg-[#6AA6FF] hover:bg-[#5a96ef] text-white transition-all"
            >
              Login with Email
            </Button>
          </form>

          <div className="flex justify-center gap-4 text-xs text-gray-500">
            <button className="hover:text-[#6AA6FF] transition-colors">
              Forgot Password?
            </button>
            <span>•</span>
            <button className="hover:text-[#6AA6FF] transition-colors">
              Sign Up
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}