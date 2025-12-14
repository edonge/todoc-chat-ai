import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Bot, User, Sparkles, Plus, ChevronDown, Utensils, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';
import { getChildren } from '@/services/api/childService';
import {
  getChatSessions,
  createChatSession,
  getChatSession,
  sendMessage,
  type AIModeType,
} from '@/services/api/chatService';
import type { ChatMessageResponse } from '@/api/types';

// Hook to detect dark mode
function useDarkMode() {
  const [isDark, setIsDark] = useState(() =>
    document.documentElement.classList.contains('dark')
  );

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);

  return isDark;
}

interface Message {
  id: string;
  role: 'user' | 'ai' | 'system';
  content: string;
  timestamp: Date;
  aiModeId?: number | null;
}

interface LocalSession {
  id: number;
  name: string;
  messages: Message[];
  createdAt: Date;
}

const getInitialMessage = (agent: AIModeType): Message => {
  const messages: Record<AIModeType, string> = {
    doctor: "Hello! I'm Doctor AI. Feel free to ask anything about your baby's health and development. I can provide personalized answers based on your recorded data.",
    mom: "Hello! I'm Mom AI. I'm here to share parenting experiences and know-how. Do you have any questions? I can offer advice based on your recorded parenting data.",
    nutritionist: "Hello! I'm Nutritionist AI. I can help with baby food recipes, nutritional balance, and eating habits. Ask me anything about your baby's diet!",
  };

  return {
    id: `init-${agent}`,
    role: 'ai',
    content: messages[agent],
    timestamp: new Date(),
  };
};

