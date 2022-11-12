import {Course} from './Course';
const SERVER_URL = 'http://localhost:3001/api';

/*This function is the one which fetches the request to get all courses from the server or only the ones of a study plan*/
async function loadCourseList(coursesOrStudyPlan) {
    const url = SERVER_URL + coursesOrStudyPlan;
    try {
        let response;
        if(coursesOrStudyPlan === "/sp"){
            response = await fetch(url, {
                credentials: 'include'
            });
        }
        else {
            response = await fetch(url);
        }
        if (response.ok) {
            const arr =  await response.json()
            const courseList = arr.courses.map((e) => new Course(e.code, e.name, e.credits, e.max_stud, e.act, e.inc_courses, e.pre, {state: false, problem: []}));
            return {courseList: courseList, f: arr.fulltime};
        }
        else {
            const text = await response.text();
            throw new TypeError(text);
        }
    } catch(err){
        throw err
    }
}

/*This function is the one which fetches the request to create a new study plan in the server*/
async function createStudyPlan(sp, fulltime) {
    const url = SERVER_URL + '/sp';
    try {
        const response = await fetch(url, {
            method : 'PUT',
            headers : {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({spCodes: sp, full: fulltime})
        });

        if (response.ok) {
            return;
        }
        else {
            const text = await response.text();
            throw new TypeError(text);
        }
    } catch(err) {
        throw err
    }
}
/*This function is the one which fetches the call to the deletion of the study plan*/
async function deleteStudyPlan() {
    const url = SERVER_URL + '/delete';
    try {
        const response = await fetch(url, {
            method : 'DELETE',
            credentials: 'include'
        });

        if (response.ok) {
            return;
        }
        else {
            const text = await response.text();
            throw new TypeError(text);
        }
    } catch(err) {
        throw err
    }
}

const logIn = async (credentials) => {
    try {
        const response = await fetch(SERVER_URL + '/sessions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(credentials),
            });
        if(response.ok) {
            const user = await response.json();
            return user;
        }
        else {
            const errDetails = await response.text();
            throw errDetails;
        }
  } catch (e) {
      throw e
  }
}

const getUserInfo = async () => {

    const response = await fetch(SERVER_URL + '/sessions/current', {
      credentials: 'include',
    });
    const user = await response.json();
    if (response.ok) {
      return user;
    } else {
      throw user;  // an object with the error coming from the server
    }
  };

const logOut = async() => {
    const response = await fetch(SERVER_URL + '/sessions/current', {
      method: 'DELETE',
      credentials: 'include'
    });
    if (response.ok)
      return null;
}

const API = {loadCourseList, createStudyPlan, deleteStudyPlan, logIn, logOut, getUserInfo};
export default API;