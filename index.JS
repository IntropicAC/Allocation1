
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
  { name: 'GH', staff: 1, type: 3 },

];

// Get the total number of staff in observations and multiply by 12
const totalObs = observations.reduce((sum, observation) => sum + observation.staff, 0) * 12;

// Get the number of staff in people
const numStaffMembers = staff.length;

// Calculate maxObsPerStaffMember
const maxObs = Math.floor(totalObs / numStaffMembers);

console.log(totalObs);



// Function to shuffle an array
function shuffle(array) {
  let newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
}

function allocateStaff(staff, observations, numIterations) {
  for(let iteration = 0; iteration < numIterations; iteration++) {
    // Clone and shuffle the observations array
    let observationsList = shuffle([...observations]);

    // Assign staff to observations
    observationsList.forEach(observation => {
      let staffNeeded = observation.staff;

      staff.forEach(staffMember => {
        // Check if this staff member can take more observations
        let totalObsForThisStaff = staffMember.type1 + staffMember.type2 + staffMember.type3 + staffMember.type4;
			
 				let maxType = 0;
      	if (totalObs < 48){
         maxType = totalObs;
        } else {
         maxType = totalObs / 2;
        }
        // Check if staff member has already 4 observations of the current type
        let alreadyHasFourOfThisType;
        switch(observation.type) {
          case 1: alreadyHasFourOfThisType = staffMember.type1 >= maxType; break;
          case 2: alreadyHasFourOfThisType = staffMember.type2 >= maxType; break;
          case 3: alreadyHasFourOfThisType = staffMember.type3 >= maxType; break;
          case 4: alreadyHasFourOfThisType = staffMember.type4 >= maxType; break;
          default: console.log("Unknown type!");
        }

        // Only assign observation if staff member doesn't have 4 of this type already
        if(staffNeeded > 0 && totalObsForThisStaff < maxObs && !alreadyHasFourOfThisType) {
          staffMember.numObservations++;

          // Update the type
          switch(observation.type) {
            case 1: staffMember.type1++; break;
            case 2: staffMember.type2++; break;
            case 3: staffMember.type3++; break;
            case 4: staffMember.type4++; break;
            default: console.log("Unknown type!");
          }

          staffNeeded--;
        }
      });

      if (staffNeeded > 0) {
        console.log(`Observation ${observation.name} requires ${staffNeeded} more staff.`);
      }
    });
  }

  // Return the updated staff array
  return staff;
}

// Test the function with your data
console.log(allocateStaff(staff, observations, 12));
