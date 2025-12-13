import { useState, useRef, useEffect } from 'react';
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
}

interface ChatSession {
  id: string;
  name: string;
  lastMessage: string;
  timestamp: Date;
  doctorMessages: Message[];
  momMessages: Message[];
  nutritionistMessages: Message[];
}

export default function ChatScreen() {
  const { t } = useLanguage();
  const isDark = useDarkMode();
  const [activeAgent, setActiveAgent] = useState<'doctor' | 'mom' | 'nutritionist'>('doctor');
  const [currentSessionId, setCurrentSessionId] = useState('1');
  const [sessions, setSessions] = useState<ChatSession[]>([
    {
      id: '1',
      name: 'New Conversation',
      lastMessage: '',
      timestamp: new Date(),
      doctorMessages: [],
      momMessages: [],
      nutritionistMessages: [],
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const currentSession = sessions.find((s) => s.id === currentSessionId);
  const currentMessages = currentSession
    ? (activeAgent === 'doctor' ? currentSession.doctorMessages
      : activeAgent === 'mom' ? currentSession.momMessages
        : currentSession.nutritionistMessages)
    : [];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [currentMessages, activeAgent, currentSessionId]);

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    updateSessionMessages(userMessage);

    const questionText = inputValue;
    setInputValue('');

    const thinkingMessage: Message = {
      id: (Date.now() + 0.5).toString(),
      role: 'ai',
      content: '🤔 Preparing your answer...',
      timestamp: new Date(),
    };

    updateSessionMessages(thinkingMessage);

    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: getAIResponse(questionText, activeAgent),
        timestamp: new Date(),
      };

      setSessions((prevSessions) =>
        prevSessions.map((session) => {
          if (session.id === currentSessionId) {
            const messageKey = activeAgent === 'doctor' ? 'doctorMessages'
              : activeAgent === 'mom' ? 'momMessages'
                : 'nutritionistMessages';

            const messages = [...session[messageKey]];
            messages[messages.length - 1] = aiMessage;

            return {
              ...session,
              [messageKey]: messages,
              lastMessage: aiMessage.content,
            };
          }
          return session;
        })
      );
    }, 1000);
  };

  const updateSessionMessages = (newMessage: Message) => {
    setSessions((prevSessions) =>
      prevSessions.map((session) => {
        if (session.id === currentSessionId) {
          const messageKey = activeAgent === 'doctor' ? 'doctorMessages'
            : activeAgent === 'mom' ? 'momMessages'
              : 'nutritionistMessages';

          return {
            ...session,
            [messageKey]: [...session[messageKey], newMessage],
            lastMessage: newMessage.role === 'user' ? newMessage.content : session.lastMessage,
          };
        }
        return session;
      })
    );
  };

  const handleImportRecord = () => {
    const systemMessage: Message = {
      id: Date.now().toString(),
      role: 'system',
      content: '✅ Successfully imported the latest growth and health records. The AI will now answer based on this data.',
      timestamp: new Date(),
    };
    updateSessionMessages(systemMessage);
    toast.success('Records imported to context');
  };

  const getAIResponse = (question: string, agent: 'doctor' | 'mom' | 'nutritionist'): string => {
    const lowerQuestion = question.toLowerCase();

    if (agent === 'nutritionist') {
      if (lowerQuestion.includes('recipe') || lowerQuestion.includes('food')) {
        return 'Here is a nutritious recipe for your baby! 🥣\n\n**Beef and Broccoli Porridge**\n- Ingredients: 30g Beef, 20g Broccoli, 50g Rice\n- Instructions: Boil the beef and chop finely. Steam broccoli and mash. Cook with rice until soft.\n\nThis meal is rich in iron and vitamins!';
      }
      if (lowerQuestion.includes('allergy')) {
        return 'Common allergens include eggs, milk, peanuts, and shellfish. Introduce these one by one and wait 3 days to check for reactions.';
      }
      return 'I can help with meal plans, recipes, and nutritional advice. What would you like to know?';
    }

    if (agent === 'doctor') {
      if (lowerQuestion.includes('temperature') || lowerQuestion.includes('37') || lowerQuestion.includes('38')) {
        return 'That\'s a great question. 👩‍⚕️\nAs Doctor AI, I will explain the condition from a medical perspective.\n\nIf the temperature is 37.5°C and the child has been crying for hours, it is a situation that requires immediate and careful observation. A slight fever alone is not an emergency, but prolonged crying can be a sign of pain, discomfort, early infection, or dehydration.';
      }
      if (lowerQuestion.includes('sleep') || lowerQuestion.includes('irregular')) {
        return 'I\'ll speak based on an 8-month-old baby.\nAt this age, babies are very active and their naps decrease, so irregular sleep patterns are a very common issue.\n\nTotal sleep time: 13-15 hours a day\nNight sleep: Usually sleeps around 8-9 PM and wakes up around 6-7 AM\n\nTry creating a consistent sleep routine and adjusting nap times.';
      }
      if (lowerQuestion.includes('solid food') || lowerQuestion.includes('start')) {
        return 'The Korean Pediatric Society and WHO recommend starting solid foods between 4-6 months of age, with the most ideal time being around 6 months of age. Start slowly with one ingredient at a time, and carefully watch for allergic reactions.';
      }
      return 'If you tell me more about the symptoms you are curious about, I can give you a more accurate answer. Please refer to records such as temperature, sleep patterns, and meal amounts.';
    }

    if (agent === 'mom') {
      if (lowerQuestion.includes('sleep training')) {
        return 'I\'m Mom AI, and I\'ll talk to you from a mother\'s heart.\n\n💬 **What is Sleep Training?**\n\n"Sleep training" is a process of "helping them develop the power to fall asleep on their own."\n\n🌜 **1. Tidy up the daily routine before bedtime**\nBath → Feeding → Dim lights → Lullaby → Hug → Put to bed\n\n🌙 **2. Put them down before they are fully asleep**\nThis is the hardest part, but try to put the baby down when they are drowsy.\n\n💖 **A word from Mom AI**\n"Sleep training is not a war, it\'s \'trust training\'."';
      }
      if (lowerQuestion.includes('solid food') && (lowerQuestion.includes('refuse') || lowerQuestion.includes('not') || lowerQuestion.includes('eat'))) {
        return 'It\'s so upsetting when that happens 😢\nAs Mom AI, I know that feeling all too well.\nBut it\'s okay — refusing solid food at this stage is a part of development that almost every baby goes through.\n\nTry changing the texture, temperature, or utensils. Don\'t force-feed, show them a "joyful table". Once the baby regains interest in food, they\'ll start eating well.';
      }
      if (lowerQuestion.includes('stress') || lowerQuestion.includes('hard') || lowerQuestion.includes('tired')) {
        return '💬 "Is there a way to relieve parenting stress?"\n\n🌤️ **1. It\'s enough to be a "good enough mom," not a "perfect mom"**\nThere\'s no such thing as perfect parenting.\n\n🫖 **2. Make a very short \'me time\'**\nEven 10 minutes is fine. Have a cup of coffee while the baby naps ☕\n\n💬 **3. Be sure to \'voice\' your feelings**\nParenting can be isolating. Share your feelings with others.\n\n💞 **4. And also... come to the ToDoc community**\nYou\'ll find real moms who have struggled just like you.';
      }
      return 'I\'m Mom AI, and I\'ll talk to you from a mother\'s heart. What\'s on your mind?';
    }

    return "I'm here to help!";
  };

  const quickQuestions = activeAgent === 'doctor'
    ? ['Is a temperature of 37.5°C okay?', 'My baby\'s sleep pattern is irregular', 'When should I start solid foods?']
    : activeAgent === 'mom'
      ? ['How do I do sleep training?', 'What if my baby refuses solid food?', 'How to relieve parenting stress']
      : ['Iron-rich recipes?', 'Baby food schedule', 'Allergy check list'];

  const handleNewSession = () => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      name: `Conversation ${sessions.length + 1}`,
      lastMessage: '',
      timestamp: new Date(),
      doctorMessages: [{
        id: `${Date.now()}-doctor-init`,
        role: 'ai',
        content: 'Hello! I\'m Doctor AI. Feel free to ask anything about your baby\'s health. 📊',
        timestamp: new Date(),
      }],
      momMessages: [{
        id: `${Date.now()}-mom-init`,
        role: 'ai',
        content: 'Hello! I\'m Mom AI. I\'m here to share parenting experiences. 💡',
        timestamp: new Date(),
      }],
      nutritionistMessages: [{
        id: `${Date.now()}-nutri-init`,
        role: 'ai',
        content: 'Hello! I\'m Nutritionist AI. Ask me about baby food and nutrition! 🥗',
        timestamp: new Date(),
      }],
    };
    setSessions([newSession, ...sessions]);
    setCurrentSessionId(newSession.id);
    toast.success('New conversation started');
  };

  const handleSessionChange = (sessionId: string) => {
    setCurrentSessionId(sessionId);
  };

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
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-[#6AA6FF]/30 text-xs sm:text-sm h-8 max-w-[70px] sm:max-w-[90px]"
                  >
                    <span className="truncate">{currentSession?.name}</span>
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

              <Button
                size="sm"
                onClick={handleNewSession}
                className="bg-[#6AA6FF] hover:bg-[#5a96ef] h-8 w-8 p-0"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <p className="text-sm text-[#CFCFCF] dark:text-[#CFCFCF]">{t('chat.subtitle')}</p>
        </div>

        <Tabs value={activeAgent} onValueChange={(v: string) => setActiveAgent(v as any)} className="px-4">
          <TabsList className="grid grid-cols-3 w-full bg-card/80 p-1 rounded-xl">
            <TabsTrigger
              value="doctor"
              className="flex items-center gap-1.5 text-xs sm:text-sm rounded-lg transition-colors doctor-ai-tab"
              style={
                !isDark && activeAgent === 'doctor'
                  ? { backgroundColor: '#6AA6FF', color: '#ffffff' }
                  : undefined
              }
            >
              <Bot className="h-3.5 w-3.5" style={!isDark && activeAgent === 'doctor' ? { color: '#ffffff' } : undefined} />
              <span style={!isDark && activeAgent === 'doctor' ? { color: '#ffffff' } : undefined}>{t('chat.doctor')}</span>
            </TabsTrigger>
            <TabsTrigger
              value="mom"
              className="flex items-center gap-1.5 text-xs sm:text-sm rounded-lg transition-colors mom-ai-tab"
              style={
                !isDark && activeAgent === 'mom'
                  ? { backgroundColor: '#FFC98B', color: '#1f2937' }
                  : undefined
              }
            >
              <Sparkles className="h-3.5 w-3.5" style={!isDark && activeAgent === 'mom' ? { color: '#1f2937' } : undefined} />
              <span style={!isDark && activeAgent === 'mom' ? { color: '#1f2937' } : undefined}>{t('chat.mom')}</span>
            </TabsTrigger>
            <TabsTrigger
              value="nutritionist"
              className="flex items-center gap-1.5 text-xs sm:text-sm rounded-lg transition-colors nutrition-ai-tab"
              style={
                !isDark && activeAgent === 'nutritionist'
                  ? { backgroundColor: '#9ADBC6', color: '#ffffff' }
                  : undefined
              }
            >
              <Utensils className="h-3.5 w-3.5" style={!isDark && activeAgent === 'nutritionist' ? { color: '#ffffff' } : undefined} />
              <span style={!isDark && activeAgent === 'nutritionist' ? { color: '#ffffff' } : undefined}>{t('chat.nutrition')}</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {currentMessages.map((message) => (
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
                  <Avatar className={`h-8 w-8 ${message.role === 'user' ? 'bg-muted'
                    : activeAgent === 'doctor' ? 'bg-[#6AA6FF]'
                      : activeAgent === 'mom' ? 'bg-[#FFC98B]'
                        : 'bg-[#9ADBC6]'
                    }`}>
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
                    className={`flex-1 max-w-[75%] rounded-2xl p-3 ${message.role === 'user'
                      ? 'bg-[#6AA6FF] text-white'
                      : activeAgent === 'doctor'
                        ? 'bg-card border border-[#6AA6FF]/20 dark:border-[#6AA6FF]/30'
                        : activeAgent === 'mom'
                          ? 'bg-card border border-[#FFC98B]/20 dark:border-[#FFC98B]/30'
                          : 'bg-card border border-[#9ADBC6]/20 dark:border-[#9ADBC6]/30'
                      }`}
                  >
                    <p
                      className={`text-sm ${message.role === 'user' ? 'text-white' : 'text-[#F3F3F3] dark:text-[#F3F3F3]'
                        }`}
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
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder={t('chat.inputPlaceholder')}
              className="flex-1 border-[#6AA6FF]/30 dark:border-[#9ADBC6]/30 bg-input"
            />
            <Button
              onClick={handleSendMessage}
              className={`${activeAgent === 'doctor'
                ? 'bg-[#6AA6FF] hover:bg-[#5a96ef]'
                : activeAgent === 'mom'
                  ? 'bg-[#FFC98B] hover:bg-[#ffb86b] text-gray-800'
                  : 'bg-[#9ADBC6] hover:bg-[#7ac7b0] text-white'
                }`}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
