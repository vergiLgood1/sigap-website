
import { PrismaClient, Prisma } from '@prisma/client';
import { ITransactionManagerService } from '@/src/application/services/transaction-manager.service.interface';
import { ITransaction } from '@/src/entities/models/transaction.interface';
import db from '@/prisma/db';

export class TransactionManagerService implements ITransactionManagerService {
    public async startTransaction<T>(
        clb: (tx: ITransaction) => Promise<T>,
        parent?: ITransaction
    ): Promise<T> {
        // If a parent transaction is provided, use it
        if (parent) {
            return clb(parent);
        }

        // Otherwise start a new transaction
        return await db.$transaction(async (prismaTransaction) => {
            // Create a transaction wrapper that implements ITransaction
            const txWrapper: ITransaction = {
                rollback: () => {
                    throw new Prisma.PrismaClientKnownRequestError(
                        'Transaction has been rolled back.',
                        { clientVersion: Prisma.prismaVersion.client, code: 'P2034' }
                    );
                },
                prisma: prismaTransaction
            };

            return await clb(txWrapper);
        });
    }
}