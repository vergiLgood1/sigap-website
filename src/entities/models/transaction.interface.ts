export interface ITransaction {
  rollback: () => void;
  prisma: any;
}
