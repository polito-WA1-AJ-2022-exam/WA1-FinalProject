import { Row, Col, Button, Alert } from 'react-bootstrap';
import { CoursesTable } from '../courses';
import { LoginForm } from '../Authentication/login';
import { MyNavBar } from '../navbar';
import { useState, useEffect } from 'react';
import API from '../../API/API';
import { StudyPlanTable, StudyPlanForm } from '../studyplan';
import { problem } from '../../API/Course';
import { Course } from '../../API/Course';


function DefaultRoute(props) {
  return(
    <>
      <Row xxl={12} className="p-0">
        <Col xxl={12} className="p-0">
          <MyNavBar loggedIn={props.loggedIn} setLoggedIn={props.setLoggedIn}/>
        </Col>
      </Row>
      <Row>
        <Col>
          <h1>Nothing here...</h1>
          <p>This is not the route you are looking for!</p>
        </Col>
      </Row>
    </>
  );
}

function CoursesRoute(props) {
  return(
    <>
      <Row xxl={12} className="p-0">
          <Col xxl={12} className="p-0">
            <MyNavBar getCourses={props.getCourses} modalShow={props.modalShow} setModalShow={props.setModalShow} loggedIn={props.loggedIn} setLoggedIn={props.setLoggedIn}/>
          </Col>
      </Row>
      <Row>
      {
      props.err &&
        <Row>
          <Col>
           <Alert style={{"marginLeft" : "12.5%", "marginRight" : "12.5%", "marginTop" : "30px"}} variant="danger" onClose={() => props.setErr("")} dismissible>
                <Alert.Heading>Ops! Something went wrong.</Alert.Heading>
                <p>
                  {props.err.message}
                </p>
              </Alert>
          </Col>
        </Row>}
      {props.loggedIn && props.somethingToShow &&
        <Row>
          <Col>
           <Alert style={{"marginLeft" : "12.5%", "marginRight" : "12.5%", "marginTop" : "30px"}} variant="success" onClose={() => props.setSomethingToShow(false)} dismissible>
                <Alert.Heading>Hi! You just logged.</Alert.Heading>
                <p>
                  Scroll down to see Study Plan.
                </p>
              </Alert>
          </Col>
        </Row>}
        <Row className='mb-2'>
          <Col>
            <h1>Course List</h1>
          </Col>
        </Row>
        <Row className='justify-content-center'>
          <Col className=''>
            <CoursesTable updateSPAndChecks={props.updateSPAndChecks} editMode={props.editMode} setEditMode={props.setEditMode} courses={props.courses} setCourses={props.setCourses} studyPlan={props.studyPlan} setStudyPlan={props.setStudyPlan}/>
          </Col>
        </Row>
      </Row>
    </>
    
  );
}

function LoginRoute(props) {
  return(
    <>
      <CoursesRoute modalShow={props.modalShow} setModalShow={props.setModalShow} courses={props.courses} setCourses={props.setCourses}/>
      <LoginForm setSomethingToShow={props.setSomethingToShow} setLoggedIn={props.setLoggedIn} show={props.modalShow} onHide={() => props.setModalShow(false)}/>
    </>
  );
}

