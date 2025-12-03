export interface PageRequestDto {
    page?: number;
    size?: number;
    filter?: string;
    sortBy?: string;
    sortDirection?: 'ASC' | 'DESC';
    sort?: string[];
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
    username: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    pesel: string;
    role: 'USER' | 'ADMIN';
    birthday: string;
    city: string;
    street: string;
    houseNumber: string;
    flatNumber: string | null;
    postalCode: string;
    createdAt: string;
    updatedAt: string;
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
    flatNumber?: string;
    city?: string;
    postalCode?: string;
}

export type PatientUpdateDto = Omit<PatientCreateDto, 'keycloakId'>;

export interface DiagnoseDictionaryResponseDto {
    id: number;
    name: string;
}

export interface ProcedureDictionaryResponseDto {
    id: number;
    name: string;
    price: number;
    isActive: boolean;
}

export interface ToothProcedureResponseDto {
    id: string;
    tooth: string;
    location: string;
    cost: number;
    comment: string;
    createdAt: string;
    procedureDictionary: ProcedureDictionaryResponseDto;
}

export interface ToothDiagnoseResponseDto {
    tooth: string;
    location: string;
    comment: string;
    createdAt: string;
    diagnoseDictionary: DiagnoseDictionaryResponseDto;
    found?: boolean;
}

export interface DocumentResponseDto {
    id: string;
    title: string;
    description: string;
    visitId: string;
    createdAt: string;
}

export interface VisitResponseDto {
    id: string;
    dateTimeStart: string;
    dateTimeEnd: string;
    status: 'STARTED' | 'COMPLETED' | 'PLANNED' | 'CANCELED';
    comment?: string;
    totalCost?: number;
    createdAt: string;
    updatedAt: string;
    patient: UserResponseDto;
    doctor: UserResponseDto;
    procedures: ToothProcedureResponseDto[];
    diagnoses: ToothDiagnoseResponseDto[];
    documents: DocumentResponseDto[];
}

export interface VisitPageRequestDto extends PageRequestDto {
    dateTimeStart?: string;
    dateTimeEnd?: string;
    doctorId?: string;
    patientId?: string;
    status?: 'STARTED' | 'COMPLETED' | 'PLANNED' | 'CANCELED';
}

export interface VisitCreateDto {
    patientId: string;
    doctorId: string;
    dateTimeStart: string;
    dateTimeEnd: string;
}

export interface ToothProcedureCreateDto {
    tooth: string;
    location: string;
    comment: string;
    cost: number;
    procedureDictionaryId: number;
}

export interface ToothDiagnoseCreateDto {
    tooth: string;
    location: string;
    comment: string;
    diagnoseDictionaryId: number;
}

export interface VisitUpdateDto {
    status?: 'STARTED' | 'COMPLETED' | 'PLANNED' | 'CANCELED';
    dateTimeStart?: string;
    dateTimeEnd?: string;
    comment?: string;
    toothProcedures?: ToothProcedureCreateDto[];
    toothDiagnoses?: ToothDiagnoseCreateDto[];
}

export interface TeethDiagnosesResponseDto {
    currentDiagnsoses: ToothDiagnoseResponseDto[];
}

export interface ToothHistoryPageRequestDto extends PageRequestDto {
    patientId: string;
    tooth: string;
    location?: string;
}

export interface ToothHistoryItemResponseDto {
    visitId: string;
    visitStartDateTime: string;
    isDiagnose: boolean;
    isProcedure: boolean;
    procedure?: ToothProcedureResponseDto;
    diagnose?: ToothDiagnoseResponseDto;
    createdAt: string;
}
