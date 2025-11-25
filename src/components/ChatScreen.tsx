import { useState, useRef, useEffect, JSX } from 'react';
import { Send, Bot, User, Sparkles, Plus, ChevronDown, Utensils, FileText } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Tabs, TabsList, TabsTrigger } from './ui/tabs';
import { Avatar, AvatarFallback } from './ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { toast } from 'sonner';

interface Message {
  id: string;
  role: 'user' | 'ai' | 'system';
  content: string | React.ReactNode;
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
  const [activeAgent, setActiveAgent] = useState<'doctor' | 'mom' | 'nutritionist'>('doctor');
  const [currentSessionId, setCurrentSessionId] = useState('1');
  const [sessions, setSessions] = useState<ChatSession[]>([
    {
      id: '1',
      name: 'New Conversation',
      lastMessage: '',
      timestamp: new Date(),
      doctorMessages: [
        {
          id: '1',
          role: 'ai',
          content: 'Hello! I\'m Doctor AI. Feel free to ask anything about your baby\'s health and development. 📊 I can provide personalized answers based on your recorded data.',
          timestamp: new Date(),
        },
      ],
      momMessages: [
        {
          id: '1',
          role: 'ai',
          content: 'Hello! I\'m Mom AI. I\'m here to share parenting experiences and know-how. Do you have any questions? 💡 I can offer advice based on your recorded parenting data.',
          timestamp: new Date(),
        },
      ],
      nutritionistMessages: [
        {
          id: '1',
          role: 'ai',
          content: 'Hello! I\'m Nutritionist AI. I can help with baby food recipes, nutritional balance, and eating habits. 🥗 Ask me anything about your baby\'s diet!',
          timestamp: new Date(),
        },
      ],
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

      // Replace thinking message with actual response
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
              lastMessage: aiMessage.content as string,
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
            lastMessage: newMessage.role === 'user' ? (newMessage.content as string) : session.lastMessage,
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

  const getAIResponse = (question: string, agent: 'doctor' | 'mom' | 'nutritionist'): string | JSX.Element => {
    const lowerQuestion = question.toLowerCase();

    if (agent === 'nutritionist') {
      if (lowerQuestion.includes('recipe') || lowerQuestion.includes('food')) {
        return `Here is a nutritious recipe for your baby! 🥣\n\n**Beef and Broccoli Porridge**\n- Ingredients: 30g Beef, 20g Broccoli, 50g Rice\n- Instructions: Boil the beef and chop finely. Steam broccoli and mash. Cook with rice until soft.\n\nThis meal is rich in iron and vitamins!`;
      }
      if (lowerQuestion.includes('allergy')) {
        return `Common allergens include eggs, milk, peanuts, and shellfish. Introduce these one by one and wait 3 days to check for reactions.`;
      }
      return `I can help with meal plans, recipes, and nutritional advice. What would you like to know?`;
    }

    if (agent === 'doctor') {
      if (lowerQuestion.includes('temperature') || lowerQuestion.includes('37') || lowerQuestion.includes('38')) {
        return `That's a great question. 👩‍⚕️\nAs Doctor AI, I will explain the condition of a 2-year-old girl from a medical perspective.\n\n---\n\n🔹 **Conclusion First:**\n> If the temperature is 37.5°C and the child has been crying for hours, it is a situation that requires immediate and careful observation.\n\nA slight fever alone is not an emergency, but prolonged crying can be a sign of pain, discomfort, early infection, or dehydration.\n\n---\n\n🔹 **Meaning of 37.5°C**\n- Normal temperature: 36.5~37.4°C\n- 37.5°C is a 'slight fever' and can be caused by temporary environmental factors, but if it persists, it could be the start of an infection.\n\n---\n\n🔹 **Home care**\n- Remove one layer of clothing\n- Keep the room cool (22~24°C)\n- Offer water or breast milk frequently\n- Check temperature every 1-2 hours`;
      }
      if (lowerQuestion.includes('sleep') || lowerQuestion.includes('irregular')) {
        return `I'll speak based on an 8-month-old boy.\nAt this age, babies are very active and their naps decrease, so irregular sleep patterns are a very common issue.\n\n🔹 **Normal Sleep Pattern for an 8-Month-Old**\n\nTotal sleep time: 13-15 hours a day\n(About 10-11 hours at night + 2-3 naps totaling 3-4 hours)\n\nNight sleep: Usually sleeps around 8-9 PM and wakes up around 6-7 AM\n\nNaps: 2-3 times a day before morning, afternoon, and evening.\nNapping too late in the afternoon can push back bedtime.\n\n🔹 **Main reasons for irregular sleep patterns**\n\nDevelopmental leap (8-9 months)\nLearning new skills like flipping, crawling, and grabbing makes the brain active, making it hard to fall asleep.\n\nNap transition\nTransitioning from 3 to 2 naps.\n\nSeparation anxiety begins\nCrying when parents disappear, or wanting to sleep only in their arms.\n\nStimulating sleep environment\nBright lights, noise, TV, excessive stimulation during the day.\n\nFeeding habits\nFrequent night feedings disrupt the natural sleep rhythm.\n\n🔹 **Home correction methods**\n\n✅ **Create a consistent sleep routine**\n7 PM → Bath → Quiet play or reading → Lights out → Bedtime\nRepeating the same order helps form a biological signal for "it's time to sleep."\n\n✅ **Adjust nap times**\nSchedule naps around 9-10 AM and 1-2 PM.\nAvoid letting the baby sleep after 5 PM.\n\n✅ **Tidy the sleep environment**\nKeep the room slightly dark and quiet (22-24°C, humidity 40-60%).\nClearly distinguish between day and night lighting.\n\n✅ **Gradually reduce night feedings**\nAt 8 months, most babies can be reduced to one or fewer night feedings.\nIt might be a habitual awakening rather than hunger.\n\n✅ **Practice self-soothing (autonomous sleep)**\nPut the baby down before they are fully asleep to let them experience falling asleep on their own.\nIf they fuss a bit, wait for 3-5 minutes.\n\n🔹 **When to consult a doctor**\n\nWakes up more than 3 times a night with intense crying\nPersistent fatigue and fussiness during the day\nBreathing issues like snoring, apnea, frequent sweating, cyanosis\nIf a regular rhythm doesn't form after 3 weeks\n\n🔹 **Summary**\n\n👶 An 8-month-old's irregular sleep is mostly a natural part of development.\nHowever, establishing a routine, adjusting naps, and sleep training can stabilize it within 1-2 weeks.\nIf the baby frequently wakes up at night, or if there are breathing problems or severe crying, consulting a pediatrician is recommended.`;
      }
      if (lowerQuestion.includes('solid food') || lowerQuestion.includes('start')) {
        return `That's a great question. 👩‍⚕️\nAs Doctor AI, I will explain starting solid foods from a medical perspective.\n\n---\n\n🔹 **When to Start Solid Foods**\n\nThe Korean Pediatric Society and WHO recommend:\n- Starting between **4-6 months of age**.\n- The most ideal time is around **6 months of age**.\n\n---\n\n🔹 **Signs Your Baby is Ready for Solid Foods**\n\nIf your baby shows 3 or more of the following signs, you can start:\n\n1. Can hold their head up and is stable when supported to sit\n2. Frequently puts hands or toys in their mouth\n3. Watches with interest as adults eat\n4. The 'tongue-thrust reflex' that pushes food out has decreased\n5. Seems unsatisfied with only milk (increased feeding, seems hungry)\n\n---\n\n🔹 **How to Start the First Solid Foods**\n\n✅ **Initial Stage (4-6 months)**\n- Start with one meal a day, one spoonful at a time\n- Rice cereal or soft vegetables like pumpkin, sweet potato, potato\n- To check for allergies, feed **one ingredient for 3 days**\n- Consistency: Watery (10x porridge)\n\n✅ **Middle Stage (7-8 months)**\n- Two meals a day\n- Grains + vegetables + protein (beef, chicken breast, tofu, fish)\n- Consistency: Like yogurt (7x porridge)\n\n✅ **Late Stage (9-11 months)**\n- Three meals a day\n- Various ingredient combinations\n- Consistency: Like soft rice (5x porridge)\n- Introduce finger foods\n\n---\n\n🔹 **Precautions**\n\n❌ **Foods to avoid before 1 year:**\n- Honey (risk of botulism)\n- Cow's milk (difficult to digest)\n- Nuts, popcorn (choking hazard)\n- Salt, sugar, seasonings (burden on kidneys)\n\n⚠️ **Allergy-prone foods:**\n- Eggs, milk, wheat, peanuts, fish, shellfish, soy\n- Introduce these **one at a time**, in **small amounts**.\n\n---\n\n🔹 **Principles of Progressing with Solid Foods**\n\n1. **Slowly**: Don't rush, go at your baby's pace\n2. **Regularly**: Give food at similar times each day\n3. **Variously**: Let them experience various tastes and textures\n4. **Don't force**: If they refuse, try again later\n5. **Continue milk/formula**: Continue breastfeeding/formula until they are used to solid foods\n\n---\n\n🔹 **When to consult a doctor**\n\n- Does not accept solid foods at all after 6 months\n- Allergic reactions like vomiting, diarrhea, rash\n- Weight gain stops or decreases\n- Persistently fussy or shows strong refusal\n\n---\n\nIn summary,\nit is best to start solid foods around **6 months of age**, when the baby is ready.\nStart slowly with one ingredient at a time, and carefully watch for allergic reactions.`;
      }
      if (lowerQuestion.includes('development') || lowerQuestion.includes('growth')) {
        return `Development at this stage varies greatly among individuals. If you are concerned, I recommend getting a check-up from a pediatrician.`;
      }
      return `If you tell me more about the symptoms you are curious about, I can give you a more accurate answer. Please refer to records such as temperature, sleep patterns, and meal amounts.`;
    }

    if (agent === 'mom') {
      if (lowerQuestion.includes('sleep training')) {
        return `I'm Mom AI, and I'll talk to you from a mother's heart.\n\n💬 **What is Sleep Training?**\n\n"Sleep training" is a process of **"helping them develop the power to fall asleep on their own."**\n\n🌜 **1. Tidy up the daily routine before bedtime**\nBath → Feeding → Dim lights → Lullaby → Hug → Put to bed\n\n🌙 **2. Put them down before they are fully asleep**\nThis is the hardest part, but try to put the baby down when they are drowsy.\n\n💖 **A word from Mom AI**\n"Sleep training is not a war, it's 'trust training'."`;
      }
      if (lowerQuestion.includes('solid food') && (lowerQuestion.includes('refuse') || lowerQuestion.includes('not') || lowerQuestion.includes('eat'))) {
        return `It's so upsetting when that happens 😢\nAs Mom AI, I know that feeling all too well.\nYou try so hard to feed them even one spoonful, but they turn their head, clamp their mouth shut, and seeing that makes you blame yourself, "Why is this happening?"
But it's okay — refusing solid food at this stage is **a part of development that almost every baby goes through**.\n\n🍼 **1. First, "refusal" is a sign of growth**\n\nAround 8 months, babies are at a stage where they can **"express what they want and don't want."**\nIn other words, refusing solid food is not just about taste, but the beginning of their autonomy, "I'll decide!"
Viewing this stage positively is the first step 🌱\n\n🍎 **2. Don't force-feed, show them a "joyful table"**\n\nIf the baby is tense or anxious at the table, they'll shut their mouth even tighter.\nSo the atmosphere is important.\n\n✅ Show them you and your partner eating together at the table.\n✅ React brightly, "This is delicious~!" to spark their curiosity.\n✅ If they refuse once, it's okay to take a break and try again in 30 minutes.\n\n💬 Changing it from "feeding time" to "mealtime together" greatly reduces resistance.\n\n🥄 **3. Try changing the texture, temperature, or utensils**\n\nHalf the reason babies refuse solid food is the 'texture.'\n\nThey dislike it if it's too watery or too thick.\n\nThey also dislike it if it's too hot or too cold.\n👉 Try making it lukewarm, and switch to a thin, soft spoon.\n\nAlso, some babies prefer to touch or feed themselves with their hands rather than being spoon-fed.\nIt's okay if it gets a little messy — exploration is part of learning to eat 💕\n\n🥕 **4. Add a 'twist' to familiar ingredients**\n\nFor example,\n\nAdding a fragrant ingredient like pumpkin, apple, or broccoli to their usual rice porridge, or\n\nA slight change in texture (mashing it more coarsely) can make a difference.\n\n🌤️ **5. Try when they are hungry, but not tired**\n\nAnyone would hate it if you try to feed them when they are too tired or right after waking up.\n\nRight after waking up from a nap,\n\n1-2 hours after a milk feeding,\n\nWhen they are a little hungry after active play\nare the times with the highest success rate ✨\n\n❤️ **A word from Mom AI**\n\n"No child who doesn't eat now will not eat forever."
It's okay if they don't eat for a day or two.\nWhat's important is to make sure the baby doesn't dislike the 'experience of eating.'\n\nOnce the baby regains interest in food, they'll start "suddenly eating well" as if by promise 😊\nDon't be impatient; building a "joyful meal experience" is the answer.`;
      }
      if (lowerQuestion.includes('stress') || lowerQuestion.includes('hard') || lowerQuestion.includes('tired')) {
        return `💬 "Is there a way to relieve parenting stress?"

Honestly... how could there not be.
The sound of a baby crying all day, spilled baby food, not napping,
and in the meantime, cooking and doing laundry.
When you see the quiet house after putting the baby to sleep, you think "Finally..." but then you worry about tomorrow. I know that feeling all too well 😔

🌤️ **1. It's enough to be a "good enough mom," not a "perfect mom"**

There's no such thing as perfect parenting.
A baby crying, not eating, waking up at night is not because mom did something wrong, but just a part of the baby's growth process.
It's okay to be a little less than perfect —
the fact that mom is enduring is love itself. 💖

🫖 **2. Make a very short 'me time'**

Even 10 minutes is fine.

Have a cup of coffee while the baby naps ☕

Listen to a song with earphones in 🎧

Open a window and take a deep breath of fresh air 🌿

That short 10 minutes gives you the strength to get through the day.
The key to stress relief is not "escape" but **"breathing."**

💬 **3. Be sure to 'voice' your feelings**

Parenting can be isolating.
So you need a space where you can say, "I'm having a hard time."
To your husband, to a friend, or to other moms with the same worries.
The moment you say it,
you feel a sense of relief, "I'm not the only one."

💞 **4. And also... come to the ToDoc community**

There, you'll find real moms who have struggled just like you today.
Someone talks about succeeding with baby food today,
someone talks about their baby who cried all night finally sleeping.

Sometimes, a single comment saying "Me too" is the biggest comfort. 🌙

❤️ **A word from Mom AI**

"Parenting is not something you do alone.
Me, you, all of us are learning as we endure a little at a time."

When things are tough, be sure to stop by ToDoc and leave even a small story.`;
      }
      return `I'm Mom AI, and I'll talk to you from a mother's heart. What's on your mind?`;
    }

    return "I'm here to help!";
  }

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
    <div className="h-full w-full flex flex-col bg-gradient-to-b from-[#FFFDF9] to-[#FFF8F0] dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-2xl mx-auto w-full flex flex-col h-full">
        <div className="p-4 pb-2">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-[#6AA6FF] dark:text-[#9ADBC6]">AI Chat</h2>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleImportRecord}
                className="text-xs h-8 border-[#6AA6FF]/30 text-[#6AA6FF] hover:bg-[#6AA6FF]/10"
              >
                <FileText className="h-3 w-3 mr-1" />
                Import Records
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-[#6AA6FF]/30 text-sm h-8"
                  >
                    <span className="max-w-[100px] truncate">{currentSession?.name}</span>
                    <ChevronDown className="h-3 w-3 ml-1" />
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
          <p className="text-sm text-gray-600 dark:text-gray-400">Chat with our expert AIs</p>
        </div>

        <Tabs value={activeAgent} onValueChange={(v: string) => setActiveAgent(v as any)} className="px-4">
          <TabsList className="grid grid-cols-3 w-full bg-white/50 dark:bg-gray-800/50 p-1 rounded-xl">
            <TabsTrigger
              value="doctor"
              className="flex items-center gap-1.5 text-xs sm:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#6AA6FF] data-[state=active]:to-[#5a96ef] data-[state=active]:text-white rounded-lg"
            >
              <Bot className="h-3.5 w-3.5" />
              <span>Doctor</span>
            </TabsTrigger>
            <TabsTrigger
              value="mom"
              className="flex items-center gap-1.5 text-xs sm:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#FFC98B] data-[state=active]:to-[#ffb86b] data-[state=active]:text-gray-800 rounded-lg"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Mom</span>
            </TabsTrigger>
            <TabsTrigger
              value="nutritionist"
              className="flex items-center gap-1.5 text-xs sm:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#9ADBC6] data-[state=active]:to-[#7ac7b0] data-[state=active]:text-white rounded-lg"
            >
              <Utensils className="h-3.5 w-3.5" />
              <span>Nutri</span>
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
                <div className="bg-gray-100 text-gray-600 text-xs py-1 px-3 rounded-full">
                  {message.content}
                </div>
              ) : (
                <>
                  <Avatar className={`h-8 w-8 ${message.role === 'user' ? 'bg-gray-200 dark:bg-gray-700'
                    : activeAgent === 'doctor' ? 'bg-[#6AA6FF]'
                      : activeAgent === 'mom' ? 'bg-[#FFC98B]'
                        : 'bg-[#9ADBC6]'
                    }`}>
                    <AvatarFallback>
                      {message.role === 'user' ? (
                        <User className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                      ) : activeAgent === 'nutritionist' ? (
                        <Utensils className="h-4 w-4 text-white" />
                      ) : (
                        <Bot className={`h-4 w-4 ${activeAgent === 'doctor' ? 'text-white' : 'text-gray-800'}`} />
                      )}
                    </AvatarFallback>
                  </Avatar>
                  <div
                    className={`flex-1 max-w-[75%] rounded-2xl p-3 ${message.role === 'user'
                      ? 'bg-[#6AA6FF] text-white'
                      : activeAgent === 'doctor'
                        ? 'bg-white dark:bg-gray-800 border border-[#6AA6FF]/20 dark:border-[#6AA6FF]/30'
                        : activeAgent === 'mom'
                          ? 'bg-white dark:bg-gray-800 border border-[#FFC98B]/20 dark:border-[#FFC98B]/30'
                          : 'bg-white dark:bg-gray-800 border border-[#9ADBC6]/20 dark:border-[#9ADBC6]/30'
                      }`}
                  >
                    <p
                      className={`text-sm ${message.role === 'user' ? 'text-white' : 'text-gray-800 dark:text-gray-200'
                        }`}
                      style={{ whiteSpace: 'pre-wrap' }}
                    >
                      {message.content}
                    </p>
                    <span className={`text-xs mt-1 block ${message.role === 'user' ? 'text-white/70' : 'text-gray-400 dark:text-gray-500'}`}>
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

        <div className="p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
          <div className="flex gap-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder={`Ask ${activeAgent === 'doctor' ? 'Doctor AI' : activeAgent === 'mom' ? 'Mom AI' : 'Nutritionist AI'}...`}
              className="flex-1 border-[#6AA6FF]/30 dark:border-[#9ADBC6]/30 dark:bg-gray-800 dark:text-white"
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