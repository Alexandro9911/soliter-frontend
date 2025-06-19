import { ReactElement } from 'react';

export type ModalType = {
  name: string;
  component: ReactElement;
}

export type CallBackType = (...args: any[]) => void;
