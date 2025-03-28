import { FieldValue, Timestamp } from "firebase/firestore";

export interface AccidentReport {
  id: string;
  severity: string;
  contact: string;
  image: string;
  location: {
    latitude: number;
    longitude: number;
  } | null;
  userEmail: string;
  timestamp: FieldValue | Timestamp;
}