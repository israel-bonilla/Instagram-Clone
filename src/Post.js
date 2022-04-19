import "./Post.css";
import { Avatar } from "@material-ui/core";
import { useState, useEffect } from 'react';
import { db } from "./firebase";
import firebase from 'firebase';

const Post = ({ postId, user, username, caption, imageUrl}) => {
    const [comments, setComments] = useState([]);
    const [comment, setComment] = useState('');

    useEffect(() => {
        let unsubscribe;
        if(postId) {
            unsubscribe = db
              .collection('posts')
              .doc(postId)
              .collection('comments')
              .orderBy('timestamp', 'desc')
              .onSnapshot(snapshot => {
                setComments(snapshot.docs.map(doc => doc.data()))
              });
        }

        return () => {
            unsubscribe();
        };
    }, [postId]);

    const postComment = (event) => {
        event.preventDefault();

        db.collection('posts')
          .doc(postId)
          .collection('comments')
          .add({
              text: comment,
              username: user.displayName,
              timestamp: firebase.firestore.FieldValue.serverTimestamp()
          });

        setComment('');
    }

    return (
        <div className="post">
            <div className="post__header">
                <Avatar className="post__avatar" alt={username.toUpperCase()} src="/static/iamges/avatar/1.jpg" style={{color: 'black', backgroundColor: 'rgb(0, 255, 13)'}} />
                <h3 style={{color: 'yellow'}}>{username}</h3>
            </div>

            <img className="post__image" src={imageUrl} alt="" />

            {caption && <h4 className="post__caption"><strong style={{color: 'yellow'}}>{username}</strong> {caption}</h4>}

            <div className="post__comments">
                {
                    comments.length > 0 ?
                    comments.map(comment => (
                        <p>
                            <span style={{color: 'gray'}}>&gt;</span>{' '}
                            <strong style={{color: 'yellow'}}>{comment.username}</strong> {comment.text}
                        </p>
                    )) : (
                        <p style={{color: "gray", fontSize: "15px"}}>No comments.</p>
                    )
                }
            </div>
            
            {user && (
                <form className="post__commentForm">
                    <input
                        className="post__commentInput"
                        type="text"
                        placeholder="Add a comment..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                    />
                    <button
                        className="post__commentButton"
                        type="submit"
                        onClick={postComment}
                        disabled={!comment}
                    >
                        Post
                    </button>
                </form>
            )}
        </div>
    )
}

export default Post
