import React, {useState} from 'react';
import axios from "axios";
import {Button, Form, InputGroup} from 'react-bootstrap';


const Home = () => {
  const [title, setTitle] = useState('')
  const [file, setFile] = useState()
  const [description, setDescription] = useState('')



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

    const handleSubmit = (event) => {
    const form = event.currentTarget;
    if(form.checkValidity() === false) {
      event.preventDefault();
      event.stopPropagation();
    }

    addImage(file, title, description);
    }
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


      </div>
  )

}
export default Home