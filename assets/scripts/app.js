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
        // will smoothily scroll the new appended item into view
        element.scrollIntoView({ behavior: 'smooth' })
    }
}

class Component {
    constructor(hostElementId, insertBefore = false) {
        if (hostElementId) {
            this.hostElement = document.getElementById(hostElementId);
        } else {
            this.hostElement = document.body
        }
        this.insertBefore = insertBefore;
    }

    detach() {
        if (this.element) {
            this.element.remove();
            // this.element.parentElement.removeChild(this.element)
        }

    }
    attach() {
        this.hostElement.insertAdjacentElement(this.insertBefore ? 'afterbegin' : 'beforeend', this.element)

    }
}

// handles the more info button
class ToolTip extends Component {
    constructor(closeNotifierFunction, text, hostElementId) {
        super(hostElementId);
        this.closeNotifier = closeNotifierFunction;
        this.text = text
        this.create()
    }

    closeToolTip = () => {
        this.detach();
        this.closeNotifier()
    }

    create() {
        const tooltipElement = document.createElement('div')
        tooltipElement.className = 'card';
        const tooltipTemplate = document.getElementById('tooltip')
        // this pass the content and creat a new node based on that
        const tooltipBody = document.importNode(tooltipTemplate.content, true);
        tooltipBody.querySelector('p').textContent = this.text;
        tooltipElement.append(tooltipBody)

        // reads the positioning for the more info tool
        const hostElPosLeft = this.hostElement.offsetLeft;
        const hostElPosTop = this.hostElement.offsetTop;
        const hostElHeight = this.hostElement.clientHeight;
        const parentElementScrolling = this.hostElement.parentElement.scrollTop

        const x = hostElPosLeft + 20;
        const y = hostElPosTop + hostElHeight - parentElementScrolling - 10;

        //using css to assign new value
        tooltipElement.style.position = 'absolute'
        tooltipElement.style.left = x + 'px'
        tooltipElement.style.top = y + 'px';

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
        this.connectDrag()
    }


    showMoreInfoHandler() {
        if (this.hasActiveToolTip) {
            return;
        }
        const projectElement = document.getElementById(this.id);
        const tooltipText = projectElement.dataset.extraInfo;
        const tooltip = new ToolTip(() => {
            this.hasActiveToolTip = false;

        },
            tooltipText,
            this.id)
        tooltip.attach()
        this.hasActiveToolTip = true;
    }

connectDrag(){
document.getElementById(this.id).addEventListener('dragstart', event =>{
    event.dataTransfer.setData('text/plain', this.id);
    event.dataTransfer.effectAllowed = 'move';
});
}

    connectMoreInfoButton() {
        const projectItemElement = document.getElementById(this.id);
        const moreInfoBtn = projectItemElement.querySelector('button:first-of-type');
        moreInfoBtn.addEventListener('click', this.showMoreInfoHandler.bind(this))
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
        this.connectDroppable();
    }

    connectDroppable(){
        const list = document.querySelector(`#${this.type}-projects ul`);

        list.addEventListener('dragenter', event => {
            if (event.dataTransfer.types[0] === 'text/plain'){
              event.preventDefault();  
            }   
            list.parentElement.classList.add('droppable')
        });

        list.addEventListener('dragover', event => {
            if (event.dataTransfer.types[0] === 'text/plain'){
                event.preventDefault();  
              }   
        });

        list.addEventListener('dragleave', event =>{
            if(event.relatedTarget.closest(`#${this.type}-projects ul`)!== list){
                list.parentElement.classList.remove('droppable');
            }
            
        })

        list.addEventListener('drop', event => {
            const prjId = event.dataTransfer.getData('text/plain');
            if(this.projects.find(p =>p.id === prjId)){
                return;
            }
            document
            .getElementById(prjId)
            .querySelector('button:last-of-type')
            .click()
            list.parentElement.classList.remove('droppable');
            // event.preventDefault();
        })
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
 
    // const timerId = setTimeout(this.startAnalytics, 3000);
    // document.getElementById('stop-analytics-btn').addEventListener('click', ()=>{
    //     clearTimeout(timerId);
    // })
    }
    // this will load the analytics.js file dynamically
    static startAnalytics(){
        const analyticsScript = document.createElement('script');
        analyticsScript.src = 'assets/scripts/analytics.js'
        analyticsScript.defer = true;
        document.head.append(analyticsScript);
    }
}
App.init()