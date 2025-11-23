export interface PageRequestDto {
    page?: number;
    size?: number;
    filter?: string;
    sortBy?: string;
    sortDirection?: 'ASC' | 'DESC';
}

export interface UserPageRequestDto extends PageRequestDto {
    specificIds?: string[];
    role?: 'USER' | 'ADMIN';
}

export interface PageResponseDto<T> {
    content: T[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    last: boolean;
}

export interface UserResponseDto {
    id: string;
    keycloakId: string;
    firstName: string;
    lastName: string;
    email: string;
    role: 'USER' | 'ADMIN';
    pesel?: string;
    phoneNumber?: string;
}

export interface DentistCreateDto {
    firstName: string;
    username: string;
    lastName: string;
    email: string;
    keycloakId: string;
}

export interface PatientCreateDto {
    keycloakId: string;
    username: string;
    firstName: string;
    lastName: string;
    email: string;
    pesel: string;
    phone: string;
    birthday: string; // ISO date string (YYYY-MM-DD)
    gender?: string;
    street?: string;
    houseNumber?: string;
    apartmentNumber?: string;
    city?: string;
    postalCode?: string;
}

export interface VisitResponseDto {
    id: string;
    patientId: string;
    doctorId: string;
    date: string; // ISO string
    status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
    patientName?: string; // for testing purposes
}

export interface VisitCreateDto {
    patientId: string;
    doctorId: string;
    dateTimeStart: string;
    dateTimeEnd: string;
}

export interface VisitUpdateDto {
    status?: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
    date?: string;
}
