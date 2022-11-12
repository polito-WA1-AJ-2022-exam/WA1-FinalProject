//const sqlite = require('sqlite3');
const problem = {
    "Already" : "This course is already in the Study Plan, can't add it anymore.",
    "Incompatible" : "This course is incompatible with: ",
    "Prerequisite" : "This course has this prerequisite: ",
};

class Course {
    constructor(code, name, credits, max_stud, act, inc_courses, pre, _){
        this.code = code;
        this.name = name;
        this.credits = credits;
        this.max_stud = max_stud;
        this.act = act;
        this.inc_courses = inc_courses;
        this.pre = pre;
        this.not = {state: false, problems: []};
    }

    addProblem(problem){
        this.not.problems.push(problem);
        this.not.state = true;
    }

    removeProblem(){
        this.not.problems = [];
        this.not.state = false;
    }

    showAllProblems(){
        if(this.not.problems.length !== 0){
            let string = '';
            this.not.problems.forEach((problem) => string = string + problem + '. ')
        }
    }

    hasPrerequisite(){
        return this.pre !== null;
    }
};

module.exports = {Course, problem};