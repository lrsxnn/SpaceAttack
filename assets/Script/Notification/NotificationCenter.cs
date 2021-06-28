using System;
using System.Collections.Generic;
namespace Notification
{
    public delegate void NotifyEventHandler(object sender);

    class MessageInfo
    {
        public NotifyEventHandler selector;
        public List<bool> wait_end;

        public MessageInfo(NotifyEventHandler selector)
        {
            this.selector = selector;
            this.wait_end = new List<bool>();
        }
    }

    class NotificationTail
    {
        public NotificationTail next;
        public NotificationMessage message;
        public object context;

        public NotificationTail(NotificationTail next, NotificationMessage message, object context)
        {
            this.next = next;
            this.message = message;
            this.context = context;
        }
    }

    class NotificationCenter
    {
        private static Dictionary<NotificationMessage, MessageInfo> observers = new Dictionary<NotificationMessage, MessageInfo>();
        private static bool is_block_notifications = false;
        private static NotificationTail pending_notification_head = null;
        private static NotificationTail pending_notification_tail = null;

        public static void AddObserver(NotifyEventHandler selector, NotificationMessage message, bool wait_end = false)
        {
            if (!NotificationCenter.observers.ContainsKey(message))
            {
                NotificationCenter.observers[message] = new MessageInfo(selector);
            }
            else
            {
                NotificationCenter.observers[message].selector += selector;
            }

            NotificationCenter.observers[message].wait_end.Add(wait_end);
        }

        public static bool RemoveObserver(NotifyEventHandler selector, NotificationMessage message)
        {
            if (NotificationCenter.observers.ContainsKey(message))
            {
                Delegate[] delegates = NotificationCenter.observers[message].selector.GetInvocationList();

                for (int i = 0; i < delegates.Length; i++)
                {
                    if (delegates[i].Equals(selector))
                    {
                        NotificationCenter.observers[message].wait_end.RemoveAt(i);
                    }
                }

                NotificationCenter.observers[message].selector -= selector;
                return true;
            }

            return false;
        }

        public static void SendNotification(NotificationMessage message, object args = null)
        {
            if (NotificationCenter.observers.ContainsKey(message))
            {
                NotificationCenter.PerformSelector(NotificationCenter.observers[message], args);
            }
        }

        public static void PostNotification(NotificationMessage message, object args = null)
        {
            if (NotificationCenter.is_block_notifications)
            {
                NotificationTail tail = new NotificationTail(null, message, args);
                if (NotificationCenter.pending_notification_tail != null)
                {
                    NotificationCenter.pending_notification_tail.next = tail;
                }
                NotificationCenter.pending_notification_tail = tail;
                if (NotificationCenter.pending_notification_head == null)
                {
                    NotificationCenter.pending_notification_head = tail;
                }
            }
            else
            {
                NotificationCenter.SendNotification(message, args);
            }
        }

        private static bool PerformSelector(MessageInfo observer, object args)
        {
            bool wait_end = true;
            if (observer != null)
            {
                observer.selector(args);

                for (int i = 0; i < observer.wait_end.Count; i++)
                {
                    if (!observer.wait_end[i])
                    {
                        wait_end = false;
                    }
                }
            }
            return wait_end;
        }

        public static bool IsBlockNotifications()
        {
            return NotificationCenter.is_block_notifications;
        }

        public static bool BlockNotifications()
        {
            return NotificationCenter.is_block_notifications = true;
        }

        public static void UnBlockNotifications()
        {
            NotificationTail trail = NotificationCenter.pending_notification_head;
            while (trail != null)
            {
                NotificationMessage message = trail.message;
                MessageInfo observers = NotificationCenter.observers[message];
                if (observers != null)
                {
                    NotificationCenter.pending_notification_head = trail.next;
                    bool unblocking_flag = NotificationCenter.PerformSelector(observers, trail.context);
                    if (unblocking_flag)
                    {
                        return;
                    }
                }
                trail = NotificationCenter.pending_notification_head;
            }
            NotificationCenter.PurgePendingNotifications();
        }

        private static void PurgePendingNotifications()
        {
            NotificationCenter.is_block_notifications = false;
            NotificationCenter.pending_notification_head = null;
            NotificationCenter.pending_notification_tail = null;
        }
    }
}