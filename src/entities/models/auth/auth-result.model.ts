import { z } from 'zod';
import { Session } from '@/src/entities/models/auth/session.model';

export interface AuthResult {
    data: {
        user: null;
        session: Session | null;
        messageId?: string | null;
    } | undefined;
}


