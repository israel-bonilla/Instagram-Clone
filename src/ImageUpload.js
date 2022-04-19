import { Button } from "@material-ui/core";
import { useState } from 'react';
import { db, storage } from './firebase';
import firebase from 'firebase';
import './ImageUpload.css';
import AddCircleIcon from '@material-ui/icons/AddCircle';

const ImageUpload = ({ username }) => {
    const [caption, setCaption] = useState('');
    const [image, setImage] = useState(null);
    const [progress, setProgress] = useState(0);
    const [showUpload, setShowUpload] = useState(false);

    const handleChange = e => {
        if(e.target.files[0]) {
            setImage(e.target.files[0]);
        }
    }
    
    const handleUpload = () => {
        const uploadTask = storage.ref(`images/${image.name}`).put(image);

        uploadTask.on(
            "state_changed",
            (snapshot) => {
                const progress = Math.round(
                    (snapshot.bytesTransferred / snapshot.totalBytes) * 100
                );
                setProgress(progress);
            },
            (error) => {
                console.log(error);
                alert(error.message);
            },
            () => {
                storage
                  .ref('images')
                  .child(image.name)
                  .getDownloadURL()
                  .then(url => {
                      db.collection('posts').add({
                          timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                          caption: caption,
                          imageUrl: url,
                          username: username
                      });
                      setProgress(0);
                      setCaption('');
                      setImage(null);
                      setShowUpload(false);
                  })
            }
        )
    }

    return (
        <div className="imageUpload__container">
            {showUpload ? (
                <div className="imageUpload">
                    <progress className="imageUpload__progress imageUpload__child" 
                    value={progress} max="100" />
                    <input className="imageUpload__child imageUpload__captionInput" type="text" 
                    placeholder="Enter a caption..." value={caption} 
                    onChange={event => setCaption(event.target.value)} />
                    <input className="imageUpload__fileInput imageUpload__child" type="file" onChange={handleChange} />
                    <div className="imageUpload__buttons">
                        <Button className="imageUpload__cancelButton imageUpload__child" variant="contained" onClick={() => setShowUpload(false)}>Cancel</Button>
                        <Button disabled={!image} className="imageUpload__uploadButton imageUpload__child" variant="contained" color="primary" onClick={handleUpload}>Upload</Button>
                    </div>
                </div>
            ) : (
                <AddCircleIcon className="imageUpload__addIcon"
                onClick={() => setShowUpload(true)} />
            )}
        </div>
    )
}

export default ImageUpload;
