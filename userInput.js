let staff = [];

document.getElementById('userForm').addEventListener('submit', function(event) {
    event.preventDefault();
    
    let name = document.getElementById('name').value;
    let breakTimes = Array.from(document.getElementById('break').selectedOptions)
    .map(option => parseInt(option.value.split(':')[0], 10));

    

    let person = {
        name: name,
        breaks: breakTimes
    };

    staff.push(person);
    
    updateStaffList();
    console.log(staff)
    this.reset();
});

function updateStaffList() {
    let staffList = document.getElementById('peopleList');
    staffList.innerHTML = '';
    
    staff.forEach((person, index) => {
        let listItem = document.createElement('li');
        listItem.textContent = `${index + 1}. ${person.name} - Break: ${person.breaks.join(', ')}`;
        staffList.appendChild(listItem);
    });
}

// Generate options for each hour between 8:00 and 19:00
let breakSelect = document.getElementById('break');
for (let hour = 8; hour <= 19; hour++) {
    let hourStr = hour.toString().padStart(2, '0') + ':00';
    let option = document.createElement('option');
    option.value = hourStr;
    option.text = hourStr;
    breakSelect.appendChild(option);
}

function removeStaff(){
			
      let staffList = document.getElementById('peopleList');
      
      staff.forEach((person, index)=>{
      
      })
}

