import { createContext, useContext, useReducer, ReactNode } from "react";

export interface SelectedSlot {
  teacherId: number;
  teacherName: string;
  subject?: string;
  room?: string;
  slotId: number;
  startTime: string;
  endTime: string;
}

interface BookingState {
  eventCode: string | null;
  eventId: number | null;
  parentName: string;
  parentEmail: string;
  studentNames: string[];
  selections: SelectedSlot[];
}

type BookingAction =
  | { type: "setEvent"; code: string; eventId: number }
  | { type: "setParentDetails"; name: string; email: string; students: string[] }
  | { type: "addSelection"; payload: SelectedSlot }
  | { type: "removeSelection"; slotId: number }
  | { type: "reset" };

const initialState: BookingState = {
  eventCode: null,
  eventId: null,
  parentName: "",
  parentEmail: "",
  studentNames: [],
  selections: [],
};

function bookingReducer(state: BookingState, action: BookingAction): BookingState {
  switch (action.type) {
    case "setEvent":
      return {
        ...state,
        eventCode: action.code,
        eventId: action.eventId,
        selections: [],
      };
    case "setParentDetails":
      return {
        ...state,
        parentName: action.name,
        parentEmail: action.email,
        studentNames: action.students,
      };
    case "addSelection":
      return {
        ...state,
        selections: [...state.selections.filter((s) => s.slotId !== action.payload.slotId), action.payload],
      };
    case "removeSelection":
      return {
        ...state,
        selections: state.selections.filter((s) => s.slotId !== action.slotId),
      };
    case "reset":
      return initialState;
    default:
      return state;
  }
}

interface BookingContextValue extends BookingState {
  dispatch: (action: BookingAction) => void;
}

const BookingContext = createContext<BookingContextValue | undefined>(undefined);

export function BookingProvider({ children }: { children: ReactNode }): JSX.Element {
  const [state, dispatch] = useReducer(bookingReducer, initialState);

  return (
    <BookingContext.Provider
      value={{
        ...state,
        dispatch,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
}

export function useBookingContext(): BookingContextValue {
  const ctx = useContext(BookingContext);
  if (!ctx) {
    throw new Error("useBookingContext must be used within a BookingProvider");
  }
  return ctx;
}

