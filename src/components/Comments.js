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
import "./Comments.css";
import ReactDOM from "react-dom";
import { CSSTransition } from "react-transition-group";




const Comments = (props) => {



  const closeOnEscapeKeyDown = e => {
    if ((e.charCode || e.keyCode) === 27) {
      props.onClose();
    }
  };
  useEffect(() => {
    document.body.addEventListener("keydown", closeOnEscapeKeyDown);
    return function cleanup() {
      document.body.removeEventListener("keydown", closeOnEscapeKeyDown);
    };
  }, []);

  const [commentData, setCommentdata] = useState([]);
  //const [testID, setTestID] = useState([]);
  const addComment = (postID, commentData) => {

    commentData = {
      postID: postID,
      commentdata: commentData
    }

    console.log("testi");
    let tokenString, tokenObj, tokenKey = 'myToken'
    tokenString = localStorage.getItem(tokenKey)

    if(tokenString==null){
      return
    }

    tokenObj = JSON.parse(tokenString)
    console.log("This was the token object -> "+tokenObj)

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer: '+tokenObj.accessToken
    }
    console.log("tokenObj.accessToken: "+tokenObj.accessToken)



    axios.post('http://localhost:8081/add-comment', commentData, {headers:{Authorization: 'Bearer: '+tokenObj.accessToken}})
        .then(function (res) {
          console.log("This"+res.data);
        })
  }
  const handleCommentSubmit = (event) => {
    const form = event.currentTarget;

    if (form.checkValidity() === false) {
      event.preventDefault();
      event.stopPropagation();
    }
    addComment(props.postID, commentData);
  }

  return ReactDOM.createPortal(
      <CSSTransition
          in={props.show}
          unmountOnExit
          timeout={{ enter: 0, exit: 300 }}
      >
        <div className="modal" onClick={props.onClose}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h4 className="modal-title">{props.title}: {props.postID}</h4>
            </div>
            <div className="modal-body">
              {props.children}

            </div>
            <div className="modal-footer">
              <Form onSubmit={handleCommentSubmit} >Add comment
                <Form.Group >
                  <Form.Control type="text" value={commentData} onChange={(e => setCommentdata(e.target.value))}></Form.Control>
                  <Button size="sm" type="submit">Add</Button>
                </Form.Group></Form>

              <button className="button" onClick={props.onClose}>Close</button>
            </div>
          </div>

        </div>
      </CSSTransition>,
      document.getElementById("root")
  );

}
export default Comments