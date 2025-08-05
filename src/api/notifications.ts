import { API_URL } from "../../config";

interface NotificationResponse {
  
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

interface NotificationFilters {
    page?: number;
    size?: number;
    type?: "quotation_created" | "quotation_response";
    isRead?: boolean;
    correlative?: string;
}

export const notificationsAPI = {
    getNotifications: async (): Promise<NotificationResponse[]> => {
        const token = localStorage.getItem("access_token");

        const response = await fetch(`${API_URL}/notifications`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });

        console.log(response);

        if (!response.ok) {
            throw new Error(`Error fetching notifications: ${response.status}`);
        }

        return response.json();
    },

    markAsRead: async (notificationId: string) => {
        const token = localStorage.getItem("access_token");

        const response = await fetch(`${API_URL}/notifications/${notificationId}/read`, {
            method: "PATCH",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            throw new Error(`Error marking notification as read: ${response.status}`);
        }

        return response.json();
    },

    markAllAsRead: async () => {
        const token = localStorage.getItem("access_token");

        const response = await fetch(`${API_URL}/notifications/all-read`, {
            method: "PATCH",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            throw new Error(`Error marking all notifications as read: ${response.status}`);
        }

        return response.json();
    },

    deleteNotification: async (notificationId: string) => {
        const token = localStorage.getItem("access_token");

        const response = await fetch(`${API_URL}/notifications/${notificationId}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            throw new Error(`Error deleting notification: ${response.status}`);
        }

        return response.json();
    },
}; 