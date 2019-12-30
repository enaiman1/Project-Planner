const intervalId = setInterval(()=>{
    console.log("sending Analytics..")
},2000);

document.getElementById('stop-analytics-btn').addEventListener('click', ()=>{
    clearInterval(intervalId);
});