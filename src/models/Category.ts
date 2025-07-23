export interface Category {
    id?: number;
    name: string;
    description?: string;
    color?: string;
    icon?: string;
    created_at?: string;
    updated_at?: string;
}

export interface CreateCategoryDTO {
    name: string;
    description?: string;
    color?: string;
    icon?: string;
}

export interface UpdateCategoryDTO {
    name?: string;
    description?: string;
    color?: string;
    icon?: string;
}
