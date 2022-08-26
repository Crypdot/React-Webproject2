import {Button, Form} from 'react-bootstrap';
import React, {useState} from 'react';
import axios from 'axios';

import "./Comments.css";
import {CSSTransition} from 'react-transition-group';

const ImageForm = (props)  =>{

  const [title, setTitle] = useState('');
  const [file, setFile] = useState();
  const [description, setDescription] = useState('');

  const addImage = async (file, title, description) => {


    console.log(title, file, description)
    console.log(file[0])
    const formData = new FormData();
    formData.append('dataFile', file[0]);
    formData.append('postTitle', title);
    formData.append('postDescription', description);
    let tokenString, tokenObj, tokenKey = 'myToken'
    tokenString = localStorage.getItem(tokenKey)

    tokenObj = JSON.parse(tokenString)
    console.log("This was the token object -> "+tokenObj)

    console.log("tokenObj.accessToken: "+tokenObj.accessToken)

    axios.post('http://localhost:8081/upload-file', formData,
        {headers: {Authorization: 'Bearer: '+tokenObj.accessToken}})


        .then(function(response) {
          console.log(response)
        })

        .catch(function(error) {
          console.log(error)
        })

  }

  const handleSubmit = (event) => {
    const form = event.currentTarget;
    if(form.checkValidity() === false) {
      event.preventDefault();
      event.stopPropagation();
    }

    addImage(file, title, description).then(r => console.log("Test"));
  }

  return (
      <CSSTransition
          in={props.show}
          unmountOnExit
          timeout={{ enter: 0, exit: 300 }}
      >
      <div className="modal" >
        <div className="modal-content">
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
                  name="dataFile"
                  onChange={(e => setFile(e.target.files))}
                  required/>
            </Form.Group>
            <Form.Label>Description:</Form.Label>
            <Form.Group>
              <Form.Control
                  type="text"
                  value={description}
                  onChange={(e => setDescription(e.target.value))}
                  required/>
              <br/>
            </Form.Group>

            <Button type="submit">Send</Button>
            <Button onClick={props.onClose}>Close</Button>
          </Form>
        </div>

      </div>
      </CSSTransition>
  )

}

export default ImageForm