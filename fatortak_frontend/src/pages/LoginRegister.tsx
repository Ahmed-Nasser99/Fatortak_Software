import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Building2, Mail, Lock, User, Phone, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { toast } from "react-toastify";

interface LoginData {
  email: string;
  password: string;
}

interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  company: string;
}

const LoginRegister: React.FC = () => {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const { isRTL, t } = useLanguage();
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [loginData, setLoginData] = useState<LoginData>({
    email: '',
    password: ''
  });

  const [registerData, setRegisterData] = useState<RegisterData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    company: ''
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const success = await login(loginData.email, loginData.password);
      if (success) {
        toast.success(t('loginSuccess'));
        navigate('/dashboard');
      } else {
        toast.error(t('loginError'));
      }
    } catch (error) {
      toast.error(t('loginError'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const success = await register(registerData);
      if (success) {
        toast.success(t('registerSuccess'));
        navigate('/dashboard');
      } else {
        toast.error(t('registerError'));
      }
    } catch (error) {
      toast.error(t('registerError'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-md w-full space-y-8">
          {/* Logo */}
          <div className="text-center">
            <div className="flex justify-center">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <Building2 className="w-8 h-8 text-white" />
              </div>
            </div>
            <h2 className="mt-6 text-3xl font-bold text-gray-900">
              {isLogin ? t('welcomeBack') : t('createAccount')}
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              {isLogin ? t('signInToAccount') : t('signUpForAccount')}
            </p>
          </div>

          {/* Form */}
          <form className="mt-8 space-y-6" onSubmit={isLogin ? handleLogin : handleRegister}>
            <div className="space-y-4">
              {!isLogin && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                        {t('firstName')}
                      </label>
                      <div className="mt-1 relative">
                        <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <input
                          id="firstName"
                          type="text"
                          required
                          value={registerData.firstName}
                          onChange={(e) => setRegisterData({...registerData, firstName: e.target.value})}
                          className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder={t('firstName')}
                        />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                        {t('lastName')}
                      </label>
                      <div className="mt-1 relative">
                        <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <input
                          id="lastName"
                          type="text"
                          required
                          value={registerData.lastName}
                          onChange={(e) => setRegisterData({...registerData, lastName: e.target.value})}
                          className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder={t('lastName')}
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                      {t('phone')}
                    </label>
                    <div className="mt-1 relative">
                      <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <input
                        id="phone"
                        type="tel"
                        value={registerData.phone}
                        onChange={(e) => setRegisterData({...registerData, phone: e.target.value})}
                        className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder={t('phone')}
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="company" className="block text-sm font-medium text-gray-700">
                      {t('company')}
                    </label>
                    <div className="mt-1 relative">
                      <Building2 className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <input
                        id="company"
                        type="text"
                        value={registerData.company}
                        onChange={(e) => setRegisterData({...registerData, company: e.target.value})}
                        className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder={t('company')}
                      />
                    </div>
                  </div>
                </>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  {t('email')}
                </label>
                <div className="mt-1 relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    id="email"
                    type="email"
                    required
                    value={isLogin ? loginData.email : registerData.email}
                    onChange={(e) => {
                      if (isLogin) {
                        setLoginData({...loginData, email: e.target.value});
                      } else {
                        setRegisterData({...registerData, email: e.target.value});
                      }
                    }}
                    className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={t('email')}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  {t('password')}
                </label>
                <div className="mt-1 relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={isLogin ? loginData.password : registerData.password}
                    onChange={(e) => {
                      if (isLogin) {
                        setLoginData({...loginData, password: e.target.value});
                      } else {
                        setRegisterData({...registerData, password: e.target.value});
                      }
                    }}
                    className="pl-10 pr-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={t('password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 h-5 w-5 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff /> : <Eye />}
                  </button>
                </div>
              </div>
            </div>

            {isLogin && (
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                    {t('rememberMe')}
                  </label>
                </div>

                <div className="text-sm">
                  <Link to="/forgot-password" className="font-medium text-blue-600 hover:text-blue-500">
                    {t('forgotPassword')}
                  </Link>
                </div>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {isLoading ? t('loading') : (isLogin ? t('signIn') : t('signUp'))}
              </button>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                {isLogin ? t('dontHaveAccount') : t('alreadyHaveAccount')}
                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="font-medium text-blue-600 hover:text-blue-500 ml-1"
                >
                  {isLogin ? t('signUp') : t('signIn')}
                </button>
              </p>
            </div>
          </form>
        </div>
      </div>

      {/* Right Side - Image/Graphics */}
      <div className="hidden lg:block flex-1 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10 flex flex-col justify-center items-center h-full text-white p-12">
          <div className="max-w-md text-center">
            <h3 className="text-3xl font-bold mb-6">
              {isLogin ? t('welcomeToInvoiceFlow') : t('joinInvoiceFlow')}
            </h3>
            <p className="text-lg opacity-90 mb-8">
              {isLogin 
                ? t('manageInvoicesEfficiently') 
                : t('startManagingInvoices')
              }
            </p>
            
            {/* Decorative Elements */}
            <div className="grid grid-cols-2 gap-4 mt-12">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="w-8 h-8 bg-white/20 rounded-lg mb-2"></div>
                <p className="text-sm">{t('feature1')}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="w-8 h-8 bg-white/20 rounded-lg mb-2"></div>
                <p className="text-sm">{t('feature2')}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="w-8 h-8 bg-white/20 rounded-lg mb-2"></div>
                <p className="text-sm">{t('feature3')}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="w-8 h-8 bg-white/20 rounded-lg mb-2"></div>
                <p className="text-sm">{t('feature4')}</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Background Pattern */}
        <div className="absolute top-20 right-20 w-32 h-32 border border-white/20 rounded-full"></div>
        <div className="absolute bottom-20 left-20 w-24 h-24 border border-white/20 rounded-full"></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 border border-white/20 rounded-full"></div>
      </div>
    </div>
  );
};

export default LoginRegister;
