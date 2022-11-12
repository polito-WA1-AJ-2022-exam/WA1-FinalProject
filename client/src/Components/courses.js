import { useState } from 'react';
import {Table, Button, Popover, OverlayTrigger} from 'react-bootstrap';


function CoursesTable(props){
    return <>
        <Table className='table-responsive m-auto mb-5 table-expandable' striped bordered hover variant="dark" style={{maxWidth: "75%", margin: 0}}>
            <thead>
                <tr>
                    <th>Code</th>
                    <th>Name</th>
                    <th>Credits</th>
                    <th>Max Students</th>
                    <th>Actual Students</th>
                    <th>More Info</th>
                    {props.editMode && <th>Actions</th>}
                </tr>
            </thead>
            <tbody>
            {
                props.courses.map((c) => 
                    <CourseRow updateSPAndChecks={props.updateSPAndChecks} course={c} key={c.code} editMode={props.editMode}/*deleteExam={props.deleteExam}*/studyPlan={props.studyPlan} setStudyPlan={props.setStudyPlan}/>)
            }
            </tbody>
        </Table>
    </>;
}

function CourseRow(props){
  const [info, setInfo] = useState(false);
    return(
    <>
      <tr>
          <CourseData updateSPAndChecks={props.updateSPAndChecks} studyPlan={props.studyPlan} setStudyPlan={props.setStudyPlan} info={info} setInfo={setInfo} course={props.course} editMode={props.editMode}/>
      </tr>
      {
        info && <tr><td colSpan={7}>{ props.course.inc_courses.length > 0 && "Incompatible Courses: "+props.course.inc_courses.map((c, i) => {
          if (i === props.course.inc_courses.length-1) {
            return (' '+String(c)+';')
          }  
          return ('  '+String(c))
        })} {props.course.pre && "Prerequisites: " + props.course.pre} {props.course.inc_courses.length === 0 && !props.course.pre && "Nothing more to show."}</td></tr>
      }
    </>
  );
}


function CourseData(props) {
  //const [cannotBeAdded, setCannotBeAdded] = useState({yes: false, why: ''}); //This state is used to check if a course can be added
  const updateSPAndChecks = props.updateSPAndChecks;

  const popover = (
    <Popover id="popover-basic" >
      <Popover.Header as="h3">Reason</Popover.Header>
      <Popover.Body>
        {props.course.not.problems}
      </Popover.Body>
    </Popover>
  );

  return(
      <>
        <td className={props.course.not.state ? "text-danger" : undefined}>{props.course.code}</td>
        <td className={props.course.not.state ? "text-danger" : undefined}>{props.course.name}</td>
        <td className={props.course.not.state ? "text-danger" : undefined}>{props.course.credits}</td>
        <td className={props.course.not.state ? "text-danger" : undefined}>{props.course.max_stud}</td>
        <td className={props.course.not.state ? "text-danger" : undefined}>{props.course.act}</td>
        <td><Button variant="outline-warning" onClick={() => {props.setInfo(!props.info);}}>Info</Button></td>
        {props.editMode && !props.course.not.state ? <td><Button variant="outline-success" onClick={() => updateSPAndChecks(props.course)}>Add</Button></td> :
          props.editMode && <td>
            <OverlayTrigger trigger={['hover', 'focus', 'click']} placement="left" overlay={popover}>
              <Button variant="outline-danger">Why Not?</Button>
            </OverlayTrigger>
          </td>
        }
      </>
    );
  }
export {CoursesTable};