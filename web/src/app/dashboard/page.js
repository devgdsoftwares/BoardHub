"use client";
import { useEffect, useState } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { restrictToParentElement } from "@dnd-kit/modifiers";

function ThemeToggle() {
  const [theme, setTheme] = useState(null);
  useEffect(() => {
    const stored = localStorage.getItem("theme") || "system";
    setTheme(stored);
  }, []);
  useEffect(() => {
    if (!theme) return;
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else if (theme === "light") {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    } else {
      // system
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      const apply = () => {
        if (mq.matches) root.classList.add("dark");
        else root.classList.remove("dark");
      };
      apply();
      mq.addEventListener("change", apply);
      localStorage.setItem("theme", "system");
      return () => mq.removeEventListener("change", apply);
    }
  }, [theme]);
  if (!theme) return null;
  return (
    <div className="mb-4 flex gap-2 items-center">
      <span>Theme:</span>
      <button
        className={`px-2 py-1 rounded ${theme === "light" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
        onClick={() => setTheme("light")}
      >
        Light
      </button>
      <button
        className={`px-2 py-1 rounded ${theme === "dark" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
        onClick={() => setTheme("dark")}
      >
        Dark
      </button>
      <button
        className={`px-2 py-1 rounded ${theme === "system" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
        onClick={() => setTheme("system")}
      >
        System
      </button>
    </div>
  );
}

export default function DashboardPage() {
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [creating, setCreating] = useState(false);
  const [selectedBoard, setSelectedBoard] = useState(null);
  const [editingBoardId, setEditingBoardId] = useState(null);
  const [editTitle, setEditTitle] = useState("");

  useEffect(() => {
    async function fetchBoards() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch("/api/boards");
        const data = await res.json();
        if (res.ok) {
          setBoards(data.boards);
        } else {
          setError(data.error || "Failed to fetch boards");
        }
      } catch (err) {
        setError("Failed to fetch boards");
      }
      setLoading(false);
    }
    fetchBoards();
  }, []);

  async function handleCreate(e) {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setCreating(true);
    setError("");
    try {
      const res = await fetch("/api/boards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle }),
      });
      const data = await res.json();
      if (res.ok) {
        setBoards(prev => [...prev, data.board]);
        setNewTitle("");
      } else {
        setError(data.error || "Failed to create board");
      }
    } catch {
      setError("Failed to create board");
    }
    setCreating(false);
  }

  async function handleDelete(boardId) {
    if (!window.confirm("Delete this board?")) return;
    try {
      const res = await fetch(`/api/boards/${boardId}`, { method: "DELETE" });
      if (res.ok) {
        setBoards(boards.filter(b => b._id !== boardId));
        if (selectedBoard && selectedBoard._id === boardId) setSelectedBoard(null);
      } else {
        setError("Failed to delete board");
      }
    } catch {
      setError("Failed to delete board");
    }
  }

  async function handleEdit(boardId) {
    if (!editTitle.trim()) return;
    try {
      const res = await fetch(`/api/boards/${boardId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: editTitle }),
      });
      const data = await res.json();
      if (res.ok) {
        setBoards(boards.map(b => b._id === boardId ? { ...b, title: data.board.title } : b));
        setEditingBoardId(null);
        setEditTitle("");
      } else {
        setError(data.error || "Failed to edit board");
      }
    } catch {
      setError("Failed to edit board");
    }
  }

  return (
    <div className="p-8">
      <ThemeToggle />
      <h1 className="text-3xl font-bold mb-4">Your Boards</h1>
      <div className="bg-white dark:bg-gray-800 p-4 rounded shadow mb-4">
        <form onSubmit={handleCreate} className="flex gap-2 mb-2">
          <input
            type="text"
            placeholder="New board title"
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            className="flex-1 p-2 border rounded"
            disabled={creating}
            required
          />
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded" disabled={creating}>
            {creating ? "Creating..." : "Create Board"}
          </button>
        </form>
        {error && <div className="text-red-500 mb-2">{error}</div>}
        {loading ? (
          <SkeletonBoards />
        ) : boards.length === 0 ? (
          <p>No boards found.</p>
        ) : (
          <ul className="space-y-2">
            {boards.map(board => (
              <li key={board._id} className="flex items-center gap-2">
                {editingBoardId === board._id ? (
                  <>
                    <input
                      value={editTitle}
                      onChange={e => setEditTitle(e.target.value)}
                      className="p-1 border rounded"
                    />
                    <button onClick={() => handleEdit(board._id)} className="text-green-600">Save</button>
                    <button onClick={() => setEditingBoardId(null)} className="text-gray-600">Cancel</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => setSelectedBoard(board)} className="font-semibold hover:underline">
                      {board.title}
                    </button>
                    <button onClick={() => { setEditingBoardId(board._id); setEditTitle(board.title); }} className="text-blue-600">Edit</button>
                    <button onClick={() => handleDelete(board._id)} className="text-red-600">Delete</button>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
      {selectedBoard && (
        <BoardView board={selectedBoard} onBack={() => setSelectedBoard(null)} />
      )}
    </div>
  );
}

function SkeletonBoards() {
  return (
    <ul className="space-y-2 animate-pulse">
      {[1, 2, 3].map(i => (
        <li key={i} className="h-8 bg-gray-200 dark:bg-gray-700 rounded" />
      ))}
    </ul>
  );
}

function BoardView({ board, onBack }) {
  // Lists state
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [creating, setCreating] = useState(false);
  const [editingListId, setEditingListId] = useState(null);
  const [editTitle, setEditTitle] = useState("");

  // DnD sensors
  const sensors = useSensors(useSensor(PointerSensor));

  useEffect(() => {
    async function fetchLists() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`/api/lists?boardId=${board._id}`);
        const data = await res.json();
        if (res.ok) {
          setLists(data.lists);
        } else {
          setError(data.error || "Failed to fetch lists");
        }
      } catch (err) {
        setError("Failed to fetch lists");
      }
      setLoading(false);
    }
    fetchLists();
  }, [board._id]);

  async function handleCreate(e) {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setCreating(true);
    setError("");
    try {
      const res = await fetch("/api/lists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle, boardId: board._id, position: lists.length }),
      });
      const data = await res.json();
      if (res.ok) {
        setLists(prev => [...prev, data.list]);
        setNewTitle("");
      } else {
        setError(data.error || "Failed to create list");
      }
    } catch {
      setError("Failed to create list");
    }
    setCreating(false);
  }

  async function handleDelete(listId) {
    if (!window.confirm("Delete this list?")) return;
    try {
      const res = await fetch(`/api/lists`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listId, boardId: board._id }),
      });
      if (res.ok) {
        setLists(lists.filter(l => l._id !== listId));
      } else {
        setError("Failed to delete list");
      }
    } catch {
      setError("Failed to delete list");
    }
  }

  async function handleEdit(listId) {
    if (!editTitle.trim()) return;
    try {
      const res = await fetch(`/api/lists`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listId, title: editTitle }),
      });
      const data = await res.json();
      if (res.ok) {
        setLists(lists.map(l => l._id === listId ? { ...l, title: data.list.title } : l));
        setEditingListId(null);
        setEditTitle("");
      } else {
        setError(data.error || "Failed to edit list");
      }
    } catch {
      setError("Failed to edit list");
    }
  }

  function handleDragEnd(event) {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = lists.findIndex(l => l._id === active.id);
      const newIndex = lists.findIndex(l => l._id === over.id);
      setLists(arrayMove(lists, oldIndex, newIndex));
      // TODO: Persist new order to backend
    }
  }

  return (
    <div className="mt-8">
      <button onClick={onBack} className="mb-4 text-blue-600 hover:underline">&larr; Back to boards</button>
      <h2 className="text-2xl font-bold mb-4">{board.title}</h2>
      <div className="mb-4">
        <form onSubmit={handleCreate} className="flex gap-2 mb-2">
          <input
            type="text"
            placeholder="New list title"
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            className="flex-1 p-2 border rounded"
            disabled={creating}
            required
          />
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded" disabled={creating}>
            {creating ? "Creating..." : "Add List"}
          </button>
        </form>
        {error && <div className="text-red-500 mb-2">{error}</div>}
      </div>
      {loading ? (
        <SkeletonLists />
      ) : lists.length === 0 ? (
        <p>No lists found.</p>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd} modifiers={[restrictToParentElement]}>
          <SortableContext items={lists.map(l => l._id)} strategy={verticalListSortingStrategy}>
            <div className="flex gap-4 overflow-x-auto">
              {lists.map(list => (
                <ListView key={list._id} list={list} boardId={board._id} onDelete={handleDelete} onEdit={handleEdit} editingListId={editingListId} setEditingListId={setEditingListId} editTitle={editTitle} setEditTitle={setEditTitle} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}

function SkeletonLists() {
  return (
    <div className="flex gap-4 animate-pulse">
      {[1, 2, 3].map(i => (
        <div key={i} className="w-64 h-40 bg-gray-200 dark:bg-gray-700 rounded" />
      ))}
    </div>
  );
}

function ListView({ list, boardId, onDelete, onEdit, editingListId, setEditingListId, editTitle, setEditTitle }) {
  // Cards state
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [creating, setCreating] = useState(false);
  const [editingCardId, setEditingCardId] = useState(null);
  const [editCardTitle, setEditCardTitle] = useState("");
  const [editCardDesc, setEditCardDesc] = useState("");

  useEffect(() => {
    async function fetchCards() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`/api/cards?listId=${list._id}`);
        const data = await res.json();
        if (res.ok) {
          setCards(data.cards);
        } else {
          setError(data.error || "Failed to fetch cards");
        }
      } catch (err) {
        setError("Failed to fetch cards");
      }
      setLoading(false);
    }
    fetchCards();
  }, [list._id]);

  async function handleCreate(e) {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setCreating(true);
    setError("");
    try {
      const res = await fetch("/api/cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle, description: newDesc, listId: list._id, position: cards.length }),
      });
      const data = await res.json();
      if (res.ok) {
        setCards(prev => [...prev, data.card]);
        setNewTitle("");
        setNewDesc("");
      } else {
        setError(data.error || "Failed to create card");
      }
    } catch {
      setError("Failed to create card");
    }
    setCreating(false);
  }

  async function handleDelete(cardId) {
    if (!window.confirm("Delete this card?")) return;
    try {
      const res = await fetch(`/api/cards`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cardId, listId: list._id }),
      });
      if (res.ok) {
        setCards(cards.filter(c => c._id !== cardId));
      } else {
        setError("Failed to delete card");
      }
    } catch {
      setError("Failed to delete card");
    }
  }

  async function handleEdit(cardId) {
    if (!editCardTitle.trim()) return;
    try {
      const res = await fetch(`/api/cards`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cardId, title: editCardTitle, description: editCardDesc }),
      });
      const data = await res.json();
      if (res.ok) {
        setCards(cards.map(c => c._id === cardId ? { ...c, title: data.card.title, description: data.card.description } : c));
        setEditingCardId(null);
        setEditCardTitle("");
        setEditCardDesc("");
      } else {
        setError(data.error || "Failed to edit card");
      }
    } catch {
      setError("Failed to edit card");
    }
  }

  // Drag-and-drop for cards (not persisted)
  const sensors = useSensors(useSensor(PointerSensor));
  function handleDragEnd(event) {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = cards.findIndex(c => c._id === active.id);
      const newIndex = cards.findIndex(c => c._id === over.id);
      setCards(arrayMove(cards, oldIndex, newIndex));
      // TODO: Persist new order to backend
    }
  }

  return (
    <div className="w-64 bg-white dark:bg-gray-800 rounded shadow p-4 flex flex-col">
      <div className="flex items-center gap-2 mb-2">
        {editingListId === list._id ? (
          <>
            <input
              value={editTitle}
              onChange={e => setEditTitle(e.target.value)}
              className="p-1 border rounded flex-1"
            />
            <button onClick={() => onEdit(list._id)} className="text-green-600">Save</button>
            <button onClick={() => setEditingListId(null)} className="text-gray-600">Cancel</button>
          </>
        ) : (
          <>
            <span className="font-semibold flex-1">{list.title}</span>
            <button onClick={() => { setEditingListId(list._id); setEditTitle(list.title); }} className="text-blue-600">Edit</button>
            <button onClick={() => onDelete(list._id)} className="text-red-600">Delete</button>
          </>
        )}
      </div>
      <form onSubmit={handleCreate} className="flex flex-col gap-2 mb-2">
        <input
          type="text"
          placeholder="New card title"
          value={newTitle}
          onChange={e => setNewTitle(e.target.value)}
          className="p-1 border rounded"
          disabled={creating}
          required
        />
        <input
          type="text"
          placeholder="Description (optional)"
          value={newDesc}
          onChange={e => setNewDesc(e.target.value)}
          className="p-1 border rounded"
          disabled={creating}
        />
        <button type="submit" className="bg-blue-600 text-white px-2 py-1 rounded" disabled={creating}>
          {creating ? "Adding..." : "Add Card"}
        </button>
      </form>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      {loading ? (
        <SkeletonCards />
      ) : cards.length === 0 ? (
        <p>No cards.</p>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd} modifiers={[restrictToParentElement]}>
          <SortableContext items={cards.map(c => c._id)} strategy={verticalListSortingStrategy}>
            <ul className="flex flex-col gap-2">
              {cards.map(card => (
                <SortableItem key={card._id} id={card._id}>
                  <li className="bg-gray-100 dark:bg-gray-700 rounded p-2 flex items-center gap-2">
                    {editingCardId === card._id ? (
                      <>
                        <input
                          value={editCardTitle}
                          onChange={e => setEditCardTitle(e.target.value)}
                          className="p-1 border rounded flex-1"
                        />
                        <input
                          value={editCardDesc}
                          onChange={e => setEditCardDesc(e.target.value)}
                          className="p-1 border rounded flex-1"
                          placeholder="Description"
                        />
                        <button onClick={() => handleEdit(card._id)} className="text-green-600">Save</button>
                        <button onClick={() => setEditingCardId(null)} className="text-gray-600">Cancel</button>
                      </>
                    ) : (
                      <>
                        <span className="flex-1 font-medium">{card.title}</span>
                        <span className="text-xs text-gray-500">{card.description}</span>
                        <button onClick={() => { setEditingCardId(card._id); setEditCardTitle(card.title); setEditCardDesc(card.description || ""); }} className="text-blue-600">Edit</button>
                        <button onClick={() => handleDelete(card._id)} className="text-red-600">Delete</button>
                      </>
                    )}
                  </li>
                </SortableItem>
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}

function SkeletonCards() {
  return (
    <ul className="flex flex-col gap-2 animate-pulse">
      {[1, 2].map(i => (
        <li key={i} className="h-8 bg-gray-200 dark:bg-gray-700 rounded" />
      ))}
    </ul>
  );
}

function SortableItem({ id, children }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = {
    transform: transform ? `translate(${transform.x}px, ${transform.y}px)` : undefined,
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : 1,
  };
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
    </div>
  );
} 