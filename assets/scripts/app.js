// handles the more info button
class ToolTip{

}
//handle the project
class ProjectItem{

}
// create multiple instance for the different list we will have
class ProjectList{
    constructor(type){
        // this will get all list of items from the id from each section from the html 
        const prjItems = document.querySelectorAll(`#${type}-projects li`);
        console.log(prjItems);
    }
}

class App {
    static init(){
        // creates list for active projects (active is the type parameter from the ProjectList contsructor)
        const activeProjectList = new ProjectList('active')
        //creates list for finsihed projects
        const finishedProjectList = new ProjectList('finished')
    }
}
App.init()