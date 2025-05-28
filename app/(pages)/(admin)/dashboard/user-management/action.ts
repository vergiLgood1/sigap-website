"use server";

import db from '@/prisma/db';
import { createClient } from '@/app/_utils/supabase/server';
import { createAdminClient } from '@/app/_utils/supabase/admin';
import { getInjection } from '@/di/container';
import { InputParseError, NotFoundError } from '@/src/entities/errors/common';
import {
  AuthenticationError,
  UnauthenticatedError,
} from '@/src/entities/errors/auth';
import { redirect } from 'next/navigation';
import { IBanDuration, IBanUserSchema, ICredentialsBanUserSchema } from '@/src/entities/models/users/ban-user.model';
import { ICreateUserSchema } from '@/src/entities/models/users/create-user.model';
import { IUpdateUserSchema } from '@/src/entities/models/users/update-user.model';
import { ICredentialsInviteUserSchema } from '@/src/entities/models/users/invite-user.model';
import { ICredentialGetUserByEmailSchema, ICredentialGetUserByIdSchema, ICredentialGetUserByUsernameSchema } from '@/src/entities/models/users/read-user.model';
import { ICredentialsUnbanUserSchema } from '@/src/entities/models/users/unban-user.model';

export async function banUser(credential: ICredentialsBanUserSchema, data: IBanUserSchema) {
  const instrumentationService = getInjection('IInstrumentationService');
  return await instrumentationService.instrumentServerAction(
    'unbanUser',
    { recordResponse: true },
    async () => {
      try {
        const banUserController = getInjection('IBanUserController');
        await banUserController({ id: credential.id }, { ban_duration: data.ban_duration }); 

        return { success: true };

      } catch (err) {
        if (err instanceof InputParseError) {
          // return {
          //   error: err.message,
          // };

          throw new InputParseError(err.message);
        }

        if (err instanceof UnauthenticatedError) {
          // return {
          //   error: 'Must be logged in to create a user.',
          // };
          throw new UnauthenticatedError('Must be logged in to unban a user.');
        }

        if (err instanceof AuthenticationError) {
          // return {
          //   error: 'User not found.',
          // };

          throw new AuthenticationError(
            'There was an error with the credentials. Please try again or contact support.'
          );
        }

        const crashReporterService = getInjection('ICrashReporterService');
        crashReporterService.report(err);
        // return {
        //   error:
        //     'An error happened. The developers have been notified. Please try again later.',
        // };
        throw new Error('An error happened. The developers have been notified. Please try again later.');
      }
    }
  );
}


export async function unbanUser(credential: ICredentialsUnbanUserSchema) {
  const instrumentationService = getInjection('IInstrumentationService');
  return await instrumentationService.instrumentServerAction(
    'unbanUser',
    { recordResponse: true },
    async () => {
      try {
        const unbanUserController = getInjection('IUnbanUserController');
        await unbanUserController(credential);

        return { success: true };
      } catch (err) {
        if (err instanceof InputParseError) {
          // return {
          //   error: err.message,
          // };

          throw new InputParseError(err.message);
        }

        if (err instanceof UnauthenticatedError) {
          // return {
          //   error: 'Must be logged in to create a user.',
          // };
          throw new UnauthenticatedError('Must be logged in to unban a user.');
        }

        if (err instanceof AuthenticationError) {
        // return {
        //   error: 'User not found.',
        // };

          throw new AuthenticationError('There was an error with the credentials. Please try again or contact support.');
        }

        const crashReporterService = getInjection('ICrashReporterService');
        crashReporterService.report(err);
        // return {
        //   error:
        //     'An error happened. The developers have been notified. Please try again later.',
        // };
        throw new Error('An error happened. The developers have been notified. Please try again later.');
      }
    }
  );
}

