export type UpdateUserRequest = {
    role: "STUDENT" | "FACULTY" | "STAFF";
    studentId: string;
    clientName: string;
}

export const initUpdateUserRequest: UpdateUserRequest = {
    role: "STUDENT",
    studentId: "",
    clientName: "",
}