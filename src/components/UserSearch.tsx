"use client";

import { useState, useEffect } from "react";
import { IUser } from "@/types";
import toast from "react-hot-toast";
import Loader from "./Loader";

interface UserSearchProps {
  onUserSelect: (user: IUser) => void;
}

export default function UserSearch({ onUserSelect }: UserSearchProps) {
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState<IUser[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      if (search.trim()) {
        setLoading(true);
        try {
          const res = await fetch(`/api/users?search=${search}`);
          const data = await res.json();
          setUsers(data);
          setIsOpen(true);
        } catch (error) {
          console.error("Failed to fetch users:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setIsOpen(false);
        setUsers([]);
      }
    };
    fetchUsers();
  }, [search]);

  const handleUserClick = async (user: IUser) => {
    try {
      const res = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ participantIds: [user._id.toString()] }),
      });
      if (res.ok) {
        const conversation = await res.json();
        onUserSelect(user);
        setSearch("");
        setIsOpen(false);
        window.location.href = `/chat/${conversation._id.toString()}`;
      }
    } catch (error) {
      toast.error("Failed to start conversation");
    }
  };

  return (
    <div className="p-4 border-b border-slate-700">
      <div className="relative">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search users..."
          className="w-full pl-4 pr-10 py-2 rounded-lg bg-slate-700 text-white border border-slate-600 focus:outline-none focus:border-blue-500"
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Loader size="xs" color="blue" />
          </div>
        )}
        {isOpen && users.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-slate-800 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
            {users.map((user) => (
              <div
                key={user._id.toString()}
                onClick={() => handleUserClick(user)}
                className="px-4 py-3 hover:bg-slate-700 cursor-pointer flex items-center gap-3"
              >
                {user.image ? (
                  <img
                    src={user.image}
                    alt={user.name}
                    className="w-10 h-10 rounded-full object-cover border border-slate-600 shadow-sm"
                  />
                ) : (
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {user.name.charAt(0)}
                  </div>
                )}
                <span className="text-white">{user.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
