export interface Transaction {
    id: string;
    type: string;
    amount: number;
    description: string;
    accountId: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface TransactionInput {
    type: string;
    amount: number;
    description: string;
    accountId: string;
    date?: Date;
}
