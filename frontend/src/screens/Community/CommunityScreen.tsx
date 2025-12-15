import { useState, useEffect } from 'react';
import { Heart, MessageCircle, Share2, Plus, Search, TrendingUp, ArrowLeft, Image as ImageIcon, Tag, MapPin, Send, Loader2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCommunity, useComments } from '@/api/hooks/useCommunity';
import type { CommunityCategory } from '@/api/types';
import { getChildren } from '@/services/api/childService';

// 댓글 섹션 컴포넌트
function CommentSection({ postId, onCommentCountChange }: { postId: number; onCommentCountChange: (delta: number) => void }) {
  const { language } = useLanguage();
  const { comments, loading, fetchComments, createComment, deleteComment } = useComments(postId);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchComments().catch(console.error);
  }, [fetchComments]);

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;

    setSubmitting(true);
    try {
      await createComment({ content: newComment.trim() });
      setNewComment('');
      onCommentCountChange(1);
      toast.success(language === 'ko' ? '댓글이 작성되었습니다.' : 'Comment posted.');
    } catch {
      toast.error(language === 'ko' ? '댓글 작성에 실패했습니다.' : 'Failed to post comment.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    try {
      await deleteComment(commentId);
      onCommentCountChange(-1);
      toast.success(language === 'ko' ? '댓글이 삭제되었습니다.' : 'Comment deleted.');
    } catch {
      toast.error(language === 'ko' ? '댓글 삭제에 실패했습니다.' : 'Failed to delete comment.');
    }
  };

  const formatTimestamp = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return language === 'ko' ? '방금 전' : 'Just now';
    if (diffMins < 60) return language === 'ko' ? `${diffMins}분 전` : `${diffMins}m ago`;
    if (diffHours < 24) return language === 'ko' ? `${diffHours}시간 전` : `${diffHours}h ago`;
    if (diffDays < 7) return language === 'ko' ? `${diffDays}일 전` : `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 animate-in slide-in-from-top-2">
      <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
        {loading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="h-5 w-5 animate-spin text-[#6AA6FF]" />
          </div>
        ) : comments.length === 0 ? (
          <p className="text-center text-sm text-[#A5A5A5] dark:text-[#A5A5A5] py-2">
            {language === 'ko' ? '아직 댓글이 없습니다.' : 'No comments yet.'}
          </p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="flex gap-2 group">
              <Avatar className="h-6 w-6 bg-gradient-to-br from-[#6AA6FF] to-[#9ADBC6] flex-shrink-0">
                <AvatarFallback className="text-white text-xs">
                  {comment.author?.username?.[0]?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-[#F3F3F3]">
                    {comment.author?.username || 'Unknown'}
                  </span>
                  <span className="text-xs text-[#A5A5A5]">
                    {formatTimestamp(comment.created_at)}
                  </span>
                  <button
                    onClick={() => handleDeleteComment(comment.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity ml-auto"
                    title={language === 'ko' ? '삭제' : 'Delete'}
                  >
                    <Trash2 className="h-3 w-3 text-red-400 hover:text-red-500" />
                  </button>
                </div>
                <p className="text-sm text-[#CFCFCF] break-words">{comment.content}</p>
              </div>
            </div>
          ))
        )}
      </div>
      <div className="flex gap-2">
        <Input
          placeholder={language === 'ko' ? '댓글을 입력하세요...' : 'Write a comment...'}
          className="h-8 text-sm border-[#6AA6FF]/30"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmitComment();
            }
          }}
          disabled={submitting}
        />
        <Button
          size="sm"
          className="h-8 w-8 p-0 bg-[#6AA6FF] hover:bg-[#5a96ef]"
          onClick={handleSubmitComment}
          disabled={submitting || !newComment.trim()}
        >
          {submitting ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <Send className="h-3 w-3" />
          )}
        </Button>
      </div>
    </div>
  );
}

export default function CommunityScreen() {
  const { t, language } = useLanguage();
  const { posts, loading, fetchPosts, createPost, toggleLike, updatePostCommentCount } = useCommunity();
  const [activeTab, setActiveTab] = useState<'all' | CommunityCategory>('all');
  const [expandedPostId, setExpandedPostId] = useState<number | null>(null);
  const [isWriting, setIsWriting] = useState(false);
  const [showMap, setShowMap] = useState(false);

  const [newPost, setNewPost] = useState({
    category: 'recipe' as CommunityCategory,
    title: '',
    content: '',
    tags: '',
    location: '',
  });
  const [kidProfile, setKidProfile] = useState<{ id: number | null; name: string; image_url: string | null }>({
    id: null,
    name: '',
    image_url: null,
  });
  const apiBaseUrl = (import.meta as any).env?.VITE_API_URL || '';

  useEffect(() => {
    const loadKidProfile = async () => {
      try {
        const children = await getChildren();
        if (children.length > 0) {
          setKidProfile({
            id: children[0].id,
            name: children[0].name,
            image_url: children[0].image_url || null,
          });
        }
      } catch (err) {
        console.error('Failed to load child profile:', err);
      }
    };
    loadKidProfile();
  }, []);

  // 컴포넌트 마운트 및 탭 변경 시 게시물 가져오기
  useEffect(() => {
    const loadPosts = async () => {
      try {
        if (activeTab === 'all') {
          await fetchPosts();
        } else {
          await fetchPosts({ category: activeTab });
        }
      } catch (err) {
        console.error('Failed to load posts:', err);
      }
    };
    loadPosts();
  }, [activeTab, fetchPosts]);

  const handleLike = async (postId: number) => {
    try {
      const result = await toggleLike(postId);
      if (result.liked) {
        toast.success(language === 'ko' ? '좋아요!' : 'Post liked!');
      } else {
        toast.info(language === 'ko' ? '좋아요 취소' : 'Like removed');
      }
    } catch {
      toast.error(language === 'ko' ? '오류가 발생했습니다' : 'An error occurred');
    }
  };

  const toggleComments = (postId: number) => {
    if (expandedPostId === postId) {
      setExpandedPostId(null);
    } else {
      setExpandedPostId(postId);
    }
  };

  const handleSubmitPost = async () => {
    if (!newPost.title || !newPost.content) {
      toast.error(language === 'ko' ? '제목과 내용을 입력해주세요.' : 'Please enter a title and content.');
      return;
    }

    try {
      const result = await createPost({
        kid_id: kidProfile.id || undefined,
        category: newPost.category,
        title: newPost.title,
        content: newPost.content,
      });
      setIsWriting(false);
      setNewPost({ category: 'recipe', title: '', content: '', tags: '', location: '' });
      setShowMap(false);
      toast.success(language === 'ko' ? '게시물이 작성되었습니다!' : 'Post created successfully!');
    } catch (err) {
      console.error('Failed to create post:', err);
      toast.error(language === 'ko' ? '게시물 작성에 실패했습니다.' : 'Failed to create post.');
    }
  };

  const formatTimestamp = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return language === 'ko' ? '방금 전' : 'Just now';
    if (diffMins < 60) return language === 'ko' ? `${diffMins}분 전` : `${diffMins}m ago`;
    if (diffHours < 24) return language === 'ko' ? `${diffHours}시간 전` : `${diffHours}h ago`;
    if (diffDays < 7) return language === 'ko' ? `${diffDays}일 전` : `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const getCategoryDisplay = (category: string) => {
    const categoryMap: Record<string, string> = {
      recipe: language === 'ko' ? '레시피' : 'Recipe',
      general: language === 'ko' ? '일반' : 'General',
      marketplace: language === 'ko' ? '장터' : 'Marketplace',
    };
    return categoryMap[category] || category;
  };

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
                setNewPost({ category: 'recipe', title: '', content: '', tags: '', location: '' });
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
                {(['recipe', 'general', 'marketplace'] as CommunityCategory[]).map((category) => (
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
                    {getCategoryDisplay(category)}
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
                  setNewPost({ category: 'recipe', title: '', content: '', tags: '', location: '' });
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
            {(['all', 'general', 'marketplace', 'recipe'] as const).map((tab) => (
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
                {tab === 'recipe' && t('community.recipe')}
                {tab === 'general' && t('community.general')}
                {tab === 'marketplace' && t('community.marketplace')}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-[#6AA6FF]" />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-[#A5A5A5]">
              {language === 'ko' ? '아직 게시물이 없습니다.' : 'No posts yet.'}
            </p>
            <Button
              className="mt-4 bg-[#6AA6FF] hover:bg-[#5a96ef]"
              onClick={() => setIsWriting(true)}
            >
              {language === 'ko' ? '첫 게시물 작성하기' : 'Write the first post'}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <Card
                key={post.id}
                className="bg-card shadow-lg border-2 border-border hover:shadow-xl transition-shadow overflow-hidden"
              >
                {post.image_url && (
                  <div className="w-full h-48 overflow-hidden relative group">
                    <img
                      src={post.image_url}
                      alt={post.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
                      {getCategoryDisplay(post.category)}
                    </div>
                  </div>
                )}

                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Avatar className="h-8 w-8 bg-gradient-to-br from-[#6AA6FF] to-[#9ADBC6] overflow-hidden">
                      {post.kid_image_url && (
                        <AvatarImage
                          src={
                            post.kid_image_url.starts_with('http')
                              ? post.kid_image_url
                              : `${apiBaseUrl}${post.kid_image_url}`
                          }
                          alt={post.kid_name || 'Baby'}
                          className="object-cover"
                        />
                      )}
                      <AvatarFallback className="text-white text-sm">
                        {(post.kid_name || post.author?.username || 'U').slice(0, 1).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-[#F3F3F3] dark:text-[#F3F3F3]">
                        {post.kid_name || post.author?.username || (language === 'ko' ? '아기' : 'Baby')}
                      </p>
                      <p className="text-xs text-[#CFCFCF] dark:text-[#CFCFCF]">
                        {formatTimestamp(post.created_at)}
                      </p>
                    </div>
                    {!post.image_url && (
                      <Badge
                        variant="secondary"
                        className={`${post.category === 'recipe'
                            ? 'bg-[#FFC98B]/20 text-[#FFC98B]'
                            : post.category === 'general'
                              ? 'bg-[#6AA6FF]/20 text-[#6AA6FF]'
                              : 'bg-[#9ADBC6]/20 text-[#9ADBC6]'
                          }`}
                      >
                        {getCategoryDisplay(post.category)}
                      </Badge>
                    )}
                  </div>

                  <div className="mb-3">
                    <h3 className="mb-1 text-[#F3F3F3] dark:text-[#F3F3F3] font-semibold">{post.title}</h3>
                    <p className="text-sm text-[#F3F3F3] dark:text-[#F3F3F3] line-clamp-2">
                      {post.content}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 pt-3 border-t border-gray-100 dark:border-gray-700">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleLike(post.id)}
                      className={`gap-2 ${post.is_liked ? 'text-red-500' : 'text-[#F3F3F3] dark:text-[#F3F3F3]'}`}
                    >
                      <Heart className={`h-4 w-4 ${post.is_liked ? 'fill-current' : ''}`} />
                      <span className="text-sm">{post.likes_count}</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`gap-2 ${expandedPostId === post.id ? 'text-[#6AA6FF] bg-[#6AA6FF]/10 dark:bg-[#9ADBC6]/20' : 'text-[#F3F3F3] dark:text-[#F3F3F3]'}`}
                      onClick={() => toggleComments(post.id)}
                    >
                      <MessageCircle className="h-4 w-4" />
                      <span className="text-sm">{post.comment_count}</span>
                    </Button>
                    <Button variant="ghost" size="sm" className="ml-auto text-[#F3F3F3] dark:text-[#F3F3F3]">
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {expandedPostId === post.id && (
                    <CommentSection
                      postId={post.id}
                      onCommentCountChange={(delta) => updatePostCommentCount(post.id, delta)}
                    />
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

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
