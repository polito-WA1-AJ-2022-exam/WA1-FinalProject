'use strict';
const db = require('./dbLib').allFunct;
const express = require('express');
const PORT = 3001;
const morgan = require('morgan');
const cors = require('cors');

// Passport-related imports
const passport = require('passport');
const LocalStrategy = require('passport-local');
const session = require('express-session');

const {  validationResult, body} = require('express-validator');

const app = express();
app.use(morgan('common'));
app.use(express.json());
// set up and enable cors
const corsOptions = {
    origin: 'http://localhost:3000',
    credentials: true,
};

app.use(cors(corsOptions));
app.listen(PORT, ()=> console.log(`Server running on http://localhost:${PORT}/`));

passport.use(new LocalStrategy(async function verify(username, password, cb) {
    const user = await db.getLoginUser(username, password)
    if(!user)
      return cb(null, false, 'Incorrect username or password.');
    return cb(null, user);
  }));

passport.serializeUser(function (user, cb) {
    cb(null, user);
  });
  
passport.deserializeUser(async function (user, cb) { // this user is id + email + name
    
    return cb(null, user);
    // if needed, we can do extra check here (e.g., double check that the user is still in the database, etc.)
  });

app.use(session({
    secret: "Viva gli scout",
    resave: false,
    saveUninitialized: false,
  }));

app.use(passport.authenticate('session'));

app.post('/api/sessions',
  body('username').isEmail(),
  body('password').notEmpty(),
function(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    passport.authenticate('local', (err, user, info) => {
      if (err)
        return next(err);
        if (!user) {
          // display wrong login messages
          return res.status(401).send(info);
        }
        // success, perform the login
        req.login(user, (err) => {
          if (err)
            return next(err);
          // req.user contains the authenticated user, we send all the user info back
          const userInfo = {name: req.user.name, full: req.user.full}
          return res.status(201).json(userInfo);
        });
    })(req, res, next);
});

app.get('/api/sessions/current', (req, res) => {
if(req.isAuthenticated()) {
    const userInfo = {name: req.user.name , full: req.user.full}
    res.json(userInfo);}
else
    res.status(401).json({error: 'Not authenticated'});
});

// DELETE /api/session/current
app.delete('/api/sessions/current', (req, res) => {
    req.logout(() => {
        console.log("Deleting sessions...")
        res.end();
    });
});

const isLoggedIn = (req, res, next) => {
    if(req.isAuthenticated()) {
      return next();
    }
    return res.status(401).json({error: 'Not authorized'});
  }


/*Retrieve an array of all courses available*/
app.get('/api/courses',(_,res) => {
    db.getCourses().then((courses) => {
        return res.status(200).json({courses: courses, fulltime: null})
    }).catch((err) => {
        return res.status(500).json(err)
    })
})

app.use(isLoggedIn)

/*Retrieve an array of all courses belonging to a user study plan*/
app.get('/api/sp',async (req,res) => {
    const user = req.user.stud_id; 
    let fulltime = await db.hasStudyPlan(user);
    db.getStudyPlan(user).then((courses) => {
        return res.status(200).json({courses: courses, fulltime: fulltime})
    }).catch((err) => {
        return res.status(500).json(err)
    })
})

/*Push a study plan into the db (creating it if there 
  is none or updating an existing one*/
app.put('/api/sp',async (req, res) => {
    const user = req.user.stud_id; //Remove this one after implementing login with passport
    const spCodes = req.body.spCodes;
    const allCourses = await db.getCourses();
    const fullSp = allCourses.filter((course) => spCodes.includes(course.code));
    let isNull = false;

    //All Checks
        //Is there a sp?
    let fulltime = await db.hasStudyPlan(user); 
    if(fulltime === -1){
        isNull = true;
        fulltime = req.body.full;
    }
     
        //Check credits
    let creditsNum = 0;
    fullSp.forEach(course => {
        creditsNum += course.credits;
    });
    if(creditsNum > 80 || (creditsNum > 40 && !fulltime)){
        return res.status(422).json("Your credits must be less then " + (fulltime ? "80" : "40"));
    }else if(creditsNum < 20 || (creditsNum < 60 && fulltime)){
        return res.status(422).json("Your credits must be at least: " + (fulltime ? "60" : "20"));
    }
        
        //Check Prereq or Incomp - and Max_Stud
    let prereq = [];
    let incomp = [];
    for (const course of fullSp) {
        if(course.pre !== null)
            prereq.push(course.pre);
        if(course.inc_courses.length !== 0)
            incomp.concat(course.inc_courses);
    }

    for (const pre of prereq) {
        if(!spCodes.includes(pre)){
            return res.status(422).json("You should have also this course in your study plan: " + pre);
        }
    }

    for (const inc of incomp) {
        if(spCodes.includes(inc)){
            return res.status(422).json("You can't have this course in your study plan: " + inc + ". Since it is incompatible with another.");
        }
    }

    //If there is no study plan, just push it
    if(isNull){
      try {
        await db.createStudyPlan(user, fulltime);
      } catch (error) {
        return res.status(500).json(error);
      }
    }
    try {
        await db.updateStudyPlanDeletion(user, spCodes);
        const oldSP = await db.getStudyPlan(user);
        const oldSpCodes = oldSP.map((course) => course.code);
        const toAdd = fullSp.filter(course => !oldSpCodes.includes(course.code));
        const toAddCodes = toAdd.map(course => course.code);    

        for (const course of toAdd) {
            if(course.act === course.max_stud){           
                return res.status(422).json("The maximum number of students for this course has been reached. (" + course.name + ")");
            }
        }        
        for (const code of toAddCodes) {
            await db.addCourseStudyPlan(user, code);        
        }
        return res.status(200).json()
    } catch (error) {
        return res.status(500).json(error);
    }    
})

/*This API delete a StudyPlan of a certain user if it is 
  present and the user loggedIn */
app.delete('/api/delete',async (req, res) => {
    const user = req.user.stud_id;
    db.updateStudyPlanDeletion(user, []).then(() => {
        return res.status(200).json();
    }).catch((err) => {
        return res.status(500).json(err)
    })
})