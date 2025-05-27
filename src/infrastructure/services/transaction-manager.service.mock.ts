import { ITransactionManagerService } from '@/src/application/services/transaction-manager.service.interface';
import { ITransaction } from '@/src/entities/models/transaction.interface';

export class MockTransactionManagerService implements ITransactionManagerService {
    public startTransaction<T>(
        clb: (tx: ITransaction) => Promise<T>,
        parent?: ITransaction
    ): Promise<T> {
        // Create a mock transaction with a prisma property
        const mockTransaction: ITransaction = {
            rollback: () => { console.log('Mock transaction rolled back'); },
            prisma: {
                $connect: () => { console.log('Mock transaction connected'); },
                $disconnect: () => { console.log('Mock transaction disconnected'); },
                $transaction: async (callback: () => any) => {
                    return await callback();
                }
            }
        };

        // Use the parent transaction if provided
        const txToUse = parent || mockTransaction;
        return clb(txToUse);
    }
}