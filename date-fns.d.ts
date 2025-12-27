declare module 'date-fns' {
  export interface FormatDistanceOptions {
    addSuffix?: boolean;
    includeSeconds?: boolean;
  }

  export function formatDistanceToNow(
    date: Date | number | string,
    options?: FormatDistanceOptions
  ): string;

  export function format(
    date: Date | number | string,
    formatString: string,
    options?: object
  ): string;

  export function parseISO(argument: string): Date;

  export function isValid(date: unknown): boolean;

  export function addDays(date: Date | number, amount: number): Date;

  export function addMonths(date: Date | number, amount: number): Date;

  export function addYears(date: Date | number, amount: number): Date;

  export function subDays(date: Date | number, amount: number): Date;

  export function subMonths(date: Date | number, amount: number): Date;

  export function differenceInDays(
    dateLeft: Date | number,
    dateRight: Date | number
  ): number;

  export function differenceInMonths(
    dateLeft: Date | number,
    dateRight: Date | number
  ): number;

  export function startOfDay(date: Date | number): Date;

  export function endOfDay(date: Date | number): Date;

  export function startOfMonth(date: Date | number): Date;

  export function endOfMonth(date: Date | number): Date;

  export function isBefore(date: Date | number, dateToCompare: Date | number): boolean;

  export function isAfter(date: Date | number, dateToCompare: Date | number): boolean;

  export function formatDistance(
    date: Date | number,
    baseDate: Date | number,
    options?: FormatDistanceOptions
  ): string;

  export function formatRelative(
    date: Date | number,
    baseDate: Date | number,
    options?: object
  ): string;
}
