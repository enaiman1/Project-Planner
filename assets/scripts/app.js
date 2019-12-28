// this class will help move the DOM node
class DOMHelper {
    static clearEventListeners(element) {
        const clonedElement = element.cloneNode(true);
        element.replaceWith(clonedElement);
        return clonedElement;
    }

    static moveElement(elementId, newDestinationSelector) {
        const element = document.getElementById(elementId);
        const destinationElement = document.querySelector(newDestinationSelector);
        destinationElement.append(element);
    }
}

class Component {
constructor(hostElementId, insertBefore=false){
    if(hostElementId){
        this.hostElement = document.getElementById(hostElementId);
    }else{
        this.hostElement=document.body
    }
    this.insertBefore=insertBefore;
}

    detach() {
        if(this.element){
            this.element.remove();
            // this.element.parentElement.removeChild(this.element)
        }
  
    }
    attach() {
      this.hostElement.insertAdjacentElement(this.insertBefore ? 'afterbegin' : 'beforeend', this.element)

    }
}

// handles the more info button
class ToolTip extends Component{
    constructor(closeNotifierFunction) {
        super();
        this.closeNotifier = closeNotifierFunction;
        this.create()
    }

    closeToolTip = () => {
        this.detach();
        this.closeNotifier()
    }

    create(){
        const tooltipElement = document.createElement('div')
        tooltipElement.className = 'card';
        tooltipElement.textContent = 'Dummy!'
        tooltipElement.addEventListener('click', this.closeToolTip);
        this.element = tooltipElement;
    }


}
//handle the project
class ProjectItem {
    hasActiveToolTip = false;

    constructor(id, updateProjectListsFunction, type) {
        this.id = id;
        this.updateProjectListsHandler = updateProjectListsFunction;
        this.connectMoreInfoButton();
        this.connectSwitchButton(type);
    }


    showMoreInfoHandler() {
        if (this.hasActiveToolTip) {
            return;
        }
        const tooltip = new ToolTip(() => {
            this.hasActiveToolTip = false;
        })
        tooltip.attach()
        this.hasActiveToolTip = true;
    }

    connectMoreInfoButton() {
        const projectItemElement = document.getElementById(this.id);
        const moreInfoBtn = projectItemElement.querySelector('button:first-of-type');
        moreInfoBtn.addEventListener('click', this.showMoreInfoHandler)
    }

    // this method handles the click event 
    connectSwitchButton(type) {
        const projectItemElement = document.getElementById(this.id);
        let switchBtn = projectItemElement.querySelector('button:last-of-type');
        switchBtn = DOMHelper.clearEventListeners(switchBtn);
        switchBtn.textContent = type === 'active' ? 'Finish' : 'Activate';
        switchBtn.addEventListener(
            'click',
            this.updateProjectListsHandler.bind(null, this.id)
        );
    }
    update(updateProjectListsFn, type) {
        this.updateProjectListsHandler = updateProjectListsFn;
        this.connectSwitchButton(type);
    }
}
// create multiple instance for the different list we will have
class ProjectList {
    projects = [];

    constructor(type) {
        this.type = type;
        const prjItems = document.querySelectorAll(`#${type}-projects li`);
        for (const prjItem of prjItems) {
            this.projects.push(
                new ProjectItem(prjItem.id, this.switchProject.bind(this), this.type)
            );
        }
        console.log(this.projects);
    }

    setSwitchHandlerFunction(switchHandlerFunction) {
        this.switchHandler = switchHandlerFunction;
    }
    // this method will take the item and move it to its new list
    addProject(project) {
        this.projects.push(project);
        DOMHelper.moveElement(project.id, `#${this.type}-projects ul`);
        project.update(this.switchProject.bind(this), this.type);
    }

    // this mehtod helps remove an item from its current list
    switchProject(projectId) {


        this.switchHandler(this.projects.find(p => p.id === projectId))
        // will keep all items true except for the id in the array we are currently looking at which wil remove it
        this.projects = this.projects.filter(p => p.id !== projectId)
    }
}

class App {
    static init() {
        // creates list for active projects (active is the type parameter from the ProjectList contsructor)
        const activeProjectList = new ProjectList('active')
        //creates list for finsihed projects
        const finishedProjectList = new ProjectList('finished')
        activeProjectList.setSwitchHandlerFunction(
            finishedProjectList.addProject.bind(finishedProjectList)
        );
        finishedProjectList.setSwitchHandlerFunction(
            activeProjectList.addProject.bind(activeProjectList)
        );
    }
}
App.init()