"use client";

import { IMessage } from "@/types";
import { useSession } from "next-auth/react";
import { formatDistanceToNow } from "date-fns";
import { useEffect, useState } from "react";
import Loader from "./Loader";
import toast from "react-hot-toast";

interface MessageBubbleProps {
  message: IMessage;
  onDelete?: (messageId: string) => void;
}

export default function MessageBubble({
  message,
  onDelete,
}: MessageBubbleProps) {
  const { data: session } = useSession();
  const isOwn = message.sender?._id?.toString() === session?.user?.id;
  const [mounted, setMounted] = useState(false);
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleDelete = async () => {
    try {
      setDeleting(true);
      const res = await fetch(
        `/api/conversations/messages/${message._id.toString()}`,
        {
          method: "DELETE",
        },
      );

      if (res.ok) {
        onDelete?.(message._id.toString());
        setShowDeleteConfirm(false);
        toast.success("Message deleted");
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to delete message");
      }
    } catch (error) {
      toast.error("Failed to delete message");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <div
        className={`flex ${isOwn ? "justify-end" : "justify-start"} mb-4 group`}
      >
        <div
          className={`max-w-[70%] px-4 py-2 rounded-2xl relative ${
            isOwn ? "bg-blue-600 rounded-tr-sm" : "bg-slate-700 rounded-tl-sm"
          }`}
        >
          {message.image && (
            <img
              src={message.image}
              alt="Message image"
              className="rounded-xl mb-2 max-h-80 cursor-pointer"
              onClick={() => setShowImagePreview(true)}
            />
          )}
          {message.text && <p className="text-white">{message.text}</p>}
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-slate-300">
              {mounted &&
                message.createdAt &&
                formatDistanceToNow(new Date(message.createdAt), {
                  addSuffix: true,
                })}
            </span>
            {isOwn && (
              <span className="text-xs text-slate-300">
                {message.readBy?.length > 1 ? "✓✓" : "✓"}
              </span>
            )}
          </div>
          {isOwn && (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="absolute -top-2 right-2 bg-red-600 hover:bg-red-500 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity min-h-[32px] min-w-[32px] flex items-center justify-center"
              title="Delete message"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-4 h-4 text-white"
              >
                <path
                  fillRule="evenodd"
                  d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.97a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          )}
        </div>
      </div>

      {showImagePreview && (
        <div
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
          onClick={() => setShowImagePreview(false)}
        >
          <div className="relative">
            <img
              src={message.image}
              alt="Full size"
              className="max-w-full max-h-[90vh] rounded-xl"
            />
            <button
              onClick={() => setShowImagePreview(false)}
              className="absolute top-4 right-4 w-10 h-10 bg-slate-800/80 hover:bg-slate-700 rounded-full flex items-center justify-center text-white text-xl"
            >
              &times;
            </button>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-bold text-white mb-4">
              Delete Message?
            </h3>
            <p className="text-slate-300 mb-6">
              This action cannot be undone. Are you sure you want to delete this
              message?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
                className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white bg-slate-700/60 hover:bg-slate-700 border border-slate-600 rounded-lg transition-colors min-h-[44px]"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-500 disabled:opacity-50 rounded-lg transition-colors flex items-center gap-2 min-h-[44px]"
              >
                {deleting ? (
                  <>
                    <Loader size="xs" color="white" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  "Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
