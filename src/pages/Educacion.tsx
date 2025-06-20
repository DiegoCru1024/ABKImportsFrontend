import React from "react";
import { BookMarked, Play, FileText, Award, Users, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

function Educacion() {
  const cursos = [
    {
      titulo: "Introducción a Importaciones",
      descripcion: "Conceptos básicos sobre el proceso de importación",
      duracion: "2 horas",
      nivel: "Principiante",
      estudiantes: 124,
    },
    {
      titulo: "Documentación Aduanera",
      descripcion: "Aprende sobre los documentos necesarios para importar",
      duracion: "3 horas",
      nivel: "Intermedio",
      estudiantes: 89,
    },
    {
      titulo: "Costos y Aranceles",
      descripcion: "Cálculo de costos de importación y aranceles",
      duracion: "1.5 horas",
      nivel: "Avanzado",
      estudiantes: 67,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500/5 via-background to-purple-400/10">
      {/* Header */}
      <div className="border-t border-border/60 bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="w-full px-4 py-4 border-b border-border/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500 hover:bg-purple-600">
                <BookMarked className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Centro de Educación
                </h1>
                <p className="text-sm text-muted-foreground">
                  Recursos educativos sobre comercio internacional
                </p>
              </div>
            </div>
            <Button className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-2 rounded-full shadow-md flex items-center gap-2">
              <Play className="h-4 w-4" />
              Comenzar Curso
            </Button>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="p-6">
        {/* Tarjetas de estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cursos Disponibles</CardTitle>
              <BookMarked className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">módulos educativos</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Estudiantes Activos</CardTitle>
              <Users className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">280</div>
              <p className="text-xs text-muted-foreground">usuarios aprendiendo</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Certificaciones</CardTitle>
              <Award className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">45</div>
              <p className="text-xs text-muted-foreground">certificados otorgados</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Horas de Contenido</CardTitle>
              <Clock className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24</div>
              <p className="text-xs text-muted-foreground">horas de video</p>
            </CardContent>
          </Card>
        </div>

        {/* Cursos disponibles */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Cursos Populares</CardTitle>
            <p className="text-sm text-muted-foreground">
              Los cursos más demandados por nuestros usuarios
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cursos.map((curso, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <Badge variant={curso.nivel === "Principiante" ? "secondary" : curso.nivel === "Intermedio" ? "outline" : "destructive"}>
                        {curso.nivel}
                      </Badge>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="h-4 w-4 mr-1" />
                        {curso.duracion}
                      </div>
                    </div>
                    <CardTitle className="text-lg">{curso.titulo}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">
                      {curso.descripcion}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Users className="h-4 w-4 mr-1" />
                        {curso.estudiantes} estudiantes
                      </div>
                      <Button size="sm" className="bg-purple-500 hover:bg-purple-600">
                        <Play className="h-4 w-4 mr-2" />
                        Iniciar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recursos adicionales */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Guías y Manuales
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {["Manual de Importaciones", "Guía de Aranceles", "Documentación Requerida"].map((guia, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50">
                    <span className="text-sm font-medium">{guia}</span>
                    <Button variant="ghost" size="sm">Descargar</Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Award className="h-5 w-5 mr-2" />
                Certificaciones
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {["Especialista en Importaciones", "Experto en Comercio Internacional", "Certificación Aduanera"].map((cert, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50">
                    <span className="text-sm font-medium">{cert}</span>
                    <Badge variant="outline">Disponible</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default Educacion;