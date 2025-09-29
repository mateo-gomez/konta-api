export interface Account {
    id: string;
    name: string;
    balance: number;
    type: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface AccountInput {
    name: string;
    balance: number;
    type?: string;
}
