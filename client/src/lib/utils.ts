import {clsx, type ClassValue} from 'clsx';
import {twMerge} from 'tailwind-merge';
import { t } from "i18next";

export function cn (...inputs: ClassValue[]) {

  return twMerge(clsx(inputs));

}
