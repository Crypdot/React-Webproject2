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
import ImageForm from './ImageForm';
import LoginModal from './LoginModal';
import SignupModal from './SignupModal';
import NavBar from './NavBar';
import './Home.css'

const Home = () => {

 // const [showLogin, setShowLogin] = useState(false)
//  const [showSign, setSign] = useState(false)

  const [images, setImages] = useState([]);
  const [show, setShow] = useState(false);
//  const [uploadShow, setUploadShow] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentData, setCommentdata] = useState([]);
  const [testID, setTestID] = useState([]);

  const handleClose = () => setShow(false);

  useEffect((postID, commentdata) => {
    console.log("Kuvatt testi");
    axios.get('http://localhost:8081/images')
        .then(function (res) {
          console.log("RES DATA ===> "+res.data);
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



  console.log(images);
  // console.log(images[4].ID)
  return (

      <div className="container">

        <div className="Images">
          <Table >
            <tbody>{images.map((image, i) => {
              return [
                <tr key={image.id}>
                  <td>
                    <p id="ImageTitle">{image.title}</p>
                    <img src={require(`../Images/${image.imagelink}`)} alt={image.title}/>
                    <p id="ImageDescription">{image.description}</p>
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

