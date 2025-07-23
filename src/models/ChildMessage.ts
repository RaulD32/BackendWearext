export interface ChildMessage {
    id?: number;
    child_id: number;
    message_id: number;
    assigned_by: number;
    is_favorite?: boolean;
    assigned_at?: string;
    // Datos adicionales para respuestas
    message_text?: string;
    message_audio_url?: string;
    category_name?: string;
    assigned_by_name?: string;
}

export interface AssignMessageDTO {
    child_id: number;
    message_id: number;
}

export interface UpdateChildMessageDTO {
    is_favorite?: boolean;
}

export interface ChildMessageResponse {
    id: number;
    message: {
        id: number;
        text: string;
        audio_url?: string;
        category: {
            id: number;
            name: string;
            color?: string;
            icon?: string;
        };
    };
    is_favorite: boolean;
    assigned_at: string;
    assigned_by: {
        id: number;
        name: string;
    };
}