export async function getCurrentUser() {
  const instrumentationService = getInjection('IInstrumentationService');
  return await instrumentationService.instrumentServerAction(
    'getCurrentUser',
    { recordResponse: true },
    async () => {
      try {
        const getCurrentUserController = getInjection('IGetCurrentUserController');
        return await getCurrentUserController();
      } catch (err) {

        if (err instanceof UnauthenticatedError || err instanceof AuthenticationError) {
          redirect('/sign-in');
        }

        const crashReporterService = getInjection('ICrashReporterService');
        crashReporterService.report(err);

        throw new Error('An error happened. The developers have been notified. Please try again later.');
      }
    }
  );
}

export async function getAvailableRoles() {
  const instrumentationService = getInjection('IInstrumentationService');
  return await instrumentationService.instrumentServerAction(
    'getUserRoles',
    { recordResponse: true },
    async () => {
      try {

        return await db.roles.findMany({})

      } catch (err) {
        if (err instanceof InputParseError) {
          // return {
          //   error: err.message,
          // };

          throw new InputParseError(err.message);
        }

        if (err instanceof UnauthenticatedError) {
          // return {
          //   error: 'Must be logged in to create a user.',
          // };
          throw new UnauthenticatedError('Must be logged in to get user roles.');
        }

        if (err instanceof AuthenticationError) {
          // return {
          //   error: 'User not found.',
          // };

          throw new AuthenticationError('There was an error with the credentials. Please try again or contact support.');
        }

        const crashReporterService = getInjection('ICrashReporterService');
        crashReporterService.report(err);
        // return {
        //   error:
        //     'An error happened. The developers have been notified. Please try again later.',
        // };
        throw new Error('An error happened. The developers have been notified. Please try again later.');
      }
    }
  );
}

export async function getUserById(credential: ICredentialGetUserByIdSchema) {
  const instrumentationService = getInjection('IInstrumentationService');
  return await instrumentationService.instrumentServerAction(
    'getUserById',
    { recordResponse: true },
    async () => {
      try {
        const getUserByIdController = getInjection('IGetUserByIdController');
        return await getUserByIdController(credential);


      } catch (err) {
        if (err instanceof InputParseError) {
          // return {
          //   error: err.message,
          // };

          throw new InputParseError(err.message);
        }

        if (err instanceof UnauthenticatedError) {
          // return {
          //   error: 'Must be logged in to create a user.',
          // };
          throw new UnauthenticatedError('Must be logged in to get a user.');
        }

        if (err instanceof AuthenticationError) {
          // return {
          //   error: 'User not found.',
          // };

          throw new AuthenticationError('There was an error with the credentials. Please try again or contact support.');
        }

        const crashReporterService = getInjection('ICrashReporterService');
        crashReporterService.report(err);
        // return {
        //   error:
        //     'An error happened. The developers have been notified. Please try again later.',
        // };
        throw new Error('An error happened. The developers have been notified. Please try again later.');
      }
    }
  );
}

export async function getUserByEmail(credential: ICredentialGetUserByEmailSchema) {
  const instrumentationService = getInjection('IInstrumentationService');
  return await instrumentationService.instrumentServerAction(
    'getUserByEmail',
    { recordResponse: true },
    async () => {
      try {
        const getUserByEmailController = getInjection(
          'IGetUserByEmailController'
        );
        return await getUserByEmailController({ email: credential.email });


      } catch (err) {
        if (err instanceof InputParseError) {
      // return {
      //   error: err.message,
      // };

          throw new InputParseError(err.message);
        }

        if (err instanceof UnauthenticatedError) {
          // return {
          //   error: 'Must be logged in to create a user.',
          // };
          throw new UnauthenticatedError('Must be logged in to get a user.');
        }

        if (err instanceof AuthenticationError) {
        // return {
        //   error: 'User not found.',
        // };

          throw new AuthenticationError('There was an error with the credentials. Please try again or contact support.');
        }

        const crashReporterService = getInjection('ICrashReporterService');
        crashReporterService.report(err);
        // return {
        //   error:
        //     'An error happened. The developers have been notified. Please try again later.',
        // };
        throw new Error('An error happened. The developers have been notified. Please try again later.');
      }
    }
  );
}

