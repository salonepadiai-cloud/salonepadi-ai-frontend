import { api } from "./api";

export function getMemories() {
  return api.get("/api/memory");
}

export function createMemory(memory) {
  return api.post("/api/memory", memory);
}

export function deleteMemory(id) {
  return api.delete(`/api/memory/${id}`);
}
