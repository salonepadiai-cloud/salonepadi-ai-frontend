import { useState } from "react";
import {
  getMemories,
  createMemory,
  deleteMemory
} from "../services/memoryService";

export function useMemory() {
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function loadMemories() {
    setLoading(true);
    setError("");

    try {
      const data = await getMemories();

      setMemories(data.memories || data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function addMemory(memory) {
    const data = await createMemory(memory);

    const newMemory =
      data.memory || data;

    setMemories((current) => [
      newMemory,
      ...current
    ]);

    return newMemory;
  }

  async function removeMemory(id) {
    await deleteMemory(id);

    setMemories((current) =>
      current.filter((memory) => memory.id !== id)
    );
  }

  return {
    memories,
    loading,
    error,
    loadMemories,
    addMemory,
    removeMemory
  };
}