export async function getUserByUsername(credential: ICredentialGetUserByUsernameSchema) {
  const instrumentationService = getInjection('IInstrumentationService');
  return await instrumentationService.instrumentServerAction(
    'getUserByUsername',
    { recordResponse: true },
    async () => {
      try {
        const getUserByUsernameController = getInjection(
          'IGetUserByUsernameController'
        );
        return await getUserByUsernameController(credential);


      } catch (err) {

        if (err instanceof InputParseError) {
          // return {
          //   error: err.message,
          // };

          throw new InputParseError(err.message);
        }

        if (err instanceof UnauthenticatedError) {
          // return {
          //   error: 'Must be logged in to create a user.',
          // };
          throw new UnauthenticatedError('Must be logged in to get a user.');
        }

        if (err instanceof AuthenticationError) {
        // return {
        //   error: 'User not found.',
        // };

          throw new AuthenticationError('There was an error with the credentials. Please try again or contact support.');
        }

        const crashReporterService = getInjection('ICrashReporterService');
        crashReporterService.report(err);
        // return {
        //   error:
        //     'An error happened. The developers have been notified. Please try again later.',
        // };
        throw new Error('An error happened. The developers have been notified. Please try again later.');
      }
    }
  );
}

export async function getUsers() {
  const instrumentationService = getInjection('IInstrumentationService');
  return await instrumentationService.instrumentServerAction(
    'getUsers',
    { recordResponse: true },
    async () => {
      try {
        const getUsersController = getInjection('IGetUsersController');
        return await getUsersController();
      } catch (err) {
        if (
          err instanceof UnauthenticatedError ||
          err instanceof AuthenticationError
        ) {
          redirect('/sign-in');
        }

        const crashReporterService = getInjection('ICrashReporterService');
        crashReporterService.report(err);
        throw new Error('An error happened. The developers have been notified. Please try again later.');
      }
    }
  );
}

export async function inviteUser(credentials: ICredentialsInviteUserSchema) {
  const instrumentationService = getInjection('IInstrumentationService');
  return await instrumentationService.instrumentServerAction(
    'inviteUser',
    { recordResponse: true },
    async () => {
      try {
        const inviteUserController = getInjection('IInviteUserController');
        await inviteUserController({ email: credentials.email });

        return { success: true };
      } catch (err) {

        if (err instanceof InputParseError) {
        // return {
        //   error: err.message,
        // };

          throw new InputParseError(err.message);
        }

        if (err instanceof UnauthenticatedError) {
          // return {
          //   error: 'Must be logged in to create a user.',
          // };
          throw new UnauthenticatedError('Must be logged in to invite a user.');
        }

        if (err instanceof AuthenticationError) {
        // return {
        //   error: 'User not found.',
        // };

          throw new AuthenticationError('There was an error with the credentials. Please try again or contact support.');
        }

        const crashReporterService = getInjection('ICrashReporterService');
        crashReporterService.report(err);
        // return {
        //   error:
        //     'An error happened. The developers have been notified. Please try again later.',
        // };
        throw new Error('An error happened. The developers have been notified. Please try again later.');
      }
    }
  );
}

export async function createUser(data: ICreateUserSchema) {
  const instrumentationService = getInjection('IInstrumentationService');
  return await instrumentationService.instrumentServerAction(
    'createUser',
    { recordResponse: true },
    async () => {
      try {
        const createUserController = getInjection('ICreateUserController');
        await createUserController(data);

        return { success: true };

      } catch (err) {

        if (err instanceof InputParseError) {
          // return {
          //   error: err.message,
          // };

          throw new InputParseError(err.message);
        }

        if (err instanceof UnauthenticatedError) {
          // return {
          //   error: 'Must be logged in to create a user.',
          // };
          throw new UnauthenticatedError('Must be logged in to create a user.');
        }

        if (err instanceof AuthenticationError) {
        // return {
        //   error: 'User not found.',
        // };

          throw new AuthenticationError('There was an error with the credentials. Please try again or contact support.');
        }

        const crashReporterService = getInjection('ICrashReporterService');
        crashReporterService.report(err);
        // return {
        //   error:
        //     'An error happened. The developers have been notified. Please try again later.',
        // };
        throw new Error('An error happened. The developers have been notified. Please try again later.');
      }
    }
  );
}

