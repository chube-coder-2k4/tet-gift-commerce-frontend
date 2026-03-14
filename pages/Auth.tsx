import React, { useState, useEffect } from 'react';
import { Screen, User } from '../types';
import { authApi, userApi, tokenStorage, ApiError } from '../services/api';

interface AuthProps {
  onNavigate: (screen: Screen) => void;
  type: 'login' | 'register';
  onLogin: (user: User) => void;
}

const Auth: React.FC<AuthProps> = ({ onNavigate, type, onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [showOtpForm, setShowOtpForm] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpEmail, setOtpEmail] = useState('');

  const parseJwtPayload = (jwt: string): Record<string, any> | null => {
    try {
      const parts = jwt.split('.');
      if (parts.length < 2) return null;
      const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      const json = decodeURIComponent(
        atob(base64)
          .split('')
          .map((char) => `%${(`00${char.charCodeAt(0).toString(16)}`).slice(-2)}`)
          .join('')
      );
      return JSON.parse(json);
    } catch {
      return null;
    }
  };

  // Check for OAuth callback on mount
  useEffect(() => {
    const handleOAuthCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');
      const emailParam = urlParams.get('email');
      const errorParam = urlParams.get('error');

      if (errorParam) {
        setError(decodeURIComponent(errorParam));
        window.history.replaceState({}, document.title, window.location.pathname);
        return;
      }

      // OAuth callback - chấp nhận token-only hoặc token + email
      if (token) {
        setIsLoading(true);
        try {
          // Lưu token vào localStorage (OAuth không có refreshToken riêng)
          localStorage.setItem('accessToken', token);

          const payload = parseJwtPayload(token);
          const emailFromToken =
            (typeof payload?.email === 'string' && payload.email) ||
            (typeof payload?.sub === 'string' && payload.sub.includes('@') && payload.sub) ||
            (typeof payload?.preferred_username === 'string' && payload.preferred_username) ||
            '';

          const resolvedEmail = emailParam || emailFromToken || 'oauth-user@local';
          const fullNameFromToken =
            (typeof payload?.name === 'string' && payload.name) ||
            (typeof payload?.fullName === 'string' && payload.fullName) ||
            '';
          const userIdFromToken = Number(payload?.userId ?? payload?.uid ?? payload?.id ?? 0);

          // Tạo user từ email được trả về
          const userName = fullNameFromToken || resolvedEmail.split('@')[0] || 'OAuth User';
          const user: User = {
            id: Number.isFinite(userIdFromToken) && userIdFromToken > 0 ? userIdFromToken : Date.now(), // ID tạm nếu token không có
            name: userName.charAt(0).toUpperCase() + userName.slice(1),
            email: resolvedEmail,
            phone: undefined,
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=d90429&color=fff&size=200`,
            addresses: [],
          };

          localStorage.setItem('user', JSON.stringify(user));
          onLogin(user);
          onNavigate('home');
        } catch (err) {
          setError('Đăng nhập OAuth thất bại. Vui lòng thử lại.');
          localStorage.removeItem('accessToken');
        } finally {
          setIsLoading(false);
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      }
    };

    handleOAuthCallback();
  }, [onLogin, onNavigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (type === 'login') {
        // Login API call
        const loginResponse = await authApi.login({
          usernameOrEmail: email,
          password: password,
        });

        // Fetch user profile after successful login
        const userResponse = await userApi.getProfile(loginResponse.data.userId);
        const userData = userResponse.data;

        const displayName = userData.fullName || `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || userData.email;
        const user: User = {
          id: userData.id,
          name: userData.fullName,
          email: userData.email,
          phone: userData.phone,
          roleName: userData.roleName,
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.fullName)}&background=d90429&color=fff&size=200`,
          addresses: [],
          roles: userData.roles,
        };

        localStorage.setItem('user', JSON.stringify(user));
        onLogin(user);

        // Check if user has ADMIN role and redirect to admin dashboard
        const isAdmin = userData.roles?.some(role => role.name === 'ADMIN');
        onNavigate(isAdmin ? 'admin' : 'home');
      } else {
        // Register API call
        await userApi.register({
          fullName: name,
          username,
          email,
          password,
          phone: phone || undefined,
        });

        // Show OTP verification form
        setOtpEmail(email);
        setShowOtpForm(true);
        setError(null);
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(type === 'login' ? 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.' : 'Đăng ký thất bại. Vui lòng thử lại.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    setIsLoading(true);
    window.location.href = authApi.getGoogleLoginUrl();
  };

  const handleVerifyOtp = async () => {
    if (!otp.trim()) return;
    setError(null);
    setIsLoading(true);
    try {
      await authApi.verifyOtp({ email: otpEmail, otp });
      setShowOtpForm(false);
      setOtp('');
      setError('Xác thực thành công! Vui lòng đăng nhập.');
      setTimeout(() => {
        onNavigate('login');
        setError(null);
      }, 2000);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Xác thực OTP thất bại. Vui lòng thử lại.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setIsLoading(true);
    try {
      await authApi.resendOtp(otpEmail);
      setError('Đã gửi lại mã OTP. Vui lòng kiểm tra email.');
    } catch (err) {
      setError('Gửi lại OTP thất bại. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  // OTP Verification Screen
  if (showOtpForm) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen bg-background-light dark:bg-background-dark p-4">
        <div className="w-full max-w-md">
          <div className="bg-white dark:bg-card-dark rounded-2xl p-8 shadow-2xl border border-gray-100 dark:border-white/10">
            <div className="text-center mb-8">
              <div className="size-16 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-primary text-3xl">mail</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Xác thực tài khoản</h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Mã OTP đã được gửi đến <span className="font-semibold text-primary">{otpEmail}</span>
              </p>
            </div>

            {error && (
              <div className={`mb-6 p-4 rounded-xl border flex items-start gap-3 ${error.includes('thành công')
                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-400'
                : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-400'
                }`}>
                <span className="material-symbols-outlined text-xl mt-0.5">
                  {error.includes('thành công') ? 'check_circle' : 'error'}
                </span>
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}

            <div className="space-y-4">
              <label className="flex flex-col w-full">
                <span className="text-gray-900 dark:text-white text-sm font-medium pb-2">Mã OTP <span className="text-red-500">*</span></span>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength={6}
                  className="bg-white dark:bg-[#200606] border border-gray-300 dark:border-[#4a1212] text-gray-900 dark:text-white text-center text-2xl tracking-[0.5em] font-mono focus:border-accent focus:ring-1 focus:ring-accent flex w-full rounded-xl h-14 px-4 transition-all outline-none"
                  placeholder="000000"
                  autoFocus
                />
              </label>

              <button
                onClick={handleVerifyOtp}
                disabled={isLoading || otp.length < 6}
                className="flex w-full items-center justify-center rounded-xl h-12 px-4 bg-primary hover:bg-red-700 text-white text-base font-bold tracking-wide shadow-lg shadow-primary/20 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Đang xác thực...' : 'Xác nhận OTP'}
              </button>

              <div className="text-center">
                <button
                  onClick={handleResendOtp}
                  disabled={isLoading}
                  className="text-primary hover:text-red-700 dark:text-accent dark:hover:text-white text-sm font-medium hover:underline transition-colors disabled:opacity-50"
                >
                  Gửi lại mã OTP
                </button>
              </div>

              <button
                onClick={() => { setShowOtpForm(false); setOtp(''); setError(null); }}
                className="flex w-full items-center justify-center rounded-xl h-10 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-sm font-medium transition-colors"
              >
                ← Quay lại đăng ký
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col lg:flex-row relative min-h-screen">
      {/* Back Button */}
      <button
        onClick={() => onNavigate('home')}
        className="absolute top-6 left-6 inline-flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-white transition-colors group z-20"
      >
        <span className="material-symbols-outlined text-xl group-hover:-translate-x-1 transition-transform">arrow_back</span>
        <span className="font-medium">Quay lại</span>
      </button>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 py-12 lg:p-12 z-10 bg-background-light dark:bg-background-dark">
        <div className="w-full max-w-[440px] flex flex-col">
          <div className="mb-10">
            <h1 className="text-gray-900 dark:text-white text-4xl font-bold leading-tight tracking-tight mb-2">
              {type === 'login' ? 'Chào mừng trở lại' : 'Tạo tài khoản mới'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-base font-normal">
              {type === 'login' ? 'Vui lòng nhập thông tin để đăng nhập.' : 'Tham gia cùng chúng tôi để nhận ưu đãi Tết.'}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className={`mb-6 p-4 rounded-xl border flex items-start gap-3 ${error.includes('thành công')
                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-400'
                : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-400'
              }`}>
              <span className="material-symbols-outlined text-xl mt-0.5">
                {error.includes('thành công') ? 'check_circle' : 'error'}
              </span>
              <div>
                <p className="text-sm font-medium">{error}</p>
                {!error.includes('thành công') && (
                  <button
                    onClick={() => setError(null)}
                    className="text-xs underline mt-1 hover:no-underline"
                  >
                    Đóng
                  </button>
                )}
              </div>
            </div>
          )}

          <div className="mb-8 p-1 bg-gray-200 dark:bg-surface-darker rounded-xl flex">
            <button
              onClick={() => onNavigate('login')}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-lg shadow-sm transition-all
                ${type === 'login' ? 'bg-primary text-white' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}
              `}
            >
              Đăng nhập
            </button>
            <button
              onClick={() => onNavigate('register')}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-lg shadow-sm transition-all
                ${type === 'register' ? 'bg-primary text-white' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}
              `}
            >
              Đăng ký
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {type === 'register' && (
              <>
                <label className="flex flex-col w-full group">
                  <span className="text-gray-900 dark:text-white text-sm font-medium leading-normal pb-2">Họ và tên <span className="text-red-500">*</span></span>
                  <div className="relative">
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="bg-white dark:bg-[#200606] border border-gray-300 dark:border-[#4a1212] text-gray-900 dark:text-white placeholder-gray-500/50 dark:placeholder-gray-400/50 focus:border-accent focus:ring-1 focus:ring-accent flex w-full rounded-xl h-12 px-4 pl-11 text-base transition-all outline-none"
                      placeholder="Nguyễn Văn A"
                    />
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-[#a86b6b] group-focus-within:text-accent transition-colors pointer-events-none">
                      <span className="material-symbols-outlined text-[20px]">badge</span>
                    </div>
                  </div>
                </label>

                <label className="flex flex-col w-full group">
                  <span className="text-gray-900 dark:text-white text-sm font-medium leading-normal pb-2">Tên đăng nhập <span className="text-red-500">*</span></span>
                  <div className="relative">
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                      className="bg-white dark:bg-[#200606] border border-gray-300 dark:border-[#4a1212] text-gray-900 dark:text-white placeholder-gray-500/50 dark:placeholder-gray-400/50 focus:border-accent focus:ring-1 focus:ring-accent flex w-full rounded-xl h-12 px-4 pl-11 text-base transition-all outline-none"
                      placeholder="nguyenvana"
                    />
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-[#a86b6b] group-focus-within:text-accent transition-colors pointer-events-none">
                      <span className="material-symbols-outlined text-[20px]">person</span>
                    </div>
                  </div>
                </label>

                <label className="flex flex-col w-full group">
                  <span className="text-gray-900 dark:text-white text-sm font-medium leading-normal pb-2">Số điện thoại</span>
                  <div className="relative">
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="bg-white dark:bg-[#200606] border border-gray-300 dark:border-[#4a1212] text-gray-900 dark:text-white placeholder-gray-500/50 dark:placeholder-gray-400/50 focus:border-accent focus:ring-1 focus:ring-accent flex w-full rounded-xl h-12 px-4 pl-11 text-base transition-all outline-none"
                      placeholder="0901234567"
                    />
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-[#a86b6b] group-focus-within:text-accent transition-colors pointer-events-none">
                      <span className="material-symbols-outlined text-[20px]">phone</span>
                    </div>
                  </div>
                </label>
              </>
            )}

            <label className="flex flex-col w-full group">
              <span className="text-gray-900 dark:text-white text-sm font-medium leading-normal pb-2">
                {type === 'login' ? 'Email hoặc Tên đăng nhập' : 'Email'} <span className="text-red-500">*</span>
              </span>
              <div className="relative">
                <input
                  type={type === 'register' ? 'email' : 'text'}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-white dark:bg-[#200606] border border-gray-300 dark:border-[#4a1212] text-gray-900 dark:text-white placeholder-gray-500/50 dark:placeholder-gray-400/50 focus:border-accent focus:ring-1 focus:ring-accent flex w-full rounded-xl h-12 px-4 pl-11 text-base transition-all outline-none"
                  placeholder="example@email.com"
                />
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-[#a86b6b] group-focus-within:text-accent transition-colors pointer-events-none">
                  <span className="material-symbols-outlined text-[20px]">mail</span>
                </div>
              </div>
            </label>

            <label className="flex flex-col w-full group">
              <span className="text-gray-900 dark:text-white text-sm font-medium leading-normal pb-2">Mật khẩu <span className="text-red-500">*</span></span>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="bg-white dark:bg-[#200606] border border-gray-300 dark:border-[#4a1212] text-gray-900 dark:text-white placeholder-gray-500/50 dark:placeholder-gray-400/50 focus:border-accent focus:ring-1 focus:ring-accent flex w-full rounded-xl h-12 px-4 pl-11 pr-11 text-base transition-all outline-none"
                  placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
                />
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-[#a86b6b] group-focus-within:text-accent transition-colors pointer-events-none">
                  <span className="material-symbols-outlined text-[20px]">lock</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-[#a86b6b] hover:text-gray-900 dark:hover:text-white cursor-pointer transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showPassword ? 'visibility' : 'visibility_off'}
                  </span>
                </button>
              </div>
            </label>

            {type === 'login' && (
              <div className="flex justify-end">
                <a href="#" className="text-primary hover:text-red-700 dark:text-accent dark:hover:text-white text-sm font-medium hover:underline transition-colors">Quên mật khẩu?</a>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full cursor-pointer items-center justify-center rounded-xl h-12 px-4 bg-primary hover:bg-red-700 text-white text-base font-bold tracking-wide shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all active:scale-[0.98] mt-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:active:scale-100"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Đang xử lý...
                </>
              ) : (
                type === 'login' ? 'Đăng nhập' : 'Đăng ký ngay'
              )}
            </button>
          </form>

          <div className="relative py-8 flex items-center">
            <div className="flex-grow border-t border-gray-300 dark:border-[#4a1212]"></div>
            <span className="flex-shrink-0 mx-4 text-gray-500 dark:text-[#a86b6b] text-xs font-medium uppercase tracking-wider">Hoặc tiếp tục với</span>
            <div className="flex-grow border-t border-gray-300 dark:border-[#4a1212]"></div>
          </div>

          <div className="flex flex-col gap-4">
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="flex items-center justify-center gap-2 h-11 rounded-xl border border-gray-300 dark:border-[#4a1212] bg-white dark:bg-card-dark hover:bg-gray-50 dark:hover:bg-white/5 hover:border-gray-400 dark:hover:border-white/20 transition-all group disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              <span className="text-gray-700 dark:text-white/90 text-sm font-medium group-hover:text-black dark:group-hover:text-white">Tiếp tục với Google</span>
            </button>
          </div>
        </div>
      </div>

      <div className="hidden lg:block lg:w-1/2 relative bg-black border-l border-gray-200 dark:border-[#4a1212] overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#D70018 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuAFNAYiX_I1col8ExIs39TajfchjHnC67qFZHo-r_7LmlS74A4q0pEuEMKKsw85Ze1RGQyFCqaWwNjcIq3w1KfHh_nta1DB-9z3SMzGViS_Vv_0RNHE-FsCE9hXOUplWhUDUNUWwYBTjfHeHY4CbCY-sXDRUPVrjR84Ft9jBVJ30yl9EvLl7cdY6KO98590tbg7etYxgJlZGY4cOfVhygwUxarT66wbpdyzQUoo_gO_8lBlG7rDvIJsIKUr30a3cgA4jMxhQGIKBIc" className="w-full h-full object-cover opacity-60 scale-105" alt="Elegant Tet" />
          <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-transparent to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-background-dark/80 via-background-dark/20 to-transparent"></div>

          <div className="absolute bottom-20 left-16 right-16 text-white z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-accent/30 bg-accent/10 text-accent font-medium mb-6 backdrop-blur-sm">
              <span className="material-symbols-outlined text-sm">filter_vintage</span>
              <span className="text-xs uppercase tracking-wider font-bold">Lunar New Year Collection</span>
            </div>
            <h2 className="text-5xl font-bold mb-4 leading-[1.1] text-white drop-shadow-lg">
              Tradition Meets <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-[#ffeeb0]">Modern Elegance</span>
            </h2>
            <p className="text-lg text-white/80 font-normal max-w-md mt-4 leading-relaxed">
              Experience the warmth of Tet with our curated selection of premium gifts. Sign in to explore exclusive offers.
            </p>
            <div className="flex gap-2 mt-8">
              <div className="w-8 h-1 bg-accent rounded-full"></div>
              <div className="w-2 h-1 bg-white/30 rounded-full"></div>
              <div className="w-2 h-1 bg-white/30 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    </div >
  );
};

export default Auth;