export default function ChatScreen() {
  const { t } = useLanguage();
  const isDark = useDarkMode();
  const [activeAgent, setActiveAgent] = useState<AIModeType>('doctor');
  const [kidId, setKidId] = useState<number | null>(null);
  const [sessions, setSessions] = useState<LocalSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([getInitialMessage('doctor')]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // 아이 정보 로드
  useEffect(() => {
    const loadKidInfo = async () => {
      try {
        const children = await getChildren();
        if (children && children.length > 0) {
          setKidId(children[0].id);
        }
      } catch (error) {
        console.error('Error loading kid info:', error);
      }
    };
    loadKidInfo();
  }, []);

  // 세션 목록 로드
  useEffect(() => {
    if (!kidId) return;

    const loadSessions = async () => {
      setIsLoading(true);
      try {
        const apiSessions = await getChatSessions(kidId);
        const localSessions: LocalSession[] = apiSessions.map((s, idx) => ({
          id: s.id,
          name: `Conversation ${apiSessions.length - idx}`,
          messages: [],
          createdAt: new Date(s.created_at),
        }));

        if (localSessions.length > 0) {
          setSessions(localSessions);
          setCurrentSessionId(localSessions[0].id);
          // 첫 번째 세션의 메시지 로드
          await loadSessionMessages(localSessions[0].id);
        } else {
          // 세션이 없으면 새로 생성
          await handleNewSession();
        }
      } catch (error) {
        console.error('Error loading sessions:', error);
        // 에러 시 로컬 세션으로 시작
        setMessages([getInitialMessage(activeAgent)]);
      } finally {
        setIsLoading(false);
      }
    };

    loadSessions();
  }, [kidId]);

  // 세션 메시지 로드
  const loadSessionMessages = useCallback(async (sessionId: number) => {
    try {
      const session = await getChatSession(sessionId);
      if (session.messages && session.messages.length > 0) {
        const loadedMessages: Message[] = session.messages.map((msg: ChatMessageResponse) => ({
          id: msg.id.toString(),
          role: msg.sender === 'user' ? 'user' : 'ai',
          content: msg.content,
          timestamp: new Date(msg.created_at),
          aiModeId: msg.ai_mode_id,
        }));
        setMessages(loadedMessages);
      } else {
        // 메시지가 없으면 초기 메시지 표시
        setMessages([getInitialMessage(activeAgent)]);
      }
    } catch (error) {
      console.error('Error loading session messages:', error);
      setMessages([getInitialMessage(activeAgent)]);
    }
  }, [activeAgent, t]);

  // 스크롤 자동 이동
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // 에이전트 변경 시 초기 메시지 업데이트 (새 세션이거나 메시지가 없을 때)
  useEffect(() => {
    if (messages.length === 1 && messages[0].id.startsWith('init-')) {
      setMessages([getInitialMessage(activeAgent)]);
    }
  }, [activeAgent, t]);

  // 새 세션 생성
  const handleNewSession = async () => {
    if (!kidId) {
      toast.error('Please register a child first');
      return;
    }

    try {
      const newSession = await createChatSession(kidId);
      const localSession: LocalSession = {
        id: newSession.id,
        name: `Conversation ${sessions.length + 1}`,
        messages: [],
        createdAt: new Date(newSession.created_at),
      };

      setSessions((prev) => [localSession, ...prev]);
      setCurrentSessionId(newSession.id);
      setMessages([getInitialMessage(activeAgent)]);
      toast.success('New conversation started');
    } catch (error) {
      console.error('Error creating session:', error);
      toast.error('Failed to create new conversation');
    }
  };

  // 세션 변경
  const handleSessionChange = async (sessionId: number) => {
    setCurrentSessionId(sessionId);
    await loadSessionMessages(sessionId);
  };

  // 메시지 전송
  const handleSendMessage = async () => {
    if (!inputValue.trim() || !currentSessionId || isSending) return;

    const userMessageContent = inputValue;
    setInputValue('');

    // 사용자 메시지 즉시 표시
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: userMessageContent,
      timestamp: new Date(),
    };

    // 로딩 메시지 표시
    const loadingMessage: Message = {
      id: `loading-${Date.now()}`,
      role: 'ai',
      content: '🤔 Thinking...',
      timestamp: new Date(),
    };

    setMessages((prev) => {
      // 초기 메시지만 있으면 제거
      const filtered = prev.filter((m) => !m.id.startsWith('init-'));
      return [...filtered, userMessage, loadingMessage];
    });

    setIsSending(true);

    try {
      const aiResponse = await sendMessage(currentSessionId, userMessageContent, activeAgent);

      // 로딩 메시지를 실제 응답으로 교체
      setMessages((prev) => {
        const filtered = prev.filter((m) => !m.id.startsWith('loading-'));
        return [
          ...filtered,
          {
            id: aiResponse.id.toString(),
            role: 'ai',
            content: aiResponse.content,
            timestamp: new Date(aiResponse.created_at),
            aiModeId: aiResponse.ai_mode_id,
          },
        ];
      });
    } catch (error) {
      console.error('Error sending message:', error);
      // 로딩 메시지를 에러 메시지로 교체
      setMessages((prev) => {
        const filtered = prev.filter((m) => !m.id.startsWith('loading-'));
        return [
          ...filtered,
          {
            id: `error-${Date.now()}`,
            role: 'ai',
            content: 'Sorry, I encountered an error. Please try again.',
            timestamp: new Date(),
          },
        ];
      });
      toast.error('Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  // 기록 가져오기
  const handleImportRecord = () => {
    const systemMessage: Message = {
      id: `system-${Date.now()}`,
      role: 'system',
      content: '✅ Successfully imported the latest growth and health records. The AI will now answer based on this data.',
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, systemMessage]);
    toast.success('Records imported to context');
  };

  const currentSession = sessions.find((s) => s.id === currentSessionId);

  const quickQuestions =
    activeAgent === 'doctor'
      ? ['Is a temperature of 37.5°C okay?', "My baby's sleep pattern is irregular", 'When should I start solid foods?']
      : activeAgent === 'mom'
        ? ['How do I do sleep training?', 'What if my baby refuses solid food?', 'How to relieve parenting stress']
        : ['Iron-rich recipes?', 'Baby food schedule', 'Allergy check list'];

  if (isLoading) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#6AA6FF] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-full w-full flex flex-col">
      <div className="max-w-2xl mx-auto w-full flex flex-col h-full">
        <div className="p-4 pb-2">
          <div className="flex items-center justify-between mb-1 gap-2">
            <h2 className="text-[#6AA6FF] dark:text-[#9ADBC6] whitespace-nowrap flex-shrink-0">{t('chat.title')}</h2>
            <div className="flex items-center gap-1.5 min-w-0 flex-shrink">
              <Button
                variant="outline"
                size="sm"
                onClick={handleImportRecord}
                className="text-xs h-8 border-[#6AA6FF]/30 text-[#6AA6FF] hover:bg-[#6AA6FF]/10 hidden sm:flex"
              >
                <FileText className="h-3 w-3 mr-1" />
                {t('chat.importRecords')}
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="border-[#6AA6FF]/30 text-xs sm:text-sm h-8 max-w-[70px] sm:max-w-[90px]">
                    <span className="truncate">{currentSession?.name || 'New'}</span>
                    <ChevronDown className="h-3 w-3 ml-0.5 flex-shrink-0" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {sessions.map((session) => (
                    <DropdownMenuItem
                      key={session.id}
                      onClick={() => handleSessionChange(session.id)}
                      className={currentSessionId === session.id ? 'bg-[#6AA6FF]/10' : ''}
                    >
                      <div className="flex-1 truncate">{session.name}</div>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <Button size="sm" onClick={handleNewSession} className="bg-[#6AA6FF] hover:bg-[#5a96ef] h-8 w-8 p-0">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <p className="text-sm text-[#CFCFCF] dark:text-[#CFCFCF]">{t('chat.subtitle')}</p>
        </div>

        <Tabs value={activeAgent} onValueChange={(v: string) => setActiveAgent(v as AIModeType)} className="px-4">
          <TabsList className="grid grid-cols-3 w-full bg-card/80 p-1 rounded-xl">
            <TabsTrigger
              value="doctor"
              className="flex items-center gap-1.5 text-xs sm:text-sm rounded-lg transition-colors doctor-ai-tab"
              style={!isDark && activeAgent === 'doctor' ? { backgroundColor: '#6AA6FF', color: '#ffffff' } : undefined}
            >
              <Bot className="h-3.5 w-3.5" style={!isDark && activeAgent === 'doctor' ? { color: '#ffffff' } : undefined} />
              <span style={!isDark && activeAgent === 'doctor' ? { color: '#ffffff' } : undefined}>{t('chat.doctor')}</span>
            </TabsTrigger>
            <TabsTrigger
              value="mom"
              className="flex items-center gap-1.5 text-xs sm:text-sm rounded-lg transition-colors mom-ai-tab"
              style={!isDark && activeAgent === 'mom' ? { backgroundColor: '#FFC98B', color: '#1f2937' } : undefined}
            >
              <Sparkles className="h-3.5 w-3.5" style={!isDark && activeAgent === 'mom' ? { color: '#1f2937' } : undefined} />
              <span style={!isDark && activeAgent === 'mom' ? { color: '#1f2937' } : undefined}>{t('chat.mom')}</span>
            </TabsTrigger>
            <TabsTrigger
              value="nutritionist"
              className="flex items-center gap-1.5 text-xs sm:text-sm rounded-lg transition-colors nutrition-ai-tab"
              style={!isDark && activeAgent === 'nutritionist' ? { backgroundColor: '#9ADBC6', color: '#ffffff' } : undefined}
            >
              <Utensils className="h-3.5 w-3.5" style={!isDark && activeAgent === 'nutritionist' ? { color: '#ffffff' } : undefined} />
              <span style={!isDark && activeAgent === 'nutritionist' ? { color: '#ffffff' } : undefined}>{t('chat.nutrition')}</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'} ${message.role === 'system' ? 'justify-center' : ''}`}
            >
              {message.role === 'system' ? (
                <div className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs py-1 px-3 rounded-full">
                  {message.content}
                </div>
              ) : (
                <>
                  <Avatar
                    className={`h-8 w-8 ${
                      message.role === 'user'
                        ? 'bg-muted'
                        : activeAgent === 'doctor'
                          ? 'bg-[#6AA6FF]'
                          : activeAgent === 'mom'
                            ? 'bg-[#FFC98B]'
                            : 'bg-[#9ADBC6]'
                    }`}
                  >
                    <AvatarFallback className="[&>*]:transition-colors">
                      {message.role === 'user' ? (
                        <User className="h-4 w-4 text-black dark:text-white" />
                      ) : activeAgent === 'nutritionist' ? (
                        <Utensils className="h-4 w-4 text-black dark:text-white" />
                      ) : activeAgent === 'doctor' ? (
                        <Bot className="h-4 w-4 text-black dark:text-white" />
                      ) : activeAgent === 'mom' ? (
                        <Sparkles className="h-4 w-4 text-black dark:text-white" />
                      ) : (
                        <Bot className="h-4 w-4 text-black dark:text-white" />
                      )}
                    </AvatarFallback>
                  </Avatar>
                  <div
                    className={`flex-1 max-w-[75%] rounded-2xl p-3 ${
                      message.role === 'user'
                        ? 'bg-[#6AA6FF] text-white'
                        : activeAgent === 'doctor'
                          ? 'bg-card border border-[#6AA6FF]/20 dark:border-[#6AA6FF]/30'
                          : activeAgent === 'mom'
                            ? 'bg-card border border-[#FFC98B]/20 dark:border-[#FFC98B]/30'
                            : 'bg-card border border-[#9ADBC6]/20 dark:border-[#9ADBC6]/30'
                    }`}
                  >
                    <p
                      className={`text-sm ${message.role === 'user' ? 'text-white' : 'text-[#F3F3F3] dark:text-[#F3F3F3]'}`}
                      style={{ whiteSpace: 'pre-wrap' }}
                    >
                      {message.content}
                    </p>
                    <span className={`text-xs mt-1 block ${message.role === 'user' ? 'text-white/70' : 'text-[#A5A5A5] dark:text-[#A5A5A5]'}`}>
                      {message.timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        <div className="px-4 pb-2">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {quickQuestions.map((question, idx) => (
              <Button
                key={idx}
                variant="outline"
                size="sm"
                onClick={() => setInputValue(question)}
                className="whitespace-nowrap text-xs border-[#6AA6FF]/30 hover:bg-[#6AA6FF]/10"
              >
                {question}
              </Button>
            ))}
          </div>
        </div>

        <div className="p-4 bg-card border-t border-border">
          <div className="flex gap-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder={t('chat.inputPlaceholder')}
              className="flex-1 border-[#6AA6FF]/30 dark:border-[#9ADBC6]/30 bg-input"
              disabled={isSending}
            />
            <Button
              onClick={handleSendMessage}
              disabled={isSending || !inputValue.trim()}
              className={`${
                activeAgent === 'doctor'
                  ? 'bg-[#6AA6FF] hover:bg-[#5a96ef]'
                  : activeAgent === 'mom'
                    ? 'bg-[#FFC98B] hover:bg-[#ffb86b] text-gray-800'
                    : 'bg-[#9ADBC6] hover:bg-[#7ac7b0] text-white'
              }`}
            >
              {isSending ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
