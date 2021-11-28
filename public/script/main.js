// const mongoose = require('../../mongo');
var myNodelist = document.getElementsByTagName("LI");
var i;
var task_list = [];
for (i = 0; i < myNodelist.length; i++) {
  var span = document.createElement("SPAN");
  var txt = document.createTextNode("\u00D7");
  span.className = "close";
  span.appendChild(txt);
  myNodelist[i].appendChild(span);
}

// Click on a close button to remove the current list item
var close = document.getElementsByClassName("close");
var i;
for (i = 0; i < close.length; i++) {
  close[i].onclick = function () {
    var a = document.getElementById("myUL");
    var div = this.parentElement;
    a.removeChild(div);
  }
}

// Add a "checked" symbol when clicking on a list item
var list = document.querySelector('ul');
list.addEventListener('click', function (ev) {
  if (ev.target.tagName === 'LI') {
    ev.target.classList.toggle('checked');
  }
}, false);

// Create a new list item when clicking on the "Add" button
function newElement() {
  var li = document.createElement("li");
  var inputValue = document.getElementById("addTask").value;
  console.log(inputValue);
  task_list.push(inputValue);
  let hidden = document.getElementById("hidden_task");
  hidden.value = JSON.stringify(task_list);
  var t = document.createTextNode(inputValue);
  li.appendChild(t);
  if (inputValue === '') {
    alert("You must write something!");
  } else {
    document.getElementById("myUL").appendChild(li);
  }
  document.getElementById("addTask").value = "";
  // await kitten.findOneAndUpdate
  var span = document.createElement("SPAN");
  var txt = document.createTextNode("\u00D7");
  span.className = "close";
  span.appendChild(txt);
  li.appendChild(span);

  for (i = 0; i < close.length; i++) {
    close[i].onclick = function () {
      var div = this.parentElement;
      let str = div.textContent.slice(0, -1); 
      const index = task_list.indexOf(str);
      //console.log(div.textContent);
      if (index > -1) {
        task_list.splice(index, 1);
      }
      //console.log(div);
      div.style.display = "none";
      let hidden = document.getElementById("hidden_task");
      hidden.value = JSON.stringify(task_list);
    }
  }
  console.log(task_list);
}
