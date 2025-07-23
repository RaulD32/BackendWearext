export interface TutorChildRelation {
    id?: number;
    tutor_id: number;
    child_id: number;
    created_at?: string;
    // Datos adicionales para respuestas
    tutor_name?: string;
    child_name?: string;
    tutor_email?: string;
    child_email?: string;
}

export interface CreateRelationDTO {
    tutor_id: number;
    child_id: number;
}

export interface RelationResponse {
    id: number;
    tutor: {
        id: number;
        name: string;
        email: string;
    };
    child: {
        id: number;
        name: string;
        email: string;
    };
    created_at: string;
}
