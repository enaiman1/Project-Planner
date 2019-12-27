// handles the more info button
class ToolTip {

}
//handle the project
class ProjectItem {
    constructor(id) {
        this.id = id;
        this.connectMoreInfoButton;
        this.connectSwitchButton;
    }

    connectMoreInfoButton() {

    }

    connectSwitchButton() {
        const projectItemEl = document.getElementById(this.id);
        const switchBtn = projectItemEl.querySelector('button:last-of-type');
        switchBtn.addEventListener('click')
    }
}
// create multiple instance for the different list we will have
class ProjectList {
    projects = []

    constructor(type) {
        this.type = type
        // this will get all list of items from the id from each section from the html 
        const prjItems = document.querySelectorAll(`#${type}-projects li`);
        for (const prjItem of prjItems) {
            this.projects.push(new ProjectItem(prjItem.id));
        }
        console.log(this.projects)
    }

    setSwitchHandlerFunction(switchHandlerFunction){
        this.switchHandler = switchHandlerFunction;
    }
    // this method will take the item and move it to its new list
    addProject() {

    }

    // this mehtod helps remove an item from its current list
    switchProject(projectId) {
      

        this.switchHandler(this.projects.find(p => p.id  === projectId))
        // will keep all items true except for the id in the array we are currently looking at which wil remove it
        this.projects = this.projects.filter(p => p.id !== projectId)
    }
}

class App {
    static init() {
        // creates list for active projects (active is the type parameter from the ProjectList contsructor)
        const activeProjectList = new ProjectList('active', )
        //creates list for finsihed projects
        const finishedProjectList = new ProjectList('finished')
        activeProjectsList.setSwitchHandlerFunction(finishedProjectList.addProject.bind(finishedProjectList))
    
    }
}
App.init()