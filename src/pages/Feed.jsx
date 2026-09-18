import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Ellipsis, MessageCircle, Trash, SendHorizontal } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

function Feed() {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState("");
  const [editingPostId, setEditingPostId] = useState(null);
  const [editedContent, setEditedContent] = useState("");
  const [sortOrder, setSortOrder] = useState("old");
  const [commentPostId, setCommentPostId] = useState(null);
  const [newComment, setNewComment] = useState("");
  const [user, setUser] = useState(null);
  /*async function fetchPosts() {
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .order("id", { ascending: sortOrder === "old" });
    if (error) {
      console.log("error:", error);
    }
    if (data) {
      console.log("data:", data);
      setPosts(data);
    }
  }*/
  async function fetchPosts() {
    const { data, error } = await supabase
      .from("posts")
      .select(
        `
        id,
        content,
        profiles(
            username,
            bio
        ),
        comments(
            content,
            id,
            user_id,
            profiles(
                username
            )
        )
            
        `,
      )
      .order("id", { ascending: sortOrder === "old" });

    if (error) {
      console.log("error:", error);
    }
    if (data) {
      console.log("data:", data);
      setPosts(data);
    }
  }
  useEffect(() => {
    supabase.auth.getUser().then(({ data, error }) => {
      if (error) {
        console.error("Error fetching user:", error);
      } else {
        setUser(data.user);
        //     console.log("User fetched successfully:", data.user);
      }
    });
    fetchPosts();
  }, []);
  useEffect(() => {
    fetchPosts();
  }, [sortOrder]);

  async function addPost() {
    console.log("ADD POST:", JSON.stringify(newPost));
    if (!newPost.trim()) {
      return;
    }
    if (!user) {
      console.log("error: No user found");
      return;
    }
    const { error } = await supabase.from("posts").insert({
      content: newPost,
      user_id: user.id,
    });
    if (error) {
      console.log("error:", error);
    } else {
      fetchPosts();
      setNewPost("");

    }
  }
  async function updatePost() {
    const { error } = await supabase
      .from("posts")
      .update({ content: editedContent })
      .eq("id", editingPostId);
    if (error) {
      console.log("error:", error);
    } else {
      fetchPosts();
      setEditingPostId(null);
      setEditedContent("");
    }
  }
  async function deletePost(postId) {
    const { error } = await supabase.from("posts").delete().eq("id", postId);
    if (error) {
      console.log("error:", error);
    } else {
      fetchPosts();
    }
  }

  async function addComment(postId) {
    if (!newComment.trim()) {
      return;
    }
    if (!user) {
      return;
    }
    const { error } = await supabase.from("comments").insert({
      content: newComment,
      post_id: postId,
      user_id: user.id,
    });
    if (error) {
      console.log("error:", error);
    } else {
      setNewComment("");
      setCommentPostId(null);
      fetchPosts();
    }
  }
  async function deleteComment(commentId) {
    const { error } = await supabase
      .from("comments")
      .delete()
      .eq("id", commentId);
    if (error) {
      console.log("error:", error);
    } else {
      fetchPosts();
    }
  }

  async function addLike(postId) {
    if (!user) return;

    if (user) {
      const { error } = await supabase.from("likes").insert({
        post_id: postId,
        user_id: user.id,
      });
      if (error) {
        console.log("error:", error);
      } else {
        console.log("Like added successfully", postId, user.id);
        fetchPosts();
      }
    }
  }

  return (
    <main className="min-h-svh bg-background text-left text-foreground">
      <div className="sticky top-0 z-10 border-b border-border bg-background/95 px-4 py-3 backdrop-blur">
        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          <option value="new">Newest</option>
          <option value="old">Oldest</option>
        </select>
      </div>
      <div className="divide-y divide-border">
        {posts.map((post) => (
          <Card
            key={post.id}
            className="gap-0 rounded-none bg-background py-4 shadow-none ring-0 transition-colors hover:bg-muted/30"
          >
            <CardContent className="px-4">
              {editingPostId === post.id ? (
                <div className="flex gap-3">
                  <Avatar className="size-10">
                    <AvatarFallback>
                      {post.profiles?.username?.charAt(0)?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1 space-y-3">
                    <Input
                      value={editedContent}
                      onChange={(e) => setEditedContent(e.target.value)}
                      className="h-10 bg-background"
                    />
                    <Button onClick={updatePost}>Save</Button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-3">
                  <Avatar className="size-10">
                    <AvatarFallback>
                      {post.profiles?.username?.charAt(0)?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-x-1.5 text-sm leading-5">
                          <span className="font-semibold text-foreground">
                            {post.profiles?.bio ||
                              post.profiles?.username ||
                              "Kullanıcı"}
                          </span>
                          <span className="text-muted-foreground">
                            @{post.profiles?.username || "username"}
                          </span>
                          <span className="text-muted-foreground">·</span>
                          <span className="text-muted-foreground">şimdi</span>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-sm"
                              className="shrink-0 text-muted-foreground hover:text-foreground"
                              aria-label="Post seçenekleri"
                            />
                          }
                        >
                          <Ellipsis className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-32">
                          <DropdownMenuItem
                            onClick={() => {
                              setEditingPostId(post.id);
                              setEditedContent(post.content);
                            }}
                          >
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => deletePost(post.id)}
                          >
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <p className="mt-2 whitespace-pre-wrap break-words text-[15px] leading-6 text-foreground">
                      {post.content}
                    </p>
                    <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                      <MessageCircle className="h-4 w-4" />
                      <span>Yorumlar</span>
                    </div>
                    <div className="mt-3 border-t border-border pt-3">
                      <div>
                        {post.comments.map((comment) => (
                          <div
                            key={comment.id}
                            className="flex items-center justify-between gap-2"
                          >
                            <p
                              key={comment.id}
                              className="text-sm text-muted-foreground"
                            >
                              {comment.content} - by:{" "}
                              {comment.profiles?.username || "Unknown"}
                            </p>
                            {comment.user_id === user?.id && (
                              <Trash
                                className="h-4 w-4 text-muted-foreground hover:text-red-500 cursor-pointer"
                                onClick={() => deleteComment(comment.id)}
                              />
                            )}
                          </div>
                        ))}
                      </div>
                      <div className="relative">
                        <Input
                          onFocus={() => setCommentPostId(post.id)}
                          value={commentPostId === post.id ? newComment : ""}
                          onChange={(e) => {
                            setCommentPostId(post.id);
                            setNewComment(e.target.value);
                          }}
                          placeholder="Yorum yaz..."
                          type="text"
                          className="min-h-10 resize-none border-border bg-muted/20 pr-12 shadow-none"
                        />
                        <Button
                          onClick={() => addComment(post.id)}
                          className="absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center bg-black text-white"
                        >
                          <SendHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="border-t border-border p-4">
        <Input
          type="text"
          value={newPost}
          onChange={(e) => setNewPost(e.target.value)}
          className="h-10 bg-background"
        />
        <Button onClick={addPost} className="mt-3">
          Add Post
        </Button>
      </div>
    </main>
  );
}

export default Feed;
