const API_BASE_URL = "http://localhost:3000";

interface NotificationResponse {
    content: Array<{
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
    }>;
    pageNumber: number;
    pageSize: number;
    totalElements: number;
    totalPages: number;
    last: boolean;
}

interface NotificationFilters {
    page?: number;
    size?: number;
    type?: "quotation_created" | "quotation_response";
    isRead?: boolean;
    correlative?: string;
}

export const notificationsAPI = {
    getNotifications: async (filters: NotificationFilters = {}): Promise<NotificationResponse> => {
        const token = localStorage.getItem("access_token");
        const params = new URLSearchParams();

        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                params.append(key, value.toString());
            }
        });

        const response = await fetch(`${API_BASE_URL}/notifications?${params}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            throw new Error(`Error fetching notifications: ${response.status}`);
        }

        return response.json();
    },

    markAsRead: async (notificationId: string) => {
        const token = localStorage.getItem("access_token");

        const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}/mark-read`, {
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

        const response = await fetch(`${API_BASE_URL}/notifications/mark-all-read`, {
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

        const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}`, {
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