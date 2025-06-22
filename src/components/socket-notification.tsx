import { Bell, X } from "lucide-react";
import { io, Socket } from "socket.io-client";
import { useEffect, useState, useRef } from "react";
import { toast } from "sonner";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Notification {
    id: string;
    type: string;
    data: {
        quotationId: string;
        correlative: string;
        message: string;
        timestamp: string;
    };
    read: boolean;
}

export default function SocketNotification() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const socketRef = useRef<Socket | null>(null);
    const access_token = localStorage.getItem("access_token");

    useEffect(() => {
        const savedNotifications = localStorage.getItem("notifications");
        if (savedNotifications) {
            try {
                setNotifications(JSON.parse(savedNotifications));
            } catch (error) {
                console.error("Error loading notifications from localStorage:", error);
            }
        }
    }, []);

    useEffect(() => {
        localStorage.setItem("notifications", JSON.stringify(notifications));
    }, [notifications]);

    useEffect(() => {
        if (!access_token) return;

        socketRef.current = io("https://abkimportsbackend-production.up.railway.app", {
            auth: {
                token: access_token,
            },
        });

        const socket = socketRef.current;

        socket.on("connect", () => {
            console.log("Connected to socket");
        });

        socket.on("error", (error) => {
            console.log("Error", error);
        });

        socket.on("notification", (data) => {
            console.log("Notification received", data);

            const newNotification: Notification = {
                id: `${data.data.quotationId}-${Date.now()}`,
                type: data.type,
                data: data.data,
                read: false,
            };

            setNotifications(prev => [newNotification, ...prev]);

            toast.success("Nueva notificación", {
                description: data.data.message,
                duration: 5000,
                action: {
                    label: "Ver",
                    onClick: () => setIsOpen(true),
                },
            });
        });

        socket.on("disconnect", () => {
            console.log("Disconnected from socket");
        });

        return () => {
            socket.disconnect();
        };
    }, [access_token]);

    const unreadCount = notifications.filter(n => !n.read).length;

    const deleteNotification = (notificationId: string) => {
        setNotifications(prev =>
            prev.filter(n => n.id !== notificationId)
        );
    };

    const clearAllNotifications = () => {
        setNotifications([]);
    };

    const formatTimestamp = (timestamp: string) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

        if (diffInMinutes < 1) return "Ahora";
        if (diffInMinutes < 60) return `${diffInMinutes}m`;
        if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
        return `${Math.floor(diffInMinutes / 1440)}d`;
    };

    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
                <div className="ml-auto relative cursor-pointer">
                    <Bell className="w-5 h-5 text-yellow-500 hover:text-yellow-600 transition-colors" />
                    {unreadCount > 0 && (
                        <Badge
                            variant="destructive"
                            className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
                        >
                            {unreadCount > 99 ? '99+' : unreadCount}
                        </Badge>
                    )}
                </div>
            </SheetTrigger>

            <SheetContent side="right" className="w-80 p-0">
                <SheetHeader className="px-4 py-4 border-b">
                    <div className="flex items-center justify-between">
                        <SheetTitle className="text-lg font-semibold">Notificaciones</SheetTitle>
                    </div>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto">
                    {notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-40 text-center p-4">
                            <Bell className="w-8 h-8 text-muted-foreground mb-2" />
                            <p className="text-sm text-muted-foreground">No hay notificaciones</p>
                        </div>
                    ) : (
                        <div className="p-2">
                            {notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`relative p-3 mb-2 rounded-lg border hover:bg-muted/50 transition-colors ${!notification.read ? 'bg-blue-50/50 border-blue-200' : 'bg-background'
                                        }`}
                                >
                                    {!notification.read && (
                                        <div className="absolute top-3 left-3 w-2 h-2 bg-blue-500 rounded-full" />
                                    )}

                                    <div className={`${!notification.read ? 'ml-4' : ''}`}>
                                        <div className="flex items-center justify-between mb-2">
                                            <Badge variant="secondary" className="text-xs">
                                                Nueva Cotización
                                            </Badge>
                                            <div className="flex items-center gap-1">
                                                <span className="text-xs text-muted-foreground">
                                                    {formatTimestamp(notification.data.timestamp)}
                                                </span>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => deleteNotification(notification.id)}
                                                    className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                                                >
                                                    <X className="w-3 h-3" />
                                                </Button>
                                            </div>
                                        </div>

                                        <p className="text-sm font-medium mb-1">
                                            {notification.data.message}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {notification.data.correlative}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {notifications.length > 0 && (
                    <div className="border-t p-3">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={clearAllNotifications}
                            className="w-full text-xs text-muted-foreground hover:text-destructive"
                        >
                            Limpiar todas las notificaciones
                        </Button>
                    </div>
                )}
            </SheetContent>
        </Sheet>
    );
}