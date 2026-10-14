import { useQuery } from "@tanstack/react-query";
import { api } from "./api";

export interface Ref { id: number; name: string }
export interface Room extends Ref { floor: number; departmentId: number | null; department?: Ref | null }
export interface UserOption { id: number; fullName: string }

const opts = { staleTime: 60_000 };

export const useTypes = () => useQuery({ queryKey: ["types"], queryFn: () => api<Ref[]>("/equipment-types"), ...opts });
export const useRooms = () => useQuery({ queryKey: ["rooms"], queryFn: () => api<Room[]>("/rooms"), ...opts });
export const useDepartments = () => useQuery({ queryKey: ["departments"], queryFn: () => api<Ref[]>("/departments"), ...opts });
export const useUserOptions = () => useQuery({ queryKey: ["userOptions"], queryFn: () => api<UserOption[]>("/users/options"), ...opts });
