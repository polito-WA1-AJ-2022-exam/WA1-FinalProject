const sqlite = require('sqlite3');
const crypto = require('crypto');
class Course {
    constructor(code, name, credits, max_stud, act, inc_courses,pre){
        this.code = code;
        this.name = name;
        this.credits = credits;
        this.max_stud = max_stud;
        this.act = act;
        this.inc_courses = inc_courses;
        this.pre = pre;
    }
};

const db = new sqlite.Database(('courses.db'), (err) => {
    if (err)
        throw err;
});

/*This function retrieves information about the user.*/
const getLoginUser = (email, password) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM student WHERE email = ?';
        db.get(sql, [email], (err, row) => {
          if (err) { 
            reject(err); 
          }
          else if (row === undefined) { 
            resolve(false); 
          }
          else {
            const user = {stud_id: row.stud_id, username: row.email, name: row.name, full : row.full};
            crypto.scrypt(password, row.salt, 32, function(err, hashedPassword) {
              if (err) reject(err);
              if(!crypto.timingSafeEqual(Buffer.from(row.password, 'hex'), hashedPassword)){
                resolve(false);
              }
              else
                resolve(user);
            });
          }
        });
      });
}

/*This function retrieve all courses from the DB 
  and their incompatibilities and resolve an array
  of Courses*/
const getCourses = () => {
    return new Promise(async (resolve, rej) =>{
        const courseList = [];
        try {
            const courses = await new Promise((resolve, reject) =>{
                const sqlQuery = 'SELECT * FROM course c ORDER BY c.name';
                db.all(sqlQuery, [],(err, rows) => {
                    if(err)
                        reject(err);
                    resolve(rows);
                })
            });
            
            for (const course of courses) {
                await new Promise((resolve, reject) =>{
                    const sqlQuery = 'SELECT incomp FROM incompatibility i WHERE i.course = ?';
                    db.all(sqlQuery, [course.code],(err, rows) => {
                        if(err)
                            reject(err);
                        resolve(courseList.push(new Course(course.code, course.name, course.credits, course.max_stud, course.act, rows.map((row) => row.incomp), course.pre)));
                    });
                });
            }
        } catch (error) {
            rej(error);
        }
        resolve(courseList);
    })
}

/*This function retrieve all courses from the DB 
  related to a study plan of a user, it resolves an array
  of Courses*/
  const getStudyPlan = (user) => {
    return new Promise((resolve, reject) =>{
        const sqlQuery = 'SELECT * FROM course c WHERE c.code IN (SELECT course FROM study_plan WHERE student = ?)';
        db.all(sqlQuery, [user],(err, rows) => {
            if(err)
                reject(err);
            resolve(rows);
        });
    });
}

/*This function create a new study plan for a certain user.*/
  const createStudyPlan = (user, fulltime) => {
    let f = -1;
    if(fulltime){
        f = 1;
    }else f = 0; 
    return new Promise((resolve, reject) => {
        const sqlUpdateFulltime = "UPDATE STUDENT SET full = ? WHERE stud_id = ?";
        db.run(sqlUpdateFulltime, [f, user], (err) => {
            if (err){
                console.log('ERROR: ' + err)
                reject(err);
            }
            resolve(true);
        })
    })
  }

  /*This function update a new study plan for a certain user
   *by deleting courses which are not present anymore.*/
  const updateStudyPlanDeletion = (user, sp) => {
    return new Promise(async (resolve, reject) => {
        const oldSP = await getStudyPlan(user);
        for (const c of oldSP) {
            if(!sp.includes(c.code)){
                const sqlDelete = "DELETE FROM STUDY_PLAN WHERE student = ? AND course = ?"
                db.run(sqlDelete, [user, c.code],(err) => {
                    if(err)
                        reject(err);
                    const sqlUpdate = "UPDATE COURSE SET act = act - 1 WHERE code = ?";
                    db.run(sqlUpdate, [c.code], (err) => {
                        if(err)
                            reject(err);
                    })
                });
            }
        }
        resolve(true);        
    })
  }

  /*This function add a new course to the study plan for a certain user.
    It also increment the value of actual students enrolled to a certain course.
  */
  const addCourseStudyPlan = (user, course) => {
    return new Promise((resolve, reject) => {
        const sqlInsert = "INSERT INTO STUDY_PLAN (student, course) VALUES (?, ?)"
        db.run(sqlInsert, [user, course],(err) => {
            if(err)
                reject(err);
            const sqlUpdate = "UPDATE COURSE SET act = act + 1 WHERE code = ?";
            db.run(sqlUpdate, [course], (err) => {
                if(err)
                    reject(err);
            })
        });
        resolve(true);        
    });
  }
  
/*This function checks if the student has a study plan or not, if he
  has it, returns its value, otherwise returns undefined.*/
  const hasStudyPlan = (user) => {
    return (new Promise((resolve, reject) =>{
        const sqlRetrieve = "SELECT full FROM STUDENT WHERE stud_id = ?";
        db.all(sqlRetrieve, [user], (err, rows) => {
            if (err){
                console.log('ERROR: ' + err)
                reject(err);
            }
            if(rows[0].full === -1)
                resolve(-1);
            else if(rows[0].full === 1)
                resolve(true);
            else resolve(false);
            
        })
    }));
  }
const allFunct = {getCourses, getStudyPlan, createStudyPlan, updateStudyPlanDeletion, addCourseStudyPlan, hasStudyPlan, getLoginUser};

module.exports = {allFunct};