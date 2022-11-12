//import { useState } from 'react';
import {Table, Button, Modal, Form, Row, Col, OverlayTrigger, Popover} from 'react-bootstrap';

//Everything needs to be changed, it has been copied from coursetable
function StudyPlanTable(props){
 
    return <>
        <Row> 
          <Col><h4>Credits MIN: {props.checked ? "60" : "20"} MAX: {props.checked ? "80" : "40"} Current: {props.creditsCount()}</h4></Col>
        </Row>
        <Table className='table-responsive m-auto mb-2 table-expandable' striped bordered hover variant="dark" style={{maxWidth: "75%", margin: 0}}>
            <thead>
                <tr>
                    <th>Code</th>
                    <th>Name</th>
                    <th>Credits</th>
                    <th>Max Students</th>
                    <th>Actual Students</th>
                    {props.editMode && <th>Actions</th>}
                </tr>
            </thead>
            <tbody>
            {
                props.studyPlan.map((c) => 
                    <SpRow updateSPAndChecks={props.updateSPAndChecks} course={c} key={c.code} editMode={props.editMode} setEditMode={props.setEditMode} studyPlan={props.studyPlan} setStudyPlan={props.setStudyPlan} />)
            }
            </tbody>
        </Table>
    </>;
}

function SpRow(props){
    return(
    <>
      <tr>
          <SpData updateSPAndChecks={props.updateSPAndChecks} editMode={props.editMode} setEditMode={props.setEditMode} course={props.course} studyPlan={props.studyPlan} setStudyPlan={props.setStudyPlan}/>
      </tr>
    </>
  );
}


function SpData(props) {
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
        <td>{props.course.code}</td>
        <td>{props.course.name}</td>
        <td>{props.course.credits}</td>
        <td>{props.course.max_stud}</td>
        <td>{props.course.act}</td>
        {props.editMode && !props.course.not.state ? <td><Button variant="outline-danger" onClick={() => {updateSPAndChecks(props.course);}}>Remove</Button></td> 
        : props.editMode && props.course.not.state && <td>
        <OverlayTrigger trigger={['hover', 'focus', 'click']} placement="left" overlay={popover}>
          <Button variant="outline-danger">Why Not?</Button>
        </OverlayTrigger>
      </td>}
      </>
    );
  }

function StudyPlanForm(props){
  const findPrereq = props.prereq;
  const maxStudCheck = props.max;
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
            Create Your Study Plan
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <Form id="myform">
                <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
                  <Form.Check
                    type="checkbox"
                    label="Full-Time"
                    checked={props.checked}
                    onChange={() => props.setChecked(!props.checked)}
                  />
                </Form.Group>
            </Form> 
        </Modal.Body>
        <Modal.Footer>
          <Button variant="danger" onClick={props.onHide}>Not Now</Button>
          <Button variant="success" onClick={() => {props.setEditMode(true); findPrereq([]); maxStudCheck(); props.onHide();}}>
                Start Adding Courses
          </Button>
        </Modal.Footer>
      </Modal>
    );
}
export {StudyPlanTable, StudyPlanForm};