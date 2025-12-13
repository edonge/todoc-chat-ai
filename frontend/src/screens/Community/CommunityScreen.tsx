import { useState } from 'react';
import { Heart, MessageCircle, Share2, Plus, Search, TrendingUp, ArrowLeft, Image as ImageIcon, Tag, MapPin, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';

interface Comment {
  id: string;
  author: string;
  content: string;
  timestamp: string;
}

interface Post {
  id: string;
  author: string;
  authorInitial: string;
  category: string;
  title: string;
  content: string;
  image?: string;
  location?: string;
  likes: number;
  comments: number;
  timestamp: string;
  tags: string[];
  commentsList: Comment[];
}

export default function CommunityScreen() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('all');
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null);
  const [isWriting, setIsWriting] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);

  const [newPost, setNewPost] = useState({
    category: 'Recipes',
    title: '',
    content: '',
    tags: '',
    location: '',
  });

  // 더미 데이터 제거됨 - API에서 가져올 예정

  const handleLike = (postId: string) => {
    setLikedPosts((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
        toast.info('Like removed');
      } else {
        newSet.add(postId);
        toast.success('Post liked!');
      }
      return newSet;
    });
  };

  const toggleComments = (postId: string) => {
    if (expandedPostId === postId) {
      setExpandedPostId(null);
    } else {
      setExpandedPostId(postId);
    }
  };

  const handleSubmitPost = () => {
    if (!newPost.title || !newPost.content) {
      toast.error('Please enter a title and content.');
      return;
    }

    const post: Post = {
      id: Date.now().toString(),
      author: 'Me',
      authorInitial: 'Me',
      category: newPost.category,
      title: newPost.title,
      content: newPost.content,
      location: newPost.location,
      likes: 0,
      comments: 0,
      timestamp: 'Just now',
      tags: newPost.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      commentsList: [],
    };

    setPosts([post, ...posts]);
    setIsWriting(false);
    setNewPost({ category: 'Recipes', title: '', content: '', tags: '', location: '' });
    setShowMap(false);
    toast.success('Post created successfully!');
  };

  const allPosts = [...posts];

  const filteredPosts = allPosts.filter((post) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'recipe') return post.category === 'Recipes';
    if (activeTab === 'tips') return post.category === 'Tips';
    if (activeTab === 'qna') return post.category === 'Support';
    return true;
  });

  if (isWriting) {
    return (
      <div className="h-full w-full overflow-auto">
        <div className="max-w-2xl mx-auto p-4">
          <div className="flex items-center gap-3 mb-6">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setIsWriting(false);
                setNewPost({ category: 'Recipes', title: '', content: '', tags: '', location: '' });
                setShowMap(false);
              }}
              className="text-gray-600 dark:text-gray-400 hover:text-[#6AA6FF] dark:hover:text-[#9ADBC6]"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h2 className="text-[#6AA6FF] dark:text-[#9ADBC6]">{t('community.writePost')}</h2>
          </div>

          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium mb-2 block">{t('community.category')}</Label>
              <div className="grid grid-cols-3 gap-2">
                {['Recipes', 'Tips', 'Support'].map((category) => (
                  <button
                    key={category}
                    onClick={() => setNewPost({ ...newPost, category })}
                    className={`
                      py-2 px-3 rounded-lg text-sm font-medium transition-all
                      ${newPost.category === category
                        ? 'bg-[#6AA6FF] text-white shadow-md'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }
                    `}
                  >
                    {category === 'Recipes' ? t('community.recipes') : category === 'Tips' ? t('community.tips') : t('community.support')}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="title" className="text-sm font-medium mb-2 block">
                {t('community.title2')}
              </Label>
              <Input
                id="title"
                placeholder={t('community.titlePlaceholder')}
                value={newPost.title}
                onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                className="border-[#6AA6FF]/30"
              />
            </div>

            <div>
              <Label htmlFor="content" className="text-sm font-medium mb-2 block">
                {t('community.content')}
              </Label>
              <Textarea
                id="content"
                placeholder={t('community.contentPlaceholder')}
                value={newPost.content}
                onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                className="min-h-[200px] border-[#6AA6FF]/30 resize-none"
              />
            </div>

            <div>
              <Label htmlFor="tags" className="text-sm font-medium mb-2 block flex items-center gap-2">
                <Tag className="h-4 w-4" />
                {t('community.tags')}
              </Label>
              <Input
                id="tags"
                placeholder={t('community.tagsPlaceholder')}
                value={newPost.tags}
                onChange={(e) => setNewPost({ ...newPost, tags: e.target.value })}
                className="border-[#6AA6FF]/30"
              />
            </div>

            <div>
              <div className="flex gap-2 mb-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowMap(!showMap)}
                  className={`gap-2 ${showMap ? 'bg-[#6AA6FF]/10 text-[#6AA6FF] border-[#6AA6FF]' : ''}`}
                >
                  <MapPin className="h-4 w-4" />
                  {newPost.location || t('community.addLocation')}
                </Button>
                <Button variant="outline" size="sm" className="gap-2" disabled>
                  <ImageIcon className="h-4 w-4" />
                  {t('community.addImage')}
                </Button>
              </div>

              {showMap && (
                <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 mb-4 animate-in fade-in slide-in-from-top-2">
                  <div className="bg-gray-200 dark:bg-gray-600 h-40 rounded-lg flex flex-col items-center justify-center mb-3 relative overflow-hidden">
                    <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#6AA6FF 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                    <MapPin className="h-8 w-8 text-[#6AA6FF] mb-2 z-10" />
                    <p className="text-sm text-gray-600 dark:text-gray-300 z-10 font-medium">{t('community.selectLocation')}</p>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder={t('community.searchLocation')}
                      className="bg-white dark:bg-gray-800"
                    />
                    <Button
                      onClick={() => {
                        setNewPost({ ...newPost, location: 'Gangnam-gu, Seoul' });
                        setShowMap(false);
                        toast.success(t('community.locationAdded'));
                      }}
                      className="bg-[#6AA6FF] hover:bg-[#5a96ef]"
                    >
                      {t('community.publish')}
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setIsWriting(false);
                  setNewPost({ category: 'Recipes', title: '', content: '', tags: '', location: '' });
                  setShowMap(false);
                }}
              >
                {t('community.cancel')}
              </Button>
              <Button
                className="flex-1 bg-[#6AA6FF] hover:bg-[#5a96ef]"
                onClick={handleSubmitPost}
              >
                {t('community.publish')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full overflow-auto">
      <div className="max-w-2xl mx-auto p-4">
        <div className="mb-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-[#6AA6FF] dark:text-[#9ADBC6] mb-1">{t('community.title')}</h2>
              <p className="text-sm text-[#CFCFCF] dark:text-[#CFCFCF]">{t('community.subtitle')}</p>
            </div>
            <Button
              className="bg-[#6AA6FF] hover:bg-[#5a96ef] rounded-full"
              size="icon"
              onClick={() => setIsWriting(true)}
            >
              <Plus className="h-5 w-5" />
            </Button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
            <Input
              placeholder={t('community.searchLocation')}
              className="pl-10 border-[#6AA6FF]/30 dark:border-[#9ADBC6]/30 bg-card"
            />
          </div>
        </div>

        <div className="mb-4 bg-card rounded-2xl p-1.5 shadow-md border border-border">
          <div className="grid grid-cols-4 gap-1 relative">
            {['all', 'recipe', 'tips', 'qna'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`
                  relative py-2.5 px-4 rounded-xl text-sm font-medium transition-all duration-200
                  ${activeTab === tab
                    ? 'bg-gradient-to-r from-[#6AA6FF] to-[#9ADBC6] text-white shadow-lg'
                    : 'text-black dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-[#6AA6FF] dark:hover:text-[#9ADBC6]'
                  }
                `}
              >
                {tab === 'all' && t('community.all')}
                {tab === 'recipe' && t('community.recipes')}
                {tab === 'tips' && t('community.tips')}
                {tab === 'qna' && t('community.support')}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {filteredPosts.map((post) => (
            <Card
              key={post.id}
              className="bg-card shadow-lg border-2 border-border hover:shadow-xl transition-shadow overflow-hidden"
            >
              {post.image && (
                <div className="w-full h-48 overflow-hidden relative group">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
                    {post.category}
                  </div>
                </div>
              )}

              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Avatar className="h-8 w-8 bg-gradient-to-br from-[#6AA6FF] to-[#9ADBC6]">
                    <AvatarFallback className="text-white text-sm">
                      {post.authorInitial}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-[#F3F3F3] dark:text-[#F3F3F3]">{post.author}</p>
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-[#CFCFCF] dark:text-[#CFCFCF]">{post.timestamp}</p>
                      {post.location && (
                        <span className="flex items-center text-xs text-[#A5A5A5] dark:text-[#A5A5A5]">
                          <MapPin className="h-3 w-3 mr-0.5" />
                          {post.location}
                        </span>
                      )}
                    </div>
                  </div>
                  {!post.image && (
                    <Badge
                      variant="secondary"
                      className={`${post.category === 'Recipes'
                          ? 'bg-[#FFC98B]/20 text-[#FFC98B]'
                          : post.category === 'Tips'
                            ? 'bg-[#6AA6FF]/20 text-[#6AA6FF]'
                            : 'bg-[#9ADBC6]/20 text-[#9ADBC6]'
                        }`}
                    >
                      {post.category}
                    </Badge>
                  )}
                </div>

                <div className="mb-3">
                  <h3 className="mb-1 text-[#F3F3F3] dark:text-[#F3F3F3] font-semibold">{post.title}</h3>
                  <p className="text-sm text-[#F3F3F3] dark:text-[#F3F3F3] line-clamp-2">
                    {post.content}
                  </p>
                </div>

                <div className="flex gap-2 mb-3 flex-wrap">
                  {post.tags.map((tag: string, idx: number) => (
                    <span
                      key={idx}
                      className="text-xs px-2 py-1 rounded-full post-tag"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-4 pt-3 border-t border-gray-100 dark:border-gray-700">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleLike(post.id)}
                    className={`gap-2 ${likedPosts.has(post.id) ? 'text-red-500' : 'text-[#F3F3F3] dark:text-[#F3F3F3]'
                      }`}
                  >
                    <Heart
                      className={`h-4 w-4 ${likedPosts.has(post.id) ? 'fill-current' : ''
                        }`}
                    />
                    <span className="text-sm">
                      {post.likes + (likedPosts.has(post.id) ? 1 : 0)}
                    </span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`gap-2 ${expandedPostId === post.id ? 'text-[#6AA6FF] bg-[#6AA6FF]/10 dark:bg-[#9ADBC6]/20' : 'text-[#F3F3F3] dark:text-[#F3F3F3]'}`}
                    onClick={() => toggleComments(post.id)}
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span className="text-sm">{post.comments}</span>
                  </Button>
                  <Button variant="ghost" size="sm" className="ml-auto text-[#F3F3F3] dark:text-[#F3F3F3]">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>

                {expandedPostId === post.id && (
                  <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 animate-in slide-in-from-top-2">
                    <div className="space-y-3 mb-4">
                      {post.commentsList.length > 0 ? (
                        post.commentsList.map((comment: Comment) => (
                          <div key={comment.id} className="flex gap-2">
                            <Avatar className="h-6 w-6 bg-gray-200 dark:bg-gray-700">
                              <AvatarFallback className="text-[10px] text-[#F3F3F3] dark:text-[#F3F3F3]">{comment.author[0]}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 bg-gray-50 dark:bg-gray-700 rounded-lg p-2">
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-xs font-medium text-[#F3F3F3] dark:text-[#F3F3F3]">{comment.author}</span>
                                <span className="text-[10px] text-[#A5A5A5] dark:text-[#A5A5A5]">{comment.timestamp}</span>
                              </div>
                              <p className="text-xs text-[#F3F3F3] dark:text-[#F3F3F3]">{comment.content}</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-center text-sm text-[#A5A5A5] dark:text-[#A5A5A5] py-2">{t('community.noComments')}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        placeholder={t('community.writeComment')}
                        className="h-8 text-sm border-[#6AA6FF]/30"
                      />
                      <Button size="sm" className="h-8 w-8 p-0 bg-[#6AA6FF] hover:bg-[#5a96ef]">
                        <Send className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mt-6 border-2 border-[#6AA6FF]/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="h-4 w-4 text-[#6AA6FF]" />
              <h3 className="text-sm text-[#6AA6FF]">{t('community.trendingTag')}</h3>
            </div>
            <div className="flex gap-2 flex-wrap">
              {['baby food', 'sleep', 'play', 'development', 'baby items', 'health'].map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="cursor-pointer hover:bg-[#6AA6FF]/10 border-[#6AA6FF]/30"
                >
                  #{tag}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}