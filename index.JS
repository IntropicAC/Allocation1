
   /* window.onload = function() {
        var button = document.getElementById("modernButton");
      
        button.addEventListener("click", function() {
          button.classList.add("shrink");
      
          setTimeout(function() {
            button.parentNode.removeChild(button);
          }, 375);
        });
      };

/*     Allocation code      
const people = [
  { staff: 'Alex',   break: 14, numObservations: 0 },
  { staff: 'Adam',   break: 14, numObservations: 0 },
  { staff: 'Angila', break: 15, numObservations: 0 },
  { staff: 'Angel',  break: 15, numObservations: 0 },
  { staff: 'Jack',   break: 16, numObservations: 0 },
  { staff: 'Jill',   break: 16, numObservations: 0 },
  { staff: 'Jade',   break: 17, numObservations: 0 },
  { staff: 'Fill',   break: 17, numObservations: 0 },
  { staff: 'Ben',    break: 19, numObservations: 0 },
  { staff: 'Jerry',  break: 19, numObservations: 0 }
      ];
      
const observation = [
  { name: 'BW', staff: 3 },
  { name: 'Generals', staff: 1 },
  { name: 'KP', staff: 1 },
  { name: 'GO', staff: 2 }
      ];
      
const numHours = 12;
      
function allocation(people, observations){

  
  let randomNumber = Math.random(Math.floor()) * people.length;
} */

const staff = [
  { name: 'Alex',   break: 14, numObservations: 0, type1: 0, type2: 0, type3: 0, type4: 0 },
  { name: 'Adam',   break: 14, numObservations: 0, type1: 0, type2: 0, type3: 0, type4: 0 },
  { name: 'Angila', break: 15, numObservations: 0, type1: 0, type2: 0, type3: 0, type4: 0 },
  { name: 'Angel',  break: 15, numObservations: 0, type1: 0, type2: 0, type3: 0, type4: 0 },
  { name: 'Jack',   break: 16, numObservations: 0, type1: 0, type2: 0, type3: 0, type4: 0 },
];

const observations = [

  { name: 'Generals', staff: 1, type: 1 },
  { name: 'KP', staff: 1, type: 2 },
  { name: 'GH', staff: 2, type: 3 },

];

// Get the total number of staff in observations and multiply by 12
const totalObs = observations.reduce((sum, observation) => sum + observation.staff, 0) * 12;

// Get the number of staff in people
const numStaffMembers = staff.length;

// Calculate maxObsPerStaffMember
const maxObs = Math.floor(totalObs / numStaffMembers);

console.log(totalObs);
console.log(maxObs);



// Function to shuffle an array
function shuffle(array) {
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return array;
}

function allocateStaff(staff, observations, totalObs) {
    // Create a map to store the observations that each staff member has had.
    let observationsReceived = {};

// Iterate over the staff members.
    for (let i = 0; i < staff.length; i++) {
// Initialize the map for the current staff member.
observationsReceived[staff[i].name] = [];

// Iterate over the observations.
for (let j = 0; j < observations.length; j++) {

  // If the staff member has already had this observation in the last 2 hours, skip it.
  if (observationsReceived[staff[i].name].includes(observations[j]) 
  && j <= observationsReceived[staff[i].name].length - 2) {
    continue;
  }

  // Add the observation to the list of observations that the staff member has had.
  observationsReceived[staff[i].name].push(observations[j]);
}
}

// Assign the staff to the observations.
for (let i = 0; i < staff.length; i++) {
staff[i].observation = observationsReceived[staff[i].name].pop();
}
console.log(observationsReceived);
// Return the assigned staff.
return staff;

};

allocateStaff();