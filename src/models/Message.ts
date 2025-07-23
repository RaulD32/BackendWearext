export interface Message {
    id?: number;
    text: string;
    audio_url?: string;
    category_id: number;
    created_by: number;
    is_active?: boolean;
    created_at?: string;
    updated_at?: string;
    // Datos adicionales para respuestas
    category_name?: string;
    creator_name?: string;
}

export interface CreateMessageDTO {
    text: string;
    category_id: number;
}

export interface UpdateMessageDTO {
    text?: string;
    category_id?: number;
    is_active?: boolean;
}

export interface MessageWithAudio extends Message {
    audio_buffer?: Buffer;
    audio_mime_type?: string;
}
