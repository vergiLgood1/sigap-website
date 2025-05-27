import { Resend } from "resend";

export const useResend = () => {
  const resend = new Resend(process.env.RESEND_API_KEY);

  return {
    resend,
  };
};
