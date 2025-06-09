"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Mail, MessageCircle, Phone } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    navigate("/dashboard");
    /*const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })
    if (res.ok) {
      navigate('/dashboard')
    } else {
      alert('Credenciales incorrectas')
    }*/
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Image */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        <img
          src="/imagenLogin.webp" // ✅ sin el "/public"
          alt="Puerto industrial con contenedores y grúas"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* Right side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md space-y-8">
          {/* Company Brand */}
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <img
                src="/public/abk-white.png"
                alt="ABK Logistics"
                width={200}
                height={80}
                className="h-16 w-auto"
              />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Bienvenido de vuelta
            </h1>
            <p className="text-gray-600">
              Ingresa tus credenciales para acceder al sistema
            </p>
          </div>

          {/* Login Form */}
          <Card className="shadow-lg">
            <CardHeader className="space-y-1 pb-4">
              <h2 className="text-xl font-semibold text-center">
                Iniciar Sesión
              </h2>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Usuario</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Ingresa tu usuario"
                  className="h-11"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Ingresa tu contraseña"
                  className="h-11"
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full h-11 bg-orange-600 hover:bg-orange-700"
                onClick={handleSubmit}
              >
                Iniciar Sesión
              </Button>
            </CardContent>
          </Card>

          {/* Contact Administrator Section */}
          {/*<Card className="shadow-md">
            <CardContent className="pt-6">
              <div className="text-center mb-4">
                <h3 className="font-semibold text-gray-900 mb-2">
                  ¿Olvidaste tu contraseña?
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Contacta al administrador para recuperar tu acceso
                </p>
              </div>

              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start h-11"
                  onClick={() =>
                    window.open("mailto:admin@abklogistics.com", "_blank")
                  }
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Enviar correo electrónico
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start h-11"
                  onClick={() => window.open("tel:+1234567890", "_blank")}
                >
                  <Phone className="mr-2 h-4 w-4" />
                  Llamar al administrador
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start h-11"
                  onClick={() =>
                    window.open("https://wa.me/1234567890", "_blank")
                  }
                >
                  <MessageCircle className="mr-2 h-4 w-4" />
                  WhatsApp
                </Button>
              </div>

              <Separator className="my-4" />

              <div className="text-center">
                <p className="text-xs text-gray-500">
                  Horario de atención: Lunes a Viernes 8:00 AM - 6:00 PM
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-center text-sm text-gray-500">
            <p>© 2024 ABK Logistics. Todos los derechos reservados.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
