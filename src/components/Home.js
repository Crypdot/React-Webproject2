import React, {useEffect, useState} from 'react';
import axios from "axios";
import {
  Button,
  Form,
  FormText,
  InputGroup,
  Modal,
  Table,
} from 'react-bootstrap';
import Comments from './Comments';


const Home = () => {
  const [title, setTitle] = useState('');
  const [file, setFile] = useState();
  const [description, setDescription] = useState('');
  const [images, setImages] = useState([]);
  const [show, setShow] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentData, setCommentdata] = useState([]);
  const [testID, setTestID] = useState([]);

  const handleClose = () => setShow(false);



  const addImage = async (file, title, description) => {

    console.log(title, file, description)
    console.log(file[0])
    /*
      await fetch('http://localhost:8081/upload', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          file: file,
          postTitle: title,
          postDescription: description,
        })
      })
          .then(res => res.json())

  */
    const formData = new FormData();
    formData.append('file', file[0]);
    formData.append('postTitle', title);
    formData.append('postDescription', description);
    /*
                const dataToSend = {
                   file: file[0],
                   postTitle: title,
                   postDescription: description,
                }
    */
    //console.log(formData.get('file'));
    // console.log(formData.get('postTitle'))

    axios.post('http://localhost:8081/upload', formData )

        .then(function(response) {
          console.log(response)
        })

        .catch(function(error) {
          console.log(error)
        })

  }


  useEffect((postID, commentdata) => {
    console.log("Kuvatt testi");
    axios.get('http://localhost:8081/images')
        .then(function (res) {
          console.log(res.data);
          const imageData = res.data;
          setImages(imageData);
        })


  }, [])

  const getComments = (postID) => {
    console.log("testi");
    console.log(postID);
    setTestID(postID);
    axios.get('http://localhost:8081/comments', {
      params: {
        postID: postID
      }})
        .then(function (res) {
          console.log(res.data);
          const commentsData = res.data;
          setComments(commentsData);
        })


  }
  /*
    const addComment = (postID, commentData) => {
      console.log("testi");

      axios.post('http://localhost:8081/addcomment?postID='+postID+"&commentField="+commentData)
          .then(function (res) {
            console.log("This"+res.data);

          })


    }
    const handleCommentSubmit = (event) => {
      const form = event.currentTarget;
      console.log("here");
      if (form.checkValidity() === false) {
        event.preventDefault();
        event.stopPropagation();
      }
      addComment(testID, commentData);
    }
  */

  const handleSubmit = (event) => {
    const form = event.currentTarget;
    if(form.checkValidity() === false) {
      event.preventDefault();
      event.stopPropagation();
    }

    addImage(file, title, description);
  }

  console.log(images);
  // console.log(images[4].ID)
  return (
      <div className="container">
        <Form encType="multipart/form-data" onSubmit={handleSubmit} >
          <Form.Group>
            <Form.Label>Title:</Form.Label>

            <Form.Control
                type="text"
                value={title}
                onChange={(e => setTitle(e.target.value))}
                required/>
            <br/>
          </Form.Group>
          <Form.Label>Load file:</Form.Label>
          <Form.Group>
            <Form.Control
                type="file"
                //value={file}
                name="file"
                onChange={(e => setFile(e.target.files))}
                required/>
          </Form.Group>
          <Form.Label>Paikka:</Form.Label>
          <Form.Group>
            <Form.Control
                type="text"
                value={description}
                onChange={(e => setDescription(e.target.value))}
                required/>
            <br/>
          </Form.Group>

          <Button type="submit">Send</Button>




        </Form>
        <div>
          <Table >
            <tbody>{images.map((image, i) => {
              return [
                <tr key={image.id}>
                  <td>
                    <img src={""+image.imagelink} alt={image.title}/>
                    <p>{image.description}</p>
                    <Button onClick={() => {setShow(true); getComments(image.ID) }}>Show comments {image.ID}</Button>

                  </td>
                </tr>
              ];
            })}
            </tbody>
          </Table>
        </div>

        <Comments title="Comments" postID={testID} onClose={() => setShow(false)} show={show}>
          <tr>
            <th>Date</th>
            <th>Comment</th>
          </tr>
          {comments.map((comment) => {
            return [
              <tr key={comment.id}>
                <td>{comment.time} : -></td>
                <td>{comment.commentdata}</td>
              </tr>

            ]
          })}

        </Comments>
      </div>
  )

}
export default Home

