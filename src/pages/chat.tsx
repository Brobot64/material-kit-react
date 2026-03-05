import { lazy } from 'react';

import { Helmet } from 'src/components/helmet';

const ChatView = lazy(() => import('src/sections/chat/view/chat-view'));

// ----------------------------------------------------------------------

export default function ChatPage() {
  return (
    <>
      <Helmet
        title="Chat"
        description="Communicate with your team members in real-time."
      />
      <ChatView />
    </>
  );
}
