import { useState } from "react";
import { Modal, Button, Form, Alert } from "react-bootstrap";
import { useNavigate } from "react-router";
import API from "../../API/API";

function LoginForm(props){
  const [username, setUsername] = useState("axel@studenti.polito.it");
  const [pw, setPw] = useState("calimero32");
  const [loginError, setLoginError] = useState("");
  const navigate = useNavigate();

  const onSub = async (event) => {
    event.preventDefault();
    try {
      await API.logIn({username: username, password: pw});
      props.setLoggedIn(true);
      props.setSomethingToShow(true);
      navigate("/");
    } catch (error) {
      setLoginError(error);
    }
  }
        return (
          <Modal
            show={props.show}
            onHide={props.onHide}
            size="md"
            aria-labelledby="contained-modal-title-vcenter"
            centered
          >
            <Modal.Header closeButton>
              <Modal.Title id="contained-modal-title-vcenter">
                Log-In
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {loginError && <Alert variant="danger" onClose={() => setLoginError("")} dismissible>
                <Alert.Heading>Ops, You inserted wrong credentials, try again!</Alert.Heading>
              </Alert>}
              <Form id="myform" onSubmit={(event) => onSub(event)}>
                  <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
                      <Form.Label>Username</Form.Label>
                      <Form.Control type="email" placeholder="name@example.com" value={username} onChange={(e) => setUsername(e.target.value)}/>
                  </Form.Group>
                  <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1">
                      <Form.Label>Password</Form.Label>
                      <Form.Control type="password" placeholder="Password" value={pw} onChange={(e) => setPw(e.target.value)}/>
                  </Form.Group>
              </Form> 
            </Modal.Body>
            <Modal.Footer>
              <Button variant="danger" onClick={props.onHide}>Close</Button>
              <Button variant="warning" type="submit" form="myform">
                    Login
              </Button>
            </Modal.Footer>
          </Modal>
        );
}

export {LoginForm};