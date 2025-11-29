import { useState } from 'react';
import { useAuth } from '../lib/auth-context';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { AlertCircle } from 'lucide-react';
import escudo from '../assets/escudo.jpg'; // escudo.jpg
import vueltaEscuela from '../assets/prototipo.png'; 

export function LoginPage() {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showRecovery, setShowRecovery] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username || !password) {
      setError('Por favor ingrese usuario y contraseña');
      return;
    }

    const success = login(username, password);
    if (!success) {
      setError('Usuario o contraseña incorrectos');
    }
  };

  if (showRecovery) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center p-4"
        style={{
          backgroundImage: `url(${vueltaEscuela})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="relative w-full max-w-md">
          {/* Logo circular posicionado a la mitad */}
          <div className="absolute left-1/2 -translate-x-1/2 -top-16 z-10">
            <div className="w-32 h-32 rounded-full flex items-center justify-center overflow-hidden bg-white border-4 border-white shadow-lg">
              <img src={escudo} alt="IEP Cristo Redentor" className="w-full h-full object-contain p-2" />
            </div>
          </div>
          
          <Card className="w-full bg-white pt-20">
            <CardHeader className="text-center">
              <CardTitle>Recuperar Contraseña</CardTitle>
              <CardDescription>
                Ingrese su correo institucional
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Correo electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="usuario@iepcristoredentor.edu.pe"
                />
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Se enviará un enlace de recuperación a su correo institucional
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Button className="w-full bg-green-800 hover:bg-green-900" type="button">
                  Enviar enlace de recuperación
                </Button>
                <Button
                  variant="ghost"
                  className="w-full"
                  onClick={() => setShowRecovery(false)}
                >
                  Volver al inicio de sesión
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        backgroundImage: `url(${vueltaEscuela})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      <div className="relative w-full max-w-md">
        {/* Logo circular posicionado a la mitad */}
        <div className="absolute left-1/2 -translate-x-1/2 -top-16 z-10">
          <div className="w-32 h-32 rounded-full flex items-center justify-center overflow-hidden bg-white border-4 border-white shadow-lg">
            <img src={escudo} alt="IEP Cristo Redentor" className="w-full h-full object-contain p-2" />
          </div>
        </div>
        
        <Card className="w-full bg-white pt-20">
          <CardHeader className="text-center">
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-gray-900">
                INTRANET ACADÉMICA
              </h2>
              <h1 className="text-3xl font-bold text-gray-900">
                IEP CRISTO REDENTOR DE NOCHETO
              </h1>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="username">Usuario</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Ingrese su usuario"
                  autoComplete="username"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Ingrese su contraseña"
                  autoComplete="current-password"
                />
              </div>

              <Button type="submit" className="w-full bg-green-800 hover:bg-green-900">
                Ingresar
              </Button>

              <button
                type="button"
                onClick={() => setShowRecovery(true)}
                className="w-full text-center text-sm text-red-600 hover:underline"
              >
                ¿Olvidó su contraseña?
              </button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}