function StudyPlanRoute(props){
  const [studyPlan, setStudyPlan] = useState([]); //This is a state made up of an array filled with studyPlan retrieved from db 
  const [editMode, setEditMode] = useState(false); //This state is used to enter in edit mode aand delete courses from db
  const [SPFormShow, setSPFormShow] = useState(false); //This state tis used to whow the form to create a Study Plan
  const [checked, setChecked] = useState(false);
  const [err, setErr] = useState({errType: "", state: false});

  const getStudyPlan = async () => {
    let newStudyPlan = [];
    let control = false;
    try {
      const sp = await API.loadCourseList('/sp');
      if(sp.f !== -1){
        setChecked(sp.f);
      }
      sp.courseList.forEach((course) => {
        if(course.hasPrerequisite()){
          const modifyCourse = sp.courseList.find((c) => c.code === course.pre);
          const studyPlanFiltered = sp.courseList.filter((c) => c.code !== course.pre);
          modifyCourse.addProblem("This course is a prerequisite for: " + course.name + " (" + course.code + "). First remove it.");
          newStudyPlan = [...studyPlanFiltered].concat(modifyCourse).sort((a, b) => {return (a.name + '').localeCompare(b.name + '')});
          control = true;
        }
      })
      if(control){
        setStudyPlan(newStudyPlan);
      }else{
        setStudyPlan(sp.courseList);
      }
    } catch (error) {
      setErr({errType: error.message, state: true});
    }
  }

  //Function which clean-up all the problems of the courses
  function cleanUpCourses(){
    let cleanedCourses = [];
    props.courses.forEach(course => { 
      course.removeProblem(); 
      cleanedCourses.push(course);
    });
    props.setCourses([...cleanedCourses]);
  }

  /*For each course in the table checks if its incompatibilities are present inside the study plan, 
  in that case that row cannot be added and the problem is shown*/
  function findIncomp(newStudyPlan){
    let changed = [];
    props.courses.forEach(course => {  
      let inc = newStudyPlan.filter((spCourse) => {
        if(course.inc_courses.includes(spCourse.code))
          return true
        else return false
      });
      if(inc.length !== 0){
        let string = '';
        inc.forEach(c => string = string + c.code + ' ');
        course.addProblem(problem["Incompatible"] + string);
        changed.push(course);
      }});
    if(changed.length !== 0){
      let c = props.courses.filter((course) => {
          if(changed.includes(course))
            return false
          else return true
        });
      c.concat(changed);
      c.sort((a, b) => {return (a.name + '').localeCompare(b.name + '')});
      props.setCourses([...c])
    }
  }

  //Function which checks if the course is already added
  function findAlreadyAdded(newStudyPlan){    
    let coursesFiltered;
    coursesFiltered = props.courses.filter((course) => {
      if(newStudyPlan.find((c) => c.code === course.code))
        return false
      else return true;
    });

    props.courses.forEach((course) => {
      if(newStudyPlan.find((c) => c.code === course.code)){;
        course.addProblem(problem["Already"])
        coursesFiltered.push(course);
      }        
    })
    coursesFiltered.sort((a, b) => {return (a.name + '').localeCompare(b.name + '')});

    props.setCourses([...coursesFiltered]);
  }

  //Function which checks if the course has any prerequisite
  function findPrereq(newStudyPlan){
    let changed = [];
    let spCodes = [];
    newStudyPlan.forEach((course) => spCodes.push(course.code));

    props.courses.forEach(course => {
      if(course.pre && (!spCodes.includes(course.pre) || newStudyPlan.length === 0)){
        course.addProblem(problem["Prerequisite"] + course.pre);
        changed.push(course);
      }
    });

    if(changed.length !== 0){
      let c = props.courses.filter((course) => {
          if(changed.includes(course))
            return false
          else return true
        });
      c = c.concat(changed);
      c.sort((a, b) => {return (a.name + '').localeCompare(b.name + '')});
      props.setCourses([...c])
    }
  }
  
  //Checks if the maximum number of students has been reached
  function maxStudCheck(){
    let c = []
    props.courses.forEach(course => { 
      if(course.max_stud === course.act){
        course.addProblem("Maximum number of students reached, you can't enroll to this course."); 
        c.push(course); 
      }
      else c.push(course);
    });
    props.setCourses([...c]);
  }

  //Wrapper function for all requisites
  function requisitesVerifier(newStudyPlan){
    cleanUpCourses();
    maxStudCheck();
    findIncomp(newStudyPlan);
    findAlreadyAdded(newStudyPlan);
    findPrereq(newStudyPlan);
  }

  //Function which update Study Plan when is a course is removed and all the controls
  function removeCourseFromSpAndChecks(courseToRemove){
    const decrement = props.courses.find(course => course.code === courseToRemove.code);
    decrement.act -= 1;
    let newStudyPlan = [];
    if(courseToRemove.hasPrerequisite()){
      const modifyCourse = studyPlan.find((c) => c.code === courseToRemove.pre);
      const studyPlanFiltered = studyPlan.filter((c) => c.code !== courseToRemove.pre);
      modifyCourse.removeProblem();
      newStudyPlan = [...studyPlanFiltered].concat(modifyCourse).sort((a, b) => {return (a.name + '').localeCompare(b.name + '')});
    }
    newStudyPlan = studyPlan.filter((e) => e.code !== courseToRemove.code);
    props.setCourses([...props.courses]);
    setStudyPlan(newStudyPlan);
    requisitesVerifier(newStudyPlan);
  }

  //Function which updates SP and make all the controls
  function updateSPAndChecks(courseToAdd1){
    let newStudyPlan = [];
    let courseToAdd = new Course(courseToAdd1.code, courseToAdd1.name, courseToAdd1.credits, courseToAdd1.max_stud, courseToAdd1.act+1, courseToAdd1.inc_courses, courseToAdd1.pre, null);
    const increment = props.courses.find(course => course.code === courseToAdd.code);
    increment.act += 1;
    if(courseToAdd.hasPrerequisite()){
      const modifyCourse = studyPlan.find((c) => c.code === courseToAdd.pre);
      const studyPlanFiltered = studyPlan.filter((c) => c.code !== courseToAdd.pre);
      modifyCourse.addProblem("This course is a prerequisite for: " + courseToAdd.name + " (" + courseToAdd.code + "). First remove it.");
      newStudyPlan = [...studyPlanFiltered].concat(modifyCourse).concat(courseToAdd).sort((a, b) => {return (a.name + '').localeCompare(b.name + '')});
    }else{
      newStudyPlan = [...studyPlan].concat(courseToAdd).sort((a, b) => {return (a.name + '').localeCompare(b.name + '')});
    }
    props.setCourses([...props.courses]);
    setStudyPlan(newStudyPlan);  
    requisitesVerifier(newStudyPlan);
  }

  useEffect(() => {
    getStudyPlan();
  }, []);

  //This is called after the submission of the sp and before makes all checks
  //if everything is ok, the API is called
  const onSubmit = async(event) => {
    event.preventDefault();
    if(creditsCount() > 80 || (creditsCount() > 40 && !checked)){
      setErr({errType: "Sorry the maximum number of credits for your study plan is " + (checked ? "80" : "40"), state: true});
      return true;
    }else if(creditsCount() < 20 || (creditsCount() < 60 && checked)){
      setErr({errType: "Sorry the minimum number of credits for your study plan is " + (checked ? "60" : "20"), state: true});
      return true;
    }else{
      let coursesCode = [];
      studyPlan.forEach((course) => {coursesCode.push(course.code)}); 
      try {
        await API.createStudyPlan(coursesCode, checked);
        await reloadStudyPlan();
        setEditMode(false)
      } catch (error) {
        setErr({errType: error.message, state: true});
      }
    }
    return false;
  };

  const reloadStudyPlan = async () => {
    await getStudyPlan();
    try {
      const c = await API.loadCourseList("/courses");
      props.setCourses(c.courseList);
    } catch (error) {
      setErr({errType: error.message, state: true});
    }
  }

  function creditsCount(){
    let credits = 0;
    studyPlan.forEach(el => {
      //console.log(el.credits)
      credits += el.credits;
    });
    return credits; //.toString();
  };

  const onDelete = async () => {
    try {
      await API.deleteStudyPlan();
      await reloadStudyPlan();
      setEditMode(false);
    } catch (error) {
      setErr({errType: error.message, state: true});
    }
  }
  return (
    <>
      <CoursesRoute getCourses={props.getCourses} setSomethingToShow={props.setSomethingToShow} somethingToShow={props.somethingToShow} updateSPAndChecks={updateSPAndChecks} editMode={editMode} setEditMode={setEditMode} courses={props.courses} setCourses={props.setCourses} loggedIn={props.loggedIn} setLoggedIn={props.setLoggedIn} studyPlan={studyPlan} setStudyPlan={setStudyPlan}/>
      <Row>
          <Row className='mb-2'>
            <Col>
              <h1>Your Study Plan</h1>
            </Col>
          </Row>
          <Row>
            <Col>
              {err.state && <Alert style={{"marginLeft" : "12.5%", "marginRight" : "12.5%"}} variant="danger" onClose={() => setErr({errType: "", state: false})} dismissible>
                <Alert.Heading>Ops! Something went wrong.</Alert.Heading>
                <p>
                  {err.errType}
                </p>
              </Alert>}
            </Col>
          </Row>
      { (studyPlan.length !== 0) ?
          <Row className='justify-content-center'>
            <Col className=''>
              <StudyPlanTable creditsCount={creditsCount} updateSPAndChecks={removeCourseFromSpAndChecks} checked={checked} setChecked={setChecked} studyPlan={studyPlan} setStudyPlan={setStudyPlan} editMode={editMode} setEditMode={setEditMode}/> 
              <div className='mb-4'>
                <Button type={editMode ? "submit" : "button"} form="myForm" style={{marginRight: "5px"}} variant={!editMode ? "warning" : "success"} onClick={(event) => {
                  const startEdit = (editMode === false) ? true : false;
                  let checkError = false;
                  if(editMode) {
                    checkError = onSubmit(event);
                  } 
                  if(!checkError){
                    if(startEdit){
                      requisitesVerifier(studyPlan); 
                    } 
                    else cleanUpCourses();
                    setEditMode(!editMode);
                  } 
                  }}>{!editMode ? "Edit" : "Save"}</Button>
                {editMode &&
                  <>
                    <Button variant="warning" onClick={() => {setEditMode(false); reloadStudyPlan()}}>Don't save updates</Button>
                    <Button style={{marginLeft: "5px"}} variant="danger" onClick={() => {onDelete();}}>Delete Plan</Button>
                  </>
                }
              </div>  
            </Col>
          </Row> :
          <Row className='justify-content-center'>
            <StudyPlanForm max={maxStudCheck} prereq={findPrereq} checked={checked} setChecked={setChecked} editMode={editMode} setEditMode={setEditMode} show={SPFormShow} onHide={() => setSPFormShow(false)}/>
          <Col className=''>
            {editMode &&
                    <Button style={{marginBottom: "15px"}} variant="danger" onClick={() => {setEditMode(false); reloadStudyPlan()}}>Cancel</Button>
            }
            {!editMode &&
              <div className='mx-auto mb-4'>
                <Alert variant="success" style={{marginLeft:"12%", marginRight:"12.5%"}}>
                  <Alert.Heading>Hey, nice to see you!</Alert.Heading>
                  <p>
                    You don't have a study plan yet, create one to start updating.
                  </p>
                  <hr />
                  <p className="mb-0">
                    <Button variant="success" onClick={() => {setSPFormShow(true);}}>Create a Study Plan</Button>
                  </p>
                </Alert>
              </div> 
            } 
          </Col>
        </Row>
      }
      </Row>
    </>
  )
}



export { CoursesRoute, DefaultRoute, LoginRoute, StudyPlanRoute };