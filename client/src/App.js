//import 'bootstrap/dist/css/bootstrap.min.css';
import {Container} from 'react-bootstrap';
// import { MyNavBar } from './Components/navbar';
import API from './API/API';
import {BrowserRouter, Routes, Route, Navigate} from "react-router-dom";
import { CoursesRoute, DefaultRoute, LoginRoute, StudyPlanRoute } from './Components/Routes/routes';
import { useState } from 'react';
import './App.css';
import { useEffect } from 'react';

function App() {
  const [courses, setCourses] = useState([]);
  const [modalShow, setModalShow] = useState(false); //This is used to show the login modal
  const [loggedIn, setLoggedIn] = useState(false); //Need to be changed to false whene login is implemented
  const [somethingToShow, setSomethingToShow] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  const getCourses = async () => {
    try {
      const courses = await API.loadCourseList("/courses");
      setCourses(courses.courseList);
    } catch (error) {
      setErrorMessage(error);
    }
  }

  useEffect( () => {
    async function f(){
      try {
        await API.getUserInfo();
        setLoggedIn(true);
      } catch (error) {

      }
    }
    getCourses();
    f();
  }, []);

  return (
    <Container fluid className='App'>
      <BrowserRouter>
        <Routes>
          <Route path='/login' element={loggedIn ? <Navigate replace to='/' /> : <LoginRoute setSomethingToShow={setSomethingToShow} somethingToShow={somethingToShow} loggedIn={loggedIn} setLoggedIn={setLoggedIn} courses={courses} setCourses={setCourses} modalShow={modalShow} setModalShow={setModalShow}/*login={handleLogin}*/ />} /> {/*This should trigger on clicking on the login button opening a modal, but if you are logged in you can't open the modal anymore, you can just logout */}
          <Route path='/' element={!loggedIn ? <CoursesRoute err={errorMessage} setErr={setErrorMessage} loggedIn={loggedIn} setLoggedIn={setLoggedIn} getCourses={getCourses} courses={courses} setCourses={setCourses} modalShow={modalShow} setModalShow={setModalShow}/> : <StudyPlanRoute getCourses={getCourses} err={errorMessage} setSomethingToShow={setSomethingToShow} somethingToShow={somethingToShow} loggedIn={loggedIn} setLoggedIn={setLoggedIn} courses={courses} setCourses={setCourses}/>}/> {/*The idea is: if you are not logged in you can see only the courses, otherwise you can see studyplan which contains also courses */}
          <Route path='*' element={ <DefaultRoute loggedIn={loggedIn} setLoggedIn={setLoggedIn}/> } />
        </Routes>
      </BrowserRouter>
    </Container>
  );
}

export default App;
