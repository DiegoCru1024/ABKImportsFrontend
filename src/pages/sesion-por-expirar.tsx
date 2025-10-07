import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { AlertCircle, LogIn } from "lucide-react";

export default function SesionPorExpirar() {
  const navigate = useNavigate();

  const handleRelogin = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-gradient-to-br from-slate-50 to-gray-100">
      <div className="w-full max-w-md space-y-6">
        {/* Company Brand */}
        <div className="flex justify-center mb-8">
          <img
            src="/LOGO-02.webp"
            alt="ABK Logistics"
            width={100}
            height={100}
            className="h-20 w-auto object-contain"
          />
        </div>

        {/* Warning Card */}
        <Card className="shadow-lg border-orange-200">
          <CardHeader className="space-y-4 pb-6">
            <div className="flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-orange-100">
                <AlertCircle className="h-8 w-8 text-orange-600" />
              </div>
            </div>
            <div className="text-center space-y-2">
              <h1 className="text-2xl font-bold text-gray-900">
                Tu sesión está por expirar
              </h1>
              <p className="text-gray-600">
                Por tu seguridad, tu sesión expirará pronto
              </p>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="space-y-4 rounded-lg bg-orange-50 p-4 border border-orange-200">
              <div className="space-y-2">
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">¿Por qué veo este mensaje?</span>
                </p>
                <p className="text-sm text-gray-600">
                  Tu sesión expirará en menos de 24 horas. Para continuar
                  trabajando sin interrupciones, por favor inicia sesión
                  nuevamente.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <Button
                onClick={handleRelogin}
                className="w-full h-11 bg-orange-600 hover:bg-orange-700 transition-colors"
              >
                <LogIn className="mr-2 h-4 w-4" />
                Iniciar sesión nuevamente
              </Button>

              <Button
                variant="outline"
                onClick={() => navigate(-1)}
                className="w-full h-11 border-gray-300 hover:bg-gray-50 transition-colors"
              >
                Volver atrás
              </Button>
            </div>

            <div className="text-center pt-4">
              <p className="text-xs text-gray-500">
                Tus datos están protegidos y se mantendrán seguros
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
  );
}
