import React, { useState } from 'react'
import { usePathStore } from '../../stores/pathStore'
import { useAuthStore } from '../../stores/authStore'
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card'
import { Button } from '../ui/Button'
import { Input, Textarea } from '../ui/Input'
import { Badge } from '../ui/Badge'
import { MessageCircle, Send, User, Clock } from 'lucide-react'

export const CommunityForum = () => {
  const { user } = useAuthStore()
  const { forumPosts, createForumPost, addComment, paths } = usePathStore()
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    pathId: ''
  })
  const [showNewPost, setShowNewPost] = useState(false)
  const [newComment, setNewComment] = useState({})

  const handleCreatePost = (e) => {
    e.preventDefault()
    if (newPost.title.trim() && newPost.content.trim()) {
      createForumPost({
        ...newPost,
        userId: user.userId,
        username: user.username
      })
      setNewPost({ title: '', content: '', pathId: '' })
      setShowNewPost(false)
    }
  }

  const handleAddComment = (postId) => {
    const comment = newComment[postId]
    if (comment?.trim()) {
      addComment(postId, {
        content: comment,
        userId: user.userId,
        username: user.username
      })
      setNewComment(prev => ({ ...prev, [postId]: '' }))
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString()
  }

  const getPathTitle = (pathId) => {
    const path = paths.find(p => p.pathId === pathId)
    return path?.title || 'General Discussion'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="heading1 text-text-primary">Community Forum</h1>
        <Button onClick={() => setShowNewPost(!showNewPost)}>
          {showNewPost ? 'Cancel' : 'New Post'}
        </Button>
      </div>

      {showNewPost && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Post</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreatePost} className="space-y-4">
              <div>
                <label className="block caption text-text-secondary mb-2">
                  Learning Path (Optional)
                </label>
                <select
                  value={newPost.pathId}
                  onChange={(e) => setNewPost(prev => ({ ...prev, pathId: e.target.value }))}
                  className="flex h-10 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <option value="">General Discussion</option>
                  {paths.map(path => (
                    <option key={path.pathId} value={path.pathId}>
                      {path.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block caption text-text-secondary mb-2">
                  Title
                </label>
                <Input
                  value={newPost.title}
                  onChange={(e) => setNewPost(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="What's your question or topic?"
                  required
                />
              </div>

              <div>
                <label className="block caption text-text-secondary mb-2">
                  Content
                </label>
                <Textarea
                  value={newPost.content}
                  onChange={(e) => setNewPost(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Provide more details..."
                  rows={4}
                  required
                />
              </div>

              <Button type="submit">Create Post</Button>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {forumPosts.map((post) => (
          <Card key={post.postId}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg mb-2">{post.title}</CardTitle>
                  <div className="flex items-center space-x-4 text-text-secondary">
                    <div className="flex items-center space-x-1">
                      <User className="h-4 w-4" />
                      <span className="caption">{post.username}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span className="caption">{formatDate(post.createdAt)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MessageCircle className="h-4 w-4" />
                      <span className="caption">{post.comments?.length || 0} replies</span>
                    </div>
                  </div>
                  {post.pathId && (
                    <Badge variant="secondary" className="mt-2">
                      {getPathTitle(post.pathId)}
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <p className="body text-text-primary">{post.content}</p>

              {/* Comments Section */}
              {post.comments && post.comments.length > 0 && (
                <div className="space-y-3 pl-4 border-l-2 border-border">
                  {post.comments.map((comment) => (
                    <div key={comment.commentId} className="space-y-2">
                      <div className="flex items-center space-x-2 text-text-secondary">
                        <User className="h-3 w-3" />
                        <span className="text-xs">{comment.username}</span>
                        <span className="text-xs">{formatDate(comment.createdAt)}</span>
                      </div>
                      <p className="caption text-text-primary">{comment.content}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Add Comment */}
              <div className="flex items-center space-x-2">
                <Input
                  value={newComment[post.postId] || ''}
                  onChange={(e) => setNewComment(prev => ({ 
                    ...prev, 
                    [post.postId]: e.target.value 
                  }))}
                  placeholder="Add a reply..."
                  className="flex-1"
                />
                <Button 
                  size="sm"
                  onClick={() => handleAddComment(post.postId)}
                  disabled={!newComment[post.postId]?.trim()}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {forumPosts.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <MessageCircle className="h-12 w-12 text-text-secondary mx-auto mb-4" />
              <p className="text-text-secondary">No forum posts yet. Start the conversation!</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}