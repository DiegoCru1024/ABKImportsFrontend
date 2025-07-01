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
import { notificationsAPI } from "@/api/notifications";

interface Notification {
    id: string;
    type: "quotation_created" | "quotation_response";
    title: string;
    message: string;
    quotationId: string;
    correlative: string;
    data: any;
    isRead: boolean;
    createdAt: string;
    updatedAt: string;
}

export default function SocketNotification() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const socketRef = useRef<Socket | null>(null);
    const access_token = localStorage.getItem("access_token");

    const loadNotifications = async () => {
        try {
            setLoading(true);
            const response = await notificationsAPI.getNotifications({
                size: 50,
                page: 1
            });
            setNotifications(response.content);
        } catch (error) {
            console.error("Error loading notifications:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (access_token) {
            loadNotifications();
        }
    }, [access_token]);

    useEffect(() => {
        if (!access_token) return;

        socketRef.current = io("https://abkimportsbackend-production.up.railway.app", {
            auth: {
                token: access_token,
            },
        });

        const socket = socketRef.current;

        socket.on("connected", (data) => {
            console.log("Connected to socket:", data.message);
            loadNotifications();
        });

        socket.on("error", (error) => {
            console.log("Socket error:", error);
        });

        socket.on("notification", (data) => {
            const newNotification: Notification = {
                id: `${data.data.quotationId}-${Date.now()}`,
                type: data.type,
                title: data.type === 'quotation_created' ? 'Nueva Cotización' : 'Respuesta de Cotización',
                message: data.data.message,
                quotationId: data.data.quotationId,
                correlative: data.data.correlative,
                data: data.data,
                isRead: false,
                createdAt: data.data.timestamp,
                updatedAt: data.data.timestamp,
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

    const unreadCount = notifications.filter(n => !n.isRead).length;

    const markAsRead = async (isRead: boolean, notificationId: string) => {
        try {
            if (isRead) return;
            await notificationsAPI.markAsRead(notificationId);
            setNotifications(prev =>
                prev.map(n =>
                    n.id === notificationId ? { ...n, isRead: true, updatedAt: new Date().toISOString() } : n
                )
            );
        } catch (error) {
            console.error("Error marking notification as read:", error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await notificationsAPI.markAllAsRead();
            setNotifications(prev =>
                prev.map(n => ({ ...n, isRead: true, updatedAt: new Date().toISOString() }))
            );
        } catch (error) {
            console.error("Error marking all as read:", error);
        }
    };

    const deleteNotification = async (notificationId: string) => {
        try {
            await notificationsAPI.deleteNotification(notificationId);
            setNotifications(prev =>
                prev.filter(n => n.id !== notificationId)
            );
        } catch (error) {
            console.error("Error deleting notification:", error);
        }
    };

    const clearAllNotifications = () => {
        notifications.forEach(notification => {
            deleteNotification(notification.id);
        });
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

    const getNotificationBadgeText = (type: string) => {
        switch (type) {
            case 'quotation_created':
                return 'Nueva Cotización';
            case 'quotation_response':
                return 'Respuesta';
            default:
                return 'Notificación';
        }
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
                        {unreadCount > 0 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={markAllAsRead}
                                className="text-xs h-8 px-2"
                            >
                                Marcar como leídas
                            </Button>
                        )}
                    </div>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto">
                    {loading ? (
                        <div className="flex items-center justify-center h-32">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-yellow-500"></div>
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-40 text-center p-4">
                            <Bell className="w-8 h-8 text-muted-foreground mb-2" />
                            <p className="text-sm text-muted-foreground">No hay notificaciones</p>
                        </div>
                    ) : (
                        <div className="p-2">
                            {notifications.map((notification) => (
                                <div
                                    onClick={() => markAsRead(notification.isRead, notification.id)}
                                    key={notification.id}
                                    className={`relative cursor-pointer p-3 mb-2 rounded-lg border hover:bg-muted/50 transition-colors ${!notification.isRead ? 'bg-blue-50/50 border-blue-200' : 'bg-background'
                                        }`}
                                >
                                    {!notification.isRead && (
                                        <div
                                            className="absolute top-3 left-3 w-2 h-2 bg-blue-500 rounded-full hover:bg-blue-600"
                                            title="Marcar como leída"
                                        />
                                    )}

                                    <div className={`${!notification.isRead ? 'ml-4' : ''}`}>
                                        <div className="flex items-center justify-between mb-2">
                                            <Badge variant="secondary" className="text-xs">
                                                {getNotificationBadgeText(notification.type)}
                                            </Badge>
                                            <div className="flex items-center gap-1">
                                                <span className="text-xs text-muted-foreground">
                                                    {formatTimestamp(notification.createdAt)}
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
                                            {notification.message}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {notification.correlative}
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