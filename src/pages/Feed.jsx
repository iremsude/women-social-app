import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

function Feed() {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState("");
  const [editingPostId, setEditingPostId] = useState(null);
  const [editedContent, setEditedContent] = useState("");
  const [sortOrder, setSortOrder] = useState("old");
  async function fetchPosts() {
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
    <>
      <div>
        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
        >
          <option value="new">Newest</option>
          <option value="old">Oldest</option>
        </select>
      </div>
      <div>
        {posts.map((post) => (
          <div key={post.id} className="flex items-center gap-4">
            {editingPostId === post.id ? (
              <div>
                <input
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                />
                <button onClick={updatePost}>Save</button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <p>{post.content}</p>
                <button
                  onClick={() => {
                    setEditingPostId(post.id);
                    setEditedContent(post.content);
                  }}
                >
                  Edit
                </button>
              </div>
            )}
            <button onClick={() => deletePost(post.id)}>Delete</button>
          </div>
        ))}
      </div>
      <div>
        <input
          type="text"
          value={newPost}
          onChange={(e) => setNewPost(e.target.value)}
        ></input>
        <button onClick={addPost}>Add Post</button>
      </div>
    </>
  );
}

export default Feed;
