"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

import { login } from "@/api/login";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormItem,
  FormLabel,
  FormField,
  FormMessage,
  FormControl,
} from "@/components/ui/form";
import { toast } from "sonner";
import SendingModal from "@/components/sending-modal";
import { useState } from "react";

const loginSchema = z.object({
  email: z.string().email("El correo electrónico no es válido"),
  password: z.string().min(3),
});

export default function LoginPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof loginSchema>) => {
    setIsLoading(true);
    console.log("Enviando datos:", JSON.stringify(data, null, 2));

    try {
      const res = await login(data.email, data.password);
      console.log("Respuesta del servidor:", res);
      if (res.status === 201) {
        toast.success("Inicio de sesión exitoso");
        localStorage.setItem("access_token", res.data.access_token);
        // Espera 300ms antes de redirigir
        setTimeout(() => {
          navigate("/dashboard");
        }, 300);
        setIsLoading(false);
      } else {
        toast.error("Credenciales incorrectas, por favor intente nuevamente", {
          description: "Por favor, verifique sus credenciales",
        });
      }
    } catch (error) {
      toast.error("Error al iniciar sesión, por favor intente nuevamente");
      setIsLoading(false);
    }
    setIsLoading(false);
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
                src="/LOGO-02.png"
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
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Usuario</FormLabel>
                        <FormControl>
                          <Input
                            id="username"
                            type="text"
                            placeholder="Ingresa tu usuario"
                            className="h-11"
                            required
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contraseña</FormLabel>
                        <FormControl>
                          <Input
                            id="password"
                            type="password"
                            placeholder="Ingresa tu contraseña"
                            className="h-11"
                            required
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    className="w-full h-11 bg-orange-600 hover:bg-orange-700"
                    onClick={form.handleSubmit(onSubmit)}
                  >
                    Iniciar Sesión
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
          {/* Modal de animación de carga */}
          <SendingModal
            isOpen={isLoading}
            onClose={() => setIsLoading(false)}
          />
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
