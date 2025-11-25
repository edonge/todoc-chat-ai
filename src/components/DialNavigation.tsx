import { useState, useRef } from 'react';
import { Home, FileText, MessageCircle, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface DialNavigationProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
}

export default function DialNavigation({ currentTab, onTabChange }: DialNavigationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const dialRef = useRef<HTMLDivElement>(null);

  const tabs = [
    { id: 'home', label: 'Home', icon: Home, color: '#6AA6FF' },
    { id: 'record', label: 'Record', icon: FileText, color: '#FFC98B' },
    { id: 'chat', label: 'AI Chat', icon: MessageCircle, color: '#9ADBC6' },
    { id: 'community', label: 'Community', icon: Users, color: '#6AA6FF' },
  ];

  const currentTabIndex = tabs.findIndex((tab) => tab.id === currentTab);

  const handleToggle = () => {
    setIsOpen(!isOpen);
    setHoveredIndex(null);
  };

  const handleTabClick = (index: number) => {
    onTabChange(tabs[index].id);
    setIsOpen(false);
    setHoveredIndex(null);
  };

  const currentTabData = tabs[currentTabIndex];
  const CurrentIcon = currentTabData?.icon || Home;

  const radius = 110;
  const startAngle = -90;

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pointer-events-none">
        <motion.div
          className="relative pointer-events-auto mb-2"
          ref={dialRef}
          animate={{
            y: isOpen ? -140 : 0
          }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          <AnimatePresence>
            {isOpen && (
              <>
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                  style={{ pointerEvents: 'none' }}
                >
                  <div
                    className="border-2 border-dashed border-[#6AA6FF]/30 rounded-full"
                    style={{ width: radius * 2 + 80, height: radius * 2 + 80 }}
                  />
                </motion.div>

                {tabs.map((tab, index) => {
                  const Icon = tab.icon;
                  const angle = startAngle + (360 / tabs.length) * index;
                  const angleRad = (angle * Math.PI) / 180;
                  const x = Math.cos(angleRad) * radius;
                  const y = Math.sin(angleRad) * radius;
                  const isHighlighted = hoveredIndex === index;
                  const isCurrentTab = currentTabIndex === index;

                  return (
                    <motion.div
                      key={tab.id}
                      initial={{ scale: 0, x: 0, y: 0 }}
                      animate={{ scale: 1, x, y }}
                      exit={{ scale: 0, x: 0, y: 0 }}
                      transition={{
                        type: 'spring',
                        stiffness: 260,
                        damping: 20,
                        delay: index * 0.05,
                      }}
                      className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                      onMouseEnter={() => setHoveredIndex(index)}
                      onMouseLeave={() => setHoveredIndex(null)}
                    >
                      <button
                        onClick={() => handleTabClick(index)}
                        className="relative group cursor-pointer"
                        style={{
                          filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))',
                        }}
                      >
                        <motion.div
                          className="rounded-full flex items-center justify-center transition-all"
                          style={{
                            backgroundColor: tab.color,
                            width: isHighlighted || isCurrentTab ? 72 : 64,
                            height: isHighlighted || isCurrentTab ? 72 : 64,
                          }}
                          animate={{
                            scale: isHighlighted || isCurrentTab ? 1.1 : 1,
                            boxShadow: isHighlighted || isCurrentTab
                              ? '0 0 20px rgba(106, 166, 255, 0.6)'
                              : '0 4px 6px rgba(0, 0, 0, 0.1)',
                          }}
                          transition={{ duration: 0.2 }}
                        >
                          <Icon className="text-white" style={{ width: isHighlighted || isCurrentTab ? 32 : 28, height: isHighlighted || isCurrentTab ? 32 : 28 }} />
                        </motion.div>

                        <motion.div
                          className="absolute -top-12 left-1/2 transform -translate-x-1/2 whitespace-nowrap"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: isHighlighted || isCurrentTab ? 1 : 0, y: isHighlighted || isCurrentTab ? 0 : 10 }}
                          transition={{ duration: 0.2 }}
                        >
                          <span className="px-3 py-1.5 rounded-full bg-white text-gray-800 shadow-lg" style={{ fontSize: '14px' }}>
                            {tab.label}
                          </span>
                        </motion.div>
                      </button>
                    </motion.div>
                  );
                })}
              </>
            )}
          </AnimatePresence>

          <motion.button
            onClick={handleToggle}
            className="relative rounded-full shadow-2xl transition-all hover:scale-105 z-10"
            style={{
              backgroundColor: currentTabData?.color || '#6AA6FF',
              width: 72,
              height: 72,
            }}
            animate={{
              rotate: isOpen ? 0 : 0,
              scale: isOpen ? 0.9 : 1,
            }}
            transition={{ duration: 0.3 }}
          >
            <CurrentIcon className="text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" style={{ width: 32, height: 32 }} />

            {!isOpen && (
              <>
                <motion.div
                  className="absolute inset-0 rounded-full border-2"
                  style={{ borderColor: currentTabData?.color || '#6AA6FF' }}
                  animate={{
                    scale: [1, 1.4, 1],
                    opacity: [0.5, 0, 0.5],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />
                <motion.div
                  className="absolute inset-0 rounded-full border-2"
                  style={{ borderColor: currentTabData?.color || '#6AA6FF' }}
                  animate={{
                    scale: [1, 1.4, 1],
                    opacity: [0.5, 0, 0.5],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: 1,
                  }}
                />
              </>
            )}
          </motion.button>

        </motion.div>
      </div>
    </>
  );
}