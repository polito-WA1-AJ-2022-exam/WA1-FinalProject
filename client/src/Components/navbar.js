// eslint-disable-next-line
import 'bootstrap/dist/css/bootstrap.min.css';
import {Container} from 'react-bootstrap';
import Navbar from 'react-bootstrap/Navbar';
import { useNavigate } from "react-router-dom";
import { ImBooks } from "react-icons/im";
import API from "../API/API";
// import {BiLogOutCircle} from "react-icons/bi";

function MyNavBar(props){
    return (
        <Container className='p-0' fluid>
            <Navbar expand="xxl" variant="light" bg="warning">
                <Container className='m-0 mw-100'>
                    <Navbar.Brand expand="xxl"><ImBooks/><b>Your Study Plan</b></Navbar.Brand>
                    {!props.loggedIn ? <LoginIcon modalShow={props.modalShow} setModalShow={props.setModalShow}/> : <LogoutIcon getCourses={props.getCourses} setLoggedIn={props.setLoggedIn}/> }
                </Container>
            </Navbar>
        </Container>
    );
}

function LoginIcon(props){
    const navigate = useNavigate();
    
    return <button className="btn btn-sm btn-link bg-transparent" onClick={() => {navigate("/login"); props.setModalShow(true)}}><svg stroke="black" fill="none" strokeWidth="0" viewBox="0 0 24 24" height="30" width="30" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg></button>
}

function LogoutIcon(props){
    const navigate = useNavigate();
    return <button className="btn btn-sm btn-link bg-transparent" onClick={() => {try {
        API.logOut();
        props.getCourses();
    } catch (error) {
        
    } 
    props.setLoggedIn(false); navigate("/");}}><svg stroke="currentColor" fill="black" strokeWidth="0" viewBox="0 0 24 24" height="30" width="30" xmlns="http://www.w3.org/2000/svg"><path d="m2 12 5 4v-3h9v-2H7V8z"></path><path d="M13.001 2.999a8.938 8.938 0 0 0-6.364 2.637L8.051 7.05c1.322-1.322 3.08-2.051 4.95-2.051s3.628.729 4.95 2.051 2.051 3.08 2.051 4.95-.729 3.628-2.051 4.95-3.08 2.051-4.95 2.051-3.628-.729-4.95-2.051l-1.414 1.414c1.699 1.7 3.959 2.637 6.364 2.637s4.665-.937 6.364-2.637c1.7-1.699 2.637-3.959 2.637-6.364s-.937-4.665-2.637-6.364a8.938 8.938 0 0 0-6.364-2.637z"></path></svg></button>
}

export {MyNavBar};