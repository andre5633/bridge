import React, { useState } from 'react';
import { User } from '../types';
import { StorageService, generateUUID } from '../services/storageService';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { ArrowRight, Lock, Mail, User as UserIcon } from 'lucide-react';
import api from '../services/api';

interface LoginProps {
  onLogin: (user: User) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isRegistering) {
        console.log('[Login] Registering user:', { name, email });
        const response = await api.post('/auth/register', { name, email, password });
        console.log('[Login] Registration success:', response.data);

        // After registration, auto-login or just switch to login mode?
        // Let's auto-login by calling login after registration
      }

      console.log('[Login] Logging in user:', email);
      const response = await api.post('/auth/login', { email, password });
      console.log('[Login] Login success:', response.data);

      if (response.data.success) {
        const tokenData = response.data.data;
        const user: User = {
          id: tokenData.access_token, // Using token as ID for now or omit if not needed
          name: tokenData.user_name,
          email,
          token: tokenData.access_token
        };

        StorageService.saveUser(user);
        onLogin(user);
      } else {
        alert('Erro ao realizar login. Verifique suas credenciais.');
      }
    } catch (error: any) {
      console.error('[Login] Error:', error);
      const detail = error.response?.data?.detail || 'Erro na comunicação com o servidor.';
      alert(`Falha: ${detail}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-[#F5F5F7]">
      {/* Abstract Background Shapes */}
      <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-blue-400/20 rounded-full blur-3xl opacity-50 animate-pulse"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-purple-400/20 rounded-full blur-3xl opacity-50"></div>

      <div className="w-full max-w-md px-6 relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-black rounded-xl mb-4 shadow-lg shadow-black/20">
            <span className="text-white text-xl font-bold">F</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">
            {isRegistering ? 'Criar Conta' : 'Bem-vindo de volta'}
          </h1>
          <p className="text-gray-500 text-sm">
            {isRegistering ? 'Comece a organizar sua vida financeira.' : 'Acesse seu painel financeiro.'}
          </p>
        </div>

        <div className="bg-white/70 backdrop-blur-xl border border-white/50 rounded-2xl shadow-glass p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {isRegistering && (
              <Input
                label="Nome Completo"
                placeholder="Ex: João Silva"
                value={name}
                onChange={(e) => setName(e.target.value)}
                icon={<UserIcon size={18} />}
                required
              />
            )}

            <Input
              label="E-mail"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Mail size={18} />}
              required
            />

            <Input
              label="Senha"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={<Lock size={18} />}
              required
            />

            <Button
              type="submit"
              className="w-full mt-2"
              isLoading={isLoading}
            >
              {isRegistering ? 'Cadastrar' : 'Entrar'} <ArrowRight size={16} className="ml-2" />
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsRegistering(!isRegistering)}
              className="text-sm text-gray-500 hover:text-black transition-colors font-medium"
            >
              {isRegistering
                ? 'Já tem uma conta? Faça login'
                : 'Não tem conta? Crie agora'}
            </button>
          </div>
        </div>

        <p className="mt-8 text-center text-xs text-gray-400">
          Finanza Pure &copy; 2024. Design System.
        </p>
      </div>
    </div>
  );
};