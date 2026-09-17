import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Ellipsis, MessageCircle } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

function Feed() {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState("");
  const [editingPostId, setEditingPostId] = useState(null);
  const [editedContent, setEditedContent] = useState("");
  const [sortOrder, setSortOrder] = useState("old");
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
    .select(`
        id,
        content,
        profiles(
            username,
            bio
        )`)
              .order("id", { ascending: sortOrder === "old" });

        if (error) {
      console.log("error:", error);
    }
    if (data) {
      console.log("data:", data);
      setPosts(data)
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

  useEffect(() => {
    fetchPosts();
  }, [sortOrder]);

  async function addPost() {
    console.log("ADD POST:", JSON.stringify(newPost));
    if (!newPost.trim()) {
      return;
    }
    const { data, error: userError } = await supabase.auth.getUser()    
    if (userError) {
      console.log("error:", userError);
      return;
    } else if(data.user){
    const { error } = await supabase.from("posts").insert({
      content: newPost,
      user_id: data.user.id,
    });
    if (error) {
      console.log("error:", error);
    } else {
      fetchPosts();
    }
    setNewPost("");
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
          <article
            key={post.id}
            className="rounded-none border-x-0 border-t-0 bg-background px-4 py-4 shadow-none transition-colors hover:bg-muted/30"
          >
            {editingPostId === post.id ? (
              <div className="flex gap-3">
                <Avatar className="size-10">
                  <AvatarFallback>
                    {post.profiles?.username?.charAt(0)?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1 space-y-3">
                  <input
                    value={editedContent}
                    onChange={(e) => setEditedContent(e.target.value)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
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
                    <div className="group relative shrink-0">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        className="text-muted-foreground hover:text-foreground"
                        aria-label="Post seçenekleri"
                      >
                        <Ellipsis className="h-4 w-4" />
                      </Button>
                      <div className="absolute right-0 top-8 z-20 hidden w-32 overflow-hidden rounded-md border border-border bg-popover p-1 text-popover-foreground group-hover:block group-focus-within:block">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start"
                          onClick={() => {
                            setEditingPostId(post.id);
                            setEditedContent(post.content);
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start text-destructive hover:text-destructive"
                          onClick={() => deletePost(post.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                  <p className="mt-2 whitespace-pre-wrap break-words text-[15px] leading-6 text-foreground">
                    {post.content}
                  </p>
                  <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                    <MessageCircle className="h-4 w-4" />
                    <span>Yorumlar</span>
                  </div>
                  <div className="mt-3 border-t border-border pt-3">
                    <Textarea
                      placeholder="Yorum yaz..."
                      disabled
                      className="min-h-10 resize-none border-border bg-muted/20 shadow-none"
                    />
                  </div>
                </div>
              </div>
            )}
          </article>
        ))}
      </div>
      <div className="border-t border-border p-4">
        <input
          type="text"
          value={newPost}
          onChange={(e) => setNewPost(e.target.value)}
          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
        ></input>
        <Button onClick={addPost} className="mt-3">
          Add Post
        </Button>
      </div>
       
    </main>
  );
}

export default Feed;
