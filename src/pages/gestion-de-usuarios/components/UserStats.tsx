import React from "react";
import { Users, UserCheck, Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { UserProfile } from "@/api/interface/user";

interface UserStatsProps {
  users: UserProfile[];
  totalUsers: number;
}

const UserStats: React.FC<UserStatsProps> = ({ users, totalUsers }) => {
  // Calcular estadísticas
  const activeUsers = users.filter(user => user.type === "final").length;
  const adminUsers = users.filter(user => user.type === "admin").length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">
            Total Usuarios
          </CardTitle>
          <Users className="h-4 w-4 text-orange-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-900">{totalUsers}</div>
          <p className="text-xs text-muted-foreground">
            usuarios registrados
          </p>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">
            Usuarios Finales
          </CardTitle>
          <UserCheck className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-900">{activeUsers}</div>
          <p className="text-xs text-muted-foreground">
            usuarios finales
          </p>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">
            Administradores
          </CardTitle>
          <Shield className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-900">{adminUsers}</div>
          <p className="text-xs text-muted-foreground">
            con permisos de admin
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserStats;
