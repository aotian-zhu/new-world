import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import { X, Heart, MessageSquare, Plus, ImagePlus, Loader2, Edit2, Trash2, Check, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { assetsConfig } from '../config/assetsConfig';

const getPlayerId = () => {
  let playerId = localStorage.getItem('player_device_id');
  if (!playerId) {
    playerId = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    localStorage.setItem('player_device_id', playerId);
  }
  return playerId;
};

type Comment = {
  id: string;
  text: string;
  date: string;
};

type MemoryItem = {
  id: string;
  url: string;
  caption: string;
  desc: string;
  likes: number;
  comments: Comment[];
  isUserAdded?: boolean;
  author_id?: string;
  hasLiked?: boolean;
};

export default function AllMemories() {
  const navigate = useNavigate();
  const [memories, setMemories] = useState<MemoryItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<MemoryItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Upload State
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadCaption, setUploadCaption] = useState("");
  const [uploadDesc, setUploadDesc] = useState("");
  const [uploadUrl, setUploadUrl] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Comment State
  const [commentText, setCommentText] = useState("");
  const [isCommenting, setIsCommenting] = useState(false);

  // Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [editCaption, setEditCaption] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  // Current Player
  const currentPlayerId = getPlayerId();

  useEffect(() => {
    // Scroll to top when page loads
    window.scrollTo(0, 0);
    fetchMemories();
  }, []);

  const fetchMemories = async () => {
    setIsLoading(true);
    const playerId = getPlayerId();
    try {
      const { data: dbMemories, error: memError } = await supabase.from('memories').select('*').order('created_at', { ascending: true });
      const { data: dbComments, error: comError } = await supabase.from('comments').select('*').order('created_at', { ascending: true });
      const { data: dbLikes, error: likeError } = await supabase.from('memory_likes').select('*');
      
      if (memError) throw memError;
      if (comError) throw comError;
      if (likeError) throw likeError;

      const mergedMemories = assetsConfig.exhibitionImages.map((img, idx) => {
        const id = `base_${idx}`;
        const dbMem = dbMemories?.find(m => m.id === id);
        const comments = dbComments?.filter(c => c.memory_id === id).map(c => ({ 
          id: c.id, 
          text: c.text, 
          date: new Date(c.created_at).toLocaleDateString() 
        })) || [];
        const hasLiked = dbLikes?.some(l => l.memory_id === id && l.player_id === playerId) || false;
        
        return {
          id,
          url: img.url,
          caption: img.caption,
          desc: img.desc,
          likes: dbMem ? dbMem.likes : 0,
          comments: comments,
          isUserAdded: false,
          author_id: dbMem?.author_id,
          hasLiked,
        };
      });

      const userMemories = (dbMemories || []).filter(m => m.is_user_added).map(m => {
        const comments = dbComments?.filter(c => c.memory_id === m.id).map(c => ({ 
          id: c.id, 
          text: c.text, 
          date: new Date(c.created_at).toLocaleDateString() 
        })) || [];
        const hasLiked = dbLikes?.some(l => l.memory_id === m.id && l.player_id === playerId) || false;
        
        return {
          id: m.id,
          url: m.url,
          caption: m.caption,
          desc: m.desc || '',
          likes: m.likes || 0,
          comments: comments,
          isUserAdded: true,
          author_id: m.author_id,
          hasLiked,
        };
      });

      setMemories([...mergedMemories, ...userMemories]);
    } catch (error) {
      console.error("Error fetching memories:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLike = async (id: string) => {
    const memory = memories.find(m => m.id === id);
    if (!memory) return;

    const playerId = getPlayerId();
    const isCurrentlyLiked = memory.hasLiked;
    const newLikesCount = isCurrentlyLiked ? memory.likes - 1 : memory.likes + 1;

    // Optimistic UI update
    setMemories(prev => prev.map(m => m.id === id ? { ...m, likes: newLikesCount, hasLiked: !isCurrentlyLiked } : m));
    if (selectedItem?.id === id) {
      setSelectedItem(prev => prev ? { ...prev, likes: newLikesCount, hasLiked: !isCurrentlyLiked } : null);
    }

    try {
      if (isCurrentlyLiked) {
        await supabase.from('memory_likes').delete().match({ memory_id: id, player_id: playerId });
      } else {
        await supabase.from('memory_likes').insert({ memory_id: id, player_id: playerId });
      }
      await supabase.from('memories').update({ likes: newLikesCount }).eq('id', id);
    } catch (error) {
      console.error("Error toggling like:", error);
      setMemories(prev => prev.map(m => m.id === id ? { ...m, likes: memory.likes, hasLiked: isCurrentlyLiked } : m));
      if (selectedItem?.id === id) {
        setSelectedItem(prev => prev ? { ...prev, likes: memory.likes, hasLiked: isCurrentlyLiked } : null);
      }
    }
  };

  const handleAddComment = async (id: string) => {
    if (!commentText.trim() || isCommenting) return;
    setIsCommenting(true);
    
    try {
      const newComment = {
        memory_id: id,
        text: commentText.trim(),
      };
      
      const { data, error } = await supabase.from('comments').insert(newComment).select().single();
      
      if (error) throw error;
      
      if (data) {
        const commentObj = { id: data.id, text: data.text, date: new Date(data.created_at).toLocaleDateString() };
        setMemories(prev => prev.map(m => m.id === id ? { ...m, comments: [...m.comments, commentObj] } : m));
        if (selectedItem?.id === id) {
          setSelectedItem(prev => prev ? { ...prev, comments: [...prev.comments, commentObj] } : null);
        }
      }
      setCommentText("");
    } catch (error) {
      console.error("Error adding comment:", error);
      alert("评论失败，请稍后重试");
    } finally {
      setIsCommenting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        
        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
        setUploadUrl(dataUrl);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleUploadSubmit = async () => {
    if (!uploadUrl || !uploadCaption.trim() || isSubmitting) return;
    setIsSubmitting(true);
    const playerId = getPlayerId();
    
    try {
      const newMemory = {
        id: `user_${Date.now()}`,
        url: uploadUrl,
        caption: uploadCaption.trim(),
        "desc": uploadDesc.trim(),
        is_user_added: true,
        likes: 0,
        author_id: playerId
      };
      
      const { error } = await supabase.from('memories').insert(newMemory);
      
      if (error) throw error;
      
      setMemories(prev => [...prev, { ...newMemory, desc: newMemory.desc || '', comments: [], hasLiked: false }]);
      closeUploadModal();
    } catch (error) {
      console.error("Error uploading memory:", error);
      alert("上传失败，请稍后重试");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePost = async (id: string) => {
    if (!window.confirm("确定要删除这段记忆吗？删除后无法恢复。")) return;
    try {
      const { error } = await supabase.from('memories').delete().eq('id', id);
      if (error) throw error;
      setMemories(prev => prev.filter(m => m.id !== id));
      setSelectedItem(null);
    } catch (error) {
      console.error("Error deleting post:", error);
      alert("删除失败，请稍后重试");
    }
  };

  const handleUpdatePost = async (id: string) => {
    if (!editCaption.trim() || isUpdating) return;
    setIsUpdating(true);
    try {
      const { error } = await supabase.from('memories').update({
        caption: editCaption.trim(),
        "desc": editDesc.trim()
      }).eq('id', id);
      
      if (error) throw error;
      
      setMemories(prev => prev.map(m => m.id === id ? { 
        ...m, 
        caption: editCaption.trim(), 
        desc: editDesc.trim() 
      } : m));
      
      if (selectedItem?.id === id) {
        setSelectedItem(prev => prev ? { 
          ...prev, 
          caption: editCaption.trim(), 
          desc: editDesc.trim() 
        } : null);
      }
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating post:", error);
      alert("修改失败，请稍后重试");
    } finally {
      setIsUpdating(false);
    }
  };

  const startEditing = () => {
    if (selectedItem) {
      setEditCaption(selectedItem.caption);
      setEditDesc(selectedItem.desc);
      setIsEditing(true);
    }
  };

  const closeUploadModal = () => {
    setIsUploading(false);
    setUploadUrl("");
    setUploadCaption("");
    setUploadDesc("");
  };

  return (
    <div className="min-h-screen bg-background relative pb-24">
      {/* Texture overlay */}
      <div className="fixed inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/aged-paper.png')] pointer-events-none z-0" />
      
      {/* Navigation Bar */}
      <nav className="fixed top-0 w-full z-40 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-primary-foreground/70 hover:text-[#d4c3a3] transition-colors font-serif"
          >
            <ArrowLeft size={20} />
            <span>返回庄园</span>
          </button>
          <span className="text-[#d4c3a3] font-serif tracking-widest">所有记忆</span>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-24 relative z-10">
        <div className="max-w-7xl mx-auto px-6 mb-12 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-5xl font-serif tracking-widest text-[#d4c3a3] mb-4"
          >
            庄园记忆库
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-primary-foreground/60 font-serif"
          >
            在这里，浏览所有属于新世界的瞬间
          </motion.p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-12 h-12 animate-spin text-[#d4c3a3]" />
          </div>
        ) : (
          <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {/* Upload Button Card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="group cursor-pointer relative h-full min-h-[300px]"
              onClick={() => setIsUploading(true)}
            >
              <div className="p-4 bg-[#1a1a1a] border border-dashed border-[#444] shadow-2xl transition-all duration-500 hover:border-[#d4c3a3] hover:bg-[#222] h-full flex flex-col items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-[#333] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Plus className="text-[#d4c3a3]" size={32} />
                </div>
                <h4 className="text-[#d4c3a3] font-serif text-lg tracking-widest mb-2">上传记忆</h4>
                <p className="text-primary-foreground/40 text-sm font-serif text-center px-4">分享你在新世界的专属瞬间</p>
              </div>
            </motion.div>

            {memories.map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: Math.min(idx * 0.05, 0.5) }}
                className="group cursor-pointer relative"
                onClick={() => setSelectedItem(item)}
              >
                {/* Frame */}
                <div className="p-4 bg-[#1a1a1a] border border-[#333] shadow-2xl transition-transform duration-500 hover:-translate-y-2 h-full flex flex-col">
                  <div className="relative aspect-square overflow-hidden border border-[#111]">
                    <img 
                      src={item.url} 
                      alt={item.caption}
                      className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-4">
                      <span className="text-[#d4c3a3] font-serif tracking-widest text-sm uppercase">点击查看</span>
                    </div>
                  </div>
                  <div className="mt-4 flex-grow flex flex-col justify-between">
                    <div className="text-center">
                      <h4 className="text-[#d4c3a3] font-serif text-lg tracking-widest line-clamp-1">{item.caption}</h4>
                      <div className="w-8 h-px bg-primary mx-auto mt-2 opacity-50" />
                    </div>
                    <div className="flex justify-between items-center mt-4 text-primary-foreground/50 text-sm">
                      <div className="flex items-center gap-1">
                        <Heart size={14} className={item.hasLiked ? "text-red-900/70 fill-red-900/70" : ""} />
                        <span>{item.likes}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageSquare size={14} />
                        <span>{item.comments.length}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      {/* Upload Modal (Same as Exhibition) */}
      <AnimatePresence>
        {isUploading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm"
            onClick={closeUploadModal}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-[#0a0a0a] border border-[#333] p-6 md:p-8 max-w-lg w-full shadow-2xl relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                className="absolute top-4 right-4 text-primary-foreground/50 hover:text-white transition-colors"
                onClick={closeUploadModal}
              >
                <X size={24} />
              </button>
              
              <h4 className="text-2xl font-serif text-[#d4c3a3] tracking-widest mb-6 border-b border-[#333] pb-4">上传专属记忆</h4>
              
              <div className="space-y-4">
                <div 
                  className="w-full aspect-video border-2 border-dashed border-[#444] hover:border-[#d4c3a3] transition-colors cursor-pointer flex flex-col items-center justify-center bg-[#111] overflow-hidden relative"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {uploadUrl ? (
                    <img src={uploadUrl} alt="Preview" className="w-full h-full object-contain" />
                  ) : (
                    <>
                      <ImagePlus size={32} className="text-primary-foreground/30 mb-2" />
                      <span className="text-primary-foreground/50 text-sm font-serif">点击选择照片</span>
                    </>
                  )}
                </div>
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  ref={fileInputRef} 
                  onChange={handleFileChange}
                />

                <input 
                  type="text" 
                  placeholder="标题（如：初入庄园的瞬间）" 
                  className="w-full bg-[#111] border border-[#333] p-3 text-[#d4c3a3] font-serif focus:outline-none focus:border-[#d4c3a3] transition-colors"
                  value={uploadCaption}
                  onChange={(e) => setUploadCaption(e.target.value)}
                  maxLength={20}
                />
                
                <textarea 
                  placeholder="写下你想说的话..." 
                  className="w-full bg-[#111] border border-[#333] p-3 text-primary-foreground/80 font-serif focus:outline-none focus:border-[#d4c3a3] transition-colors h-24 resize-none"
                  value={uploadDesc}
                  onChange={(e) => setUploadDesc(e.target.value)}
                  maxLength={100}
                />

                <button 
                  onClick={handleUploadSubmit}
                  disabled={!uploadUrl || !uploadCaption.trim() || isSubmitting}
                  className="w-full py-3 bg-[#d4c3a3] text-black font-serif tracking-widest hover:bg-[#e5d5b5] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      正在封存...
                    </>
                  ) : (
                    "封存记忆"
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lightbox Modal (Same as Exhibition) */}
      <AnimatePresence>
        {selectedItem !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 md:p-8 bg-black/95 backdrop-blur-md"
            onClick={() => setSelectedItem(null)}
          >
            <motion.button 
              className="absolute top-4 right-4 md:top-8 md:right-8 text-[#d4c3a3] hover:text-white transition-colors z-[70]"
              onClick={() => setSelectedItem(null)}
            >
              <X size={32} strokeWidth={1} />
            </motion.button>
            
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-6xl max-h-[90vh] flex flex-col md:flex-row gap-0 bg-[#0a0a0a] border border-[#333] shadow-2xl overflow-hidden relative z-[65]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Left: Image */}
              <div className="w-full md:w-3/5 bg-black relative flex items-center justify-center p-4 md:p-8 border-r border-[#222]">
                <img 
                  src={selectedItem.url} 
                  alt={selectedItem.caption}
                  className="max-w-full max-h-[40vh] md:max-h-[80vh] object-contain"
                />
              </div>

              {/* Right: Info & Comments */}
              <div className="w-full md:w-2/5 flex flex-col h-[50vh] md:h-auto">
                <div className="p-6 md:p-8 border-b border-[#222] shrink-0 relative">
                  {selectedItem.author_id === currentPlayerId && (
                    <div className="absolute top-6 right-6 md:top-8 md:right-8 flex gap-3">
                      {!isEditing ? (
                        <>
                          <button onClick={startEditing} className="text-primary-foreground/50 hover:text-[#d4c3a3] transition-colors" title="修改">
                            <Edit2 size={18} />
                          </button>
                          <button onClick={() => handleDeletePost(selectedItem.id)} className="text-primary-foreground/50 hover:text-red-900 transition-colors" title="删除">
                            <Trash2 size={18} />
                          </button>
                        </>
                      ) : (
                        <button onClick={() => setIsEditing(false)} className="text-primary-foreground/50 hover:text-[#d4c3a3] transition-colors" title="取消修改">
                          <X size={18} />
                        </button>
                      )}
                    </div>
                  )}

                  {isEditing ? (
                    <div className="space-y-3 mt-2">
                      <input 
                        type="text" 
                        className="w-full bg-[#111] border border-[#333] p-2 text-xl font-serif text-[#d4c3a3] focus:outline-none focus:border-[#d4c3a3]"
                        value={editCaption}
                        onChange={e => setEditCaption(e.target.value)}
                        maxLength={20}
                      />
                      <textarea 
                        className="w-full bg-[#111] border border-[#333] p-2 text-sm font-serif text-primary-foreground/80 h-20 resize-none focus:outline-none focus:border-[#d4c3a3]"
                        value={editDesc}
                        onChange={e => setEditDesc(e.target.value)}
                        maxLength={100}
                      />
                      <button 
                        onClick={() => handleUpdatePost(selectedItem.id)}
                        disabled={!editCaption.trim() || isUpdating}
                        className="px-4 py-2 bg-[#d4c3a3] text-black font-serif text-sm flex items-center justify-center gap-2 hover:bg-[#e5d5b5] transition-colors disabled:opacity-50"
                      >
                        {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                        保存修改
                      </button>
                    </div>
                  ) : (
                    <>
                      <h4 className="text-2xl md:text-3xl font-serif text-[#d4c3a3] tracking-widest mb-4 pr-16">
                        {selectedItem.caption}
                      </h4>
                      <p className="text-primary-foreground/70 font-serif leading-relaxed italic text-sm md:text-base">
                        "{selectedItem.desc || '（一段无言的记忆）'}"
                      </p>
                    </>
                  )}
                  
                  <div className="flex items-center gap-6 mt-6">
                    <button 
                      onClick={() => handleLike(selectedItem.id)}
                      className="flex items-center gap-2 text-[#d4c3a3] hover:text-white transition-colors group"
                    >
                      <Heart 
                        size={20} 
                        className={cn(
                          "transition-all duration-300 group-active:scale-125",
                          selectedItem.hasLiked ? "fill-[#d4c3a3]" : ""
                        )} 
                      />
                      <span className="font-serif tracking-widest">{selectedItem.likes} 赞</span>
                    </button>
                    <div className="flex items-center gap-2 text-primary-foreground/50">
                      <MessageSquare size={20} />
                      <span className="font-serif tracking-widest">{selectedItem.comments.length} 评论</span>
                    </div>
                  </div>
                </div>

                <div className="flex-grow overflow-y-auto p-6 md:p-8 space-y-6 scrollbar-thin scrollbar-thumb-[#333] scrollbar-track-transparent">
                  {selectedItem.comments.length === 0 ? (
                    <div className="text-center text-primary-foreground/30 font-serif py-8 italic">
                      还没有人留下痕迹...
                    </div>
                  ) : (
                    selectedItem.comments.map((comment) => (
                      <div key={comment.id} className="border-b border-[#222] pb-4 last:border-0">
                        <p className="text-primary-foreground/80 font-serif text-sm leading-relaxed mb-2">
                          {comment.text}
                        </p>
                        <span className="text-xs text-primary-foreground/40 font-serif">
                          {comment.date}
                        </span>
                      </div>
                    ))
                  )}
                </div>

                <div className="p-4 md:p-6 border-t border-[#222] shrink-0 bg-[#111]">
                  <div className="flex gap-3">
                    <input 
                      type="text" 
                      placeholder="留下你的评论..." 
                      className="flex-grow bg-[#0a0a0a] border border-[#333] px-4 py-2 text-sm text-[#d4c3a3] font-serif focus:outline-none focus:border-[#d4c3a3] transition-colors"
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleAddComment(selectedItem.id);
                        }
                      }}
                    />
                    <button 
                      onClick={() => handleAddComment(selectedItem.id)}
                      disabled={!commentText.trim() || isCommenting}
                      className="px-6 py-2 bg-[#d4c3a3] text-black font-serif text-sm tracking-widest hover:bg-[#e5d5b5] transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap flex items-center justify-center min-w-[80px]"
                    >
                      {isCommenting ? <Loader2 className="w-4 h-4 animate-spin" /> : "发送"}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}