export async function updateUser(id: string, data: IUpdateUserSchema) {
  const instrumentationService = getInjection('IInstrumentationService');
  return await instrumentationService.instrumentServerAction(
    'updateUser',
    { recordResponse: true },
    async () => {
      try {
        const updateUserController = getInjection('IUpdateUserController');
        await updateUserController(id, data);

        return { success: true };
      } catch (err) {
        if (err instanceof InputParseError) {
  // return {
  //   error: err.message,
  // };

          throw new InputParseError(err.message);
        }

        if (err instanceof UnauthenticatedError) {
          // return {
          //   error: 'Must be logged in to create a user.',
          // };
          throw new UnauthenticatedError('Must be logged in to update a user.');
        }

        if (err instanceof AuthenticationError) {
          // return {
          //   error: 'User not found.',
          // };

          throw new AuthenticationError('There was an error with the credentials. Please try again or contact support.');
        }

        const crashReporterService = getInjection('ICrashReporterService');
        crashReporterService.report(err);
        // return {
        //   error:
        //     'An error happened. The developers have been notified. Please try again later.',
        // };
        throw new Error('An error happened. The developers have been notified. Please try again later.');
      }
    }
  );
}

export async function deleteUser(id: string) {
  const instrumentationService = getInjection('IInstrumentationService');
  return await instrumentationService.instrumentServerAction(
    'deleteUser',
    { recordResponse: true },
    async () => {
      try {
        const deleteUserController = getInjection('IDeleteUserController');
        await deleteUserController({ id });

        return { success: true };
      } catch (err) {
        if (err instanceof InputParseError) {
          // return {
          //   error: err.message,
          // };

          throw new InputParseError(err.message);
        }

        if (err instanceof UnauthenticatedError) {
          // return {
          //   error: 'Must be logged in to create a user.',
          // };
          throw new UnauthenticatedError('Must be logged in to delete a user.');
        }

        if (err instanceof AuthenticationError) {
        // return {
        //   error: 'User not found.',
        // };

          throw new AuthenticationError('There was an error with the credentials. Please try again or contact support.');
        }

        const crashReporterService = getInjection('ICrashReporterService');
        crashReporterService.report(err);
        // return {
        //   error:
        //     'An error happened. The developers have been notified. Please try again later.',
        // };
        throw new Error('An error happened. The developers have been notified. Please try again later.');
      }
    }
  );
}


export async function uploadAvatar(id: string, file: File) {
  const instrumentationService = getInjection('IInstrumentationService');
  return await instrumentationService.instrumentServerAction(
    'uploadAvatar',
    { recordResponse: true },
    async () => {
      try {
        const uploadAvatarController = getInjection('IUploadAvatarController');
        const newAvatar = await uploadAvatarController(id, file);

        return { success: true, newAvatar };

      } catch (err) {
        if (err instanceof InputParseError) {
          // return {
          //   error: err.message,
          // };

          throw new InputParseError(err.message);
        }

        if (err instanceof UnauthenticatedError) {
          // return {
          //   error: 'Must be logged in to create a user.',
          // };
          throw new UnauthenticatedError('Must be logged in to upload an avatar.');
        }

        if (err instanceof AuthenticationError) {
          // return {
          //   error: 'User not found.',
          // };

          throw new AuthenticationError('There was an error with the credentials. Please try again or contact support.');
        }

        const crashReporterService = getInjection('ICrashReporterService');
        crashReporterService.report(err);
        // return {
        //   error:
        //     'An error happened. The developers have been notified. Please try again later.',
        // };
        throw new Error('An error happened. The developers have been notified. Please try again later.');
      }
    }
  );
}
