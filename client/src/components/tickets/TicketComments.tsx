import { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import type { Ticket } from '../../store/slices/ticketApi';
import { useAddCommentMutation } from '../../store/slices/ticketApi';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import { extractApiError } from '../../api/utils';
import { isStaffRole } from '../../hooks/useRoles';

interface TicketCommentsProps {
  ticketId: string;
  comments: Ticket['comments'];
}

export default function TicketComments({
  ticketId,
  comments,
}: TicketCommentsProps) {
  const [message, setMessage] = useState('');
  const [addComment, { isLoading }] = useAddCommentMutation();
  const commentsEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom whenever comments change
  useEffect(() => {
    commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [comments]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    try {
      await addComment({ id: ticketId, message: message.trim() }).unwrap();
      setMessage('');
    } catch (error) {
      toast.error(extractApiError(error, 'Failed to add comment'));
    }
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {!comments || comments.length === 0 ? (
          <div className="mt-8 text-center text-sm text-neutral-text-muted">
            No comments yet. Be the first to comment!
          </div>
        ) : (
          comments.map((comment, idx) => {
            const commenterName =
              typeof comment.user === 'string'
                ? 'Unknown User'
                : comment.user?.name || 'Unknown User';

            const role =
              typeof comment.user === 'string' ? '' : comment.user?.role;
            const isStaff = isStaffRole(role);

            return (
              <div key={comment._id || idx} className="flex gap-3">
                {/* Initial-based Avatar */}
                <div
                  className={`mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold select-none ${
                    isStaff
                      ? 'border border-indigo-200 bg-indigo-50 text-indigo-600'
                      : 'bg-brand-accent-light text-brand-accent'
                  }`}
                >
                  {commenterName.charAt(0).toUpperCase()}
                </div>
                <div
                  className={`flex-1 rounded-premium-card border border-neutral-border bg-neutral-card p-3 shadow-sm transition-all duration-200 hover:shadow-md ${
                    isStaff ? 'border-l-4 border-l-brand-accent' : ''
                  }`}
                >
                  <div className="mb-1 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-neutral-text-primary">
                        {commenterName}
                      </span>
                      {isStaff && (
                        <span className="rounded bg-brand-accent-light px-1.5 py-0.5 text-[9.5px] font-bold tracking-wider text-brand-accent-dark uppercase">
                          {role.charAt(0).toUpperCase() + role.slice(1)}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-neutral-text-muted">
                      {format(new Date(comment.createdAt), 'MMM d, h:mm a')}
                    </span>
                  </div>
                  <p className="text-sm whitespace-pre-wrap text-neutral-text-secondary">
                    {comment.message}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={commentsEndRef} />
      </div>

      <div className="border-t border-neutral-border bg-neutral-50 p-4">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            className="input-field flex-1"
            placeholder="Type your comment..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !message.trim()}
            className="btn-primary flex items-center justify-center px-4 disabled:opacity-50"
          >
            <Send size={16} className={isLoading ? 'animate-pulse' : ''} />
          </button>
        </form>
      </div>
    </div>
  );
}
