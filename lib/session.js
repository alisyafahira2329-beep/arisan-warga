import { cookies } from 'next/headers';
import { verify } from './auth';
export const getSession = () => verify(cookies().get('token')?.value);
