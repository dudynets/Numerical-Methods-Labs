export interface LabsStateModel {
  [labId: string]: LabSnapshot | null;
}

export interface LabSnapshot {
  input: LabInput | null;
  output: LabOutput | null;
}

export interface LabInput {
  [key: string]: unknown;
}

export interface LabOutput {
  error?: OutputError;
  [key: string]: string | number | boolean | OutputError | undefined;
}

export interface OutputError {
  status: number;
  statusText: string;
  detail: unknown;
}

export const DEFAULT_LABS_STATE: LabsStateModel = {